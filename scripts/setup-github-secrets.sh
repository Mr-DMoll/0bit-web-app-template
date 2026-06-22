#!/usr/bin/env bash
# =============================================================================
# setup-github-secrets.sh
# Pushes required CI/CD secrets to your GitHub repo using the GitHub CLI (gh).
#
# Run this ONCE after:
#   1. Creating your GitHub repo
#   2. Filling in your .env file
#
# Usage:
#   bash scripts/setup-github-secrets.sh
#   bash scripts/setup-github-secrets.sh OWNER/REPO  (if gh can't detect repo)
# =============================================================================

set -e

# ── Check GitHub CLI is installed ─────────────────────────────────────────────
if ! command -v gh &> /dev/null; then
  echo "❌  GitHub CLI (gh) not found."
  echo "    Install it: https://cli.github.com"
  exit 1
fi

# ── Check .env exists ─────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo "❌  .env file not found. Copy .env.example to .env and fill in values."
  exit 1
fi

# ── Detect repo (or use argument) ─────────────────────────────────────────────
REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)}"

if [ -z "$REPO" ]; then
  echo "❌  Could not detect GitHub repo."
  echo "    Run: bash scripts/setup-github-secrets.sh OWNER/REPO"
  exit 1
fi

echo "🔐  Setting CI/CD secrets for: $REPO"
echo ""

# ── CI secrets (required for GitHub Actions to build) ─────────────────────────
CI_VARS=(
  "DATABASE_URL"
  "JWT_SECRET"
  "NEXT_PUBLIC_API_URL"
)

for VAR in "${CI_VARS[@]}"; do
  VALUE=$(grep -E "^${VAR}=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
  if [ -z "$VALUE" ]; then
    echo "⚠️   Skipping $VAR — not set in .env"
  else
    echo "✅  Setting $VAR"
    echo "$VALUE" | gh secret set "$VAR" --repo "$REPO"
  fi
done

echo ""
echo "─────────────────────────────────────────────────────"
echo "✅  CI secrets done."
echo ""
echo "📦  Deploy secrets (optional — only needed for auto-deploy):"
echo "    VERCEL_TOKEN      → vercel.com → Account Settings → Tokens"
echo "    VERCEL_ORG_ID     → vercel.com → Team Settings → General"
echo "    VERCEL_PROJECT_ID → vercel.com → Project Settings → General"
echo "    RAILWAY_TOKEN     → railway.app → Account → Tokens"
echo ""
echo "    Add them with:"
echo "    gh secret set VERCEL_TOKEN --repo $REPO"
echo "    gh secret set VERCEL_ORG_ID --repo $REPO"
echo "    gh secret set VERCEL_PROJECT_ID --repo $REPO"
echo "    gh secret set RAILWAY_TOKEN --repo $REPO"
echo "─────────────────────────────────────────────────────"
