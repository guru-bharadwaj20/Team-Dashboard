# Security Policy

## Reporting a Vulnerability

Please open a private security advisory on the repository rather than a public issue.

---

## ⚠️ Known Historical Credential Exposure — ACTION REQUIRED

`backend/.env` was committed to this repository between commits `8c333d4` and `0ce3548`,
and was only removed from the working tree in `1707cd6`. **Deleting the file did not remove
it from git history.** Any clone of this repository still contains the original values.

Exposed variables:

| Variable | Status | Required action |
|---|---|---|
| `MONGO_URI` | Compromised | Rotate the database user password in MongoDB Atlas |
| `JWT_SECRET` | Compromised | Generate a new secret (invalidates all existing sessions) |
| `GEMINI_API_KEY` | Compromised | Revoke and reissue in Google AI Studio |

### 1. Rotate the credentials (do this first)

```bash
# Generate a fresh JWT secret
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then update `backend/.env` locally and in every deployment environment.
Rotating `JWT_SECRET` logs out all users — that is the intended effect.

### 2. Purge the file from git history (destructive — coordinate with all collaborators)

This rewrites every commit hash and requires a force-push. Every collaborator must
re-clone afterwards. Do not run this until step 1 is complete.

```bash
# Back up first
git clone --mirror . ../Team-Dashboard-backup.git

# Requires: pip install git-filter-repo
git filter-repo --path backend/.env --invert-paths --force

git remote add origin <your-remote-url>
git push --force --all
git push --force --tags
```

Rotation (step 1) is what actually protects you. History purging (step 2) only
reduces future discoverability — treat the old values as permanently public.

---

## Secret Handling Rules

- Never commit `.env` files. The root `.gitignore` blocks `.env`, `.env.*`,
  `backend/.env*`, and `frontend/.env*`.
- `backend/.env.example` and `frontend/.env.example` document required variables
  with placeholder values only.
- `JWT_SECRET` must be at least 32 characters. The server refuses to start otherwise.
- Verify before every commit:

  ```bash
  git diff --cached --name-only | grep -E '(^|/)\.env$' && echo "BLOCKED: .env staged"
  ```

## Supported Versions

Only the latest commit on `main` receives security fixes.
