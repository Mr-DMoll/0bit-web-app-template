# Project Setup Guide

Follow these steps **in order**. Each step must be completed before the next.

---

## Step 1 — Prerequisites (one-time, per machine)

Install these tools if you don't have them:

| Tool | Install |
|---|---|
| Node.js 22+ | https://nodejs.org |
| pnpm | `npm install -g pnpm` |
| GitHub CLI | https://cli.github.com |

Then log into GitHub CLI:
```bash
gh auth login
```
Choose **GitHub.com → HTTPS → Login with browser**.

---

## Step 2 — Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and fill in **all required values**:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Supabase → Project → Settings → Database → Connection string (Transaction mode) |
| `JWT_SECRET` | Run: `openssl rand -base64 32` — paste the output |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` for dev. Update to your Railway/Render URL for production |
| `RESEND_API_KEY` | https://resend.com → API Keys |
| `GOOGLE_CLIENT_ID` | https://console.cloud.google.com → APIs → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com |

> Leave `R2_*` and `AWS_*` empty unless you are using file uploads.

---

## Step 3 — Install dependencies

```bash
pnpm install
```

---

## Step 4 — Set up the database

```bash
pnpm db:generate    # generate Prisma client
pnpm db:push        # push schema to Supabase (dev only)
```

---

## Step 5 — Push GitHub secrets for CI/CD

This sets `DATABASE_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_API_URL` as secrets in your GitHub repo so CI/CD can build and test your code automatically.

```bash
pnpm setup:secrets
```

You should see:
```
✅  Setting DATABASE_URL
✅  Setting JWT_SECRET
✅  Setting NEXT_PUBLIC_API_URL
```

> **Troubleshooting:** If it says "could not detect repo", run:
> ```bash
> bash scripts/setup-github-secrets.sh YOUR_GITHUB_USERNAME/YOUR_REPO_NAME
> ```

---

## Step 6 — Start the development servers

```bash
pnpm dev
```

This starts both the web app (`localhost:3000`) and the API (`localhost:3001`).

---

## Step 7 — Verify CI is passing

Go to your GitHub repo → **Actions tab**.

You should see a green run with 3 jobs:
- ✅ Build Workspace Packages
- ✅ Web — Type Check & Build
- ✅ API — Type Check & Build

If any are red, check the error logs and compare your `.env` values.

---

## Optional — Auto-deploy to production

For automatic deployment on every push to `main`, add these secrets in GitHub:

**Web → Vercel:**
```bash
gh secret set VERCEL_TOKEN        # vercel.com → Account Settings → Tokens
gh secret set VERCEL_ORG_ID       # vercel.com → Team Settings → General
gh secret set VERCEL_PROJECT_ID   # vercel.com → Project Settings → General
```

**API → Railway:**
```bash
gh secret set RAILWAY_TOKEN       # railway.app → Account → Tokens
```

---

## Summary — Quick reference

```
cp .env.example .env     → fill in values
pnpm install             → install packages
pnpm db:generate         → generate Prisma types
pnpm db:push             → sync database schema
pnpm setup:secrets       → push secrets to GitHub
pnpm dev                 → start local development
```
