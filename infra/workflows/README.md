# Workflows backup

GitHub App tokens used for automated commits lack the `workflows` permission,
so any changes to `.github/workflows/*` must be applied **manually**.

To activate CI:

```bash
mkdir -p .github/workflows
cp infra/workflows/ci.yml .github/workflows/ci.yml
git add .github/workflows/ci.yml
git commit -m "ci: activate workflow"
git push   # done by a human or a token WITH workflows permission
```
