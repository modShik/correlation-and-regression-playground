# Push this project to GitHub

Target repository: https://github.com/modShik/correlation-and-regression-playground

## Before the first push

Install Git and Node.js 22.13 or newer. Make sure the GitHub repository exists and your account can write to it. If creating a new repository, leave it empty: do not initialize it with a README, license, or `.gitignore`, because those files are already supplied here where applicable.

From this project folder, validate the app:

```bash
npm ci
npm run check
```

## First push to an empty repository

```bash
git init -b main
git add .
git commit -m "Build correlation and regression playground"
git remote add origin https://github.com/modShik/correlation-and-regression-playground.git
git push -u origin main
```

The `.gitignore` excludes installed dependencies, generated builds, local environment files, and agent/hosting metadata. Commit `package-lock.json` so local installs and CI use the same dependency versions.

If Git asks for your identity, set your own name and email with `git config user.name` and `git config user.email`, then repeat the commit. For HTTPS authentication, use GitHub CLI (`gh auth login`) or your configured credential manager. If Git explicitly prompts for an HTTPS password, use a GitHub personal access token with appropriate repository access, not your account password.

## If the repository already has commits

Preserve its history: clone it to a separate folder first, copy this project's files into that clone (excluding `.git`, `node_modules`, and `dist`), review changes, and then commit and push from the clone. Do not overwrite the remote history with a force push.

## Later updates

```bash
npm run check
git add .
git commit -m "Describe your update"
git push
```

After pushing, the repository's **Actions** tab shows the type-check, mathematical-test, and build results.

Workflow action documentation: [actions/checkout](https://github.com/actions/checkout) and [actions/setup-node](https://github.com/actions/setup-node).
