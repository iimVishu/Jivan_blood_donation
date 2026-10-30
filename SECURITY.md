# Security Policy

## Supported branches

Security fixes are developed on `staging` and reviewed before merging into `main`.
Use the current branch heads and the committed package lockfiles. Older commits
are not maintained as separate release lines.

## Reporting a Vulnerability

Report vulnerabilities privately using GitHub's **Security > Report a vulnerability**
for this repository, when private vulnerability reporting is enabled. If that
option is unavailable, contact the repository owner privately through their
published GitHub contact details. Do not put credentials, patient information,
or exploit details into a public issue.

Include affected routes, the commit, steps to reproduce, and the likely impact.
If credentials have been exposed, revoke or rotate them; deleting a file does
not remove secrets from Git history.

## Automated checks

The [Security checks workflow](.github/workflows/security-checks.yml) runs on
pushes and pull requests targeting `main` or `staging`, weekly, and on demand:

- Gitleaks scans the complete checked-out Git history for credentials.
- npm audits all three lockfiles, including development dependencies, and fails
  for moderate, high or critical vulnerabilities.
- ESLint rejects warnings, TypeScript checks the app and root configurations,
  regression tests run, and the production app is built without service secrets.

The [CodeQL workflow](.github/workflows/codeql.yml) analyzes JavaScript/TypeScript
and GitHub Actions with the extended security queries. Findings appear in
GitHub's code scanning alerts. CodeQL findings require review; a successful
analysis run does not mean that no findings were produced.

Actions are pinned to commit hashes. Dependabot proposes weekly npm and action
updates against `staging`. Workflows use read-only repository access by default;
only the CodeQL job receives permission to upload security findings. CI must not
receive production MongoDB, SMTP, payment, or Discord credentials.

To enforce these checks before merging, configure a GitHub branch rule requiring
the quality, dependency audit, secret scan and CodeQL checks. Workflow files alone
do not enable branch protection. See the repository's Actions tab for actual run
results rather than assuming a newly pushed workflow has passed.
