import * as core from '@actions/core'
import * as github from "@actions/github"
import { Octokit, } from "octokit";
import { CommentTypes } from './types/CommentTypes';

async function getTargetPrData(targetOwner: string, targetRepo: string, targetBranch: string) {
  const api = new Octokit({
    auth: core.getInput('root_token'),
  });

  // Get target pull request's data
  const { data } = await api.rest.pulls.list({
    owner: targetOwner,
    repo: targetRepo,
    head: targetOwner + ":" + targetBranch,
    sort: "updated",
    state: "all"
  })

  console.log(targetOwner, targetRepo, targetBranch)

  if (data.length === 0) return null;
  const prData = data[0]
  return prData;
}

async function removePreviousBotComment() {
  const api = new Octokit({ auth: core.getInput('ci_token') });

  const { data } = await api.rest.issues.listComments({
    owner: github.context.issue.owner,
    repo: github.context.issue.repo,
    issue_number: github.context.issue.number
  })

  let comment_id;

  for (let comment of data) {
    if (comment.body.includes("xotoscript action info")) {
      comment_id = comment.id;
      break;
    }
  }

  if (comment_id === undefined) return;

  await api.rest.issues.deleteComment({
    owner: github.context.issue.owner,
    repo: github.context.issue.repo,
    comment_id
  })
}

async function pushCommentOnPr(targetPrDataList: CommentTypes[]) {
  const api = new Octokit({ auth: core.getInput('ci_token') });

  let body = `## xotoscript action info \n`

  for (let targetPrData of targetPrDataList) {
    body += `#### [${targetPrData.repo} - ${targetPrData.title}](${targetPrData.html_url})\n**pull request status**: ${targetPrData.state}\n**pipeline status**:\n![worflow](https://github.com/${targetPrData.owner}/${targetPrData.repo}/actions/workflows/${core.getInput('target_workflow')}/badge.svg?branch=${targetPrData.branch})\n`
  }

  await api.rest.issues.createComment({
    owner: github.context.issue.owner,
    repo: github.context.issue.repo,
    issue_number: github.context.issue.number,
    body
  })
}

async function run(): Promise<void> {
  try {
    const owner = core.getInput('target_owner');
    const submodules = core.getMultilineInput("target_submodules")
    const targetBranch = core.getInput("target_branch")
    const targetPrDataList = []

    for (let submodule of submodules) {
      const targetPrData = await getTargetPrData(owner, submodule, targetBranch)
      if (targetPrData) targetPrDataList.push({ ...targetPrData, owner: owner, repo: submodule, branch: targetBranch })
    }

    await removePreviousBotComment()
    await pushCommentOnPr(targetPrDataList)

  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
