# Xotoscript action submodules

### Summary

When working with a repository that has multiple submodules, it can be difficult to keep track of changes and pipelines across all submodules. 

This can lead to inefficiencies and errors in the development process. To address this problem, we have created a custom GitHub action that automatically creates a bot comment in the root pull request, listing all pull requests of submodules, including their status and pipeline.

### Description

To use this action, follow these steps:

1. Add a job with this action in your workflow file:

```yaml
custom-action:
  runs-on: ubuntu-latest
  container:
    image: node:16
    options: --user root
  steps:
    - name: Checkout root repo
      uses: actions/checkout@v3
      with:
        repository: xotoscript/xotoscript-action-submodules
        token: ${{ secrets.GH_PAT }}
    - name: Sync submodules changelog
      uses: ./
      with:
        ci_token: ${{ secrets.GITHUB_TOKEN }}
        root_token: ${{ secrets.GH_PAT }}
        target_owner: xotoscript
        target_submodules: |
          xotoscript-submodule-1
          xotoscript-submodule-2
        target_branch: ${{ github.head_ref || github.ref_name }}
        target_workflow: ci-workflow.yml
```

1. In the job, specify the required inputs:
- **`ci_token`**: a GitHub token for the CI.
- **`root_token`**: a personal access token with the **`repo`** scope to access all repos of the organization.
- **`target_owner`**: the organization (xotoscript).
- **`target_submodules`**: a list of submodules in the repository.
- **`target_branch`**: the name of the branch of the current pull request.
- **`target_workflow`**: the name of the workflow file to use.
1. Run the workflow.

The action will automatically create a bot comment in the root pull request, listing all pull requests of submodules, including their status and pipeline.

### Conclusion

With our custom GitHub action, you can easily keep track of changes and pipelines across all submodules in your repository, reducing inefficiencies and errors in the development process. Use this action in your workflow to improve your development process today.