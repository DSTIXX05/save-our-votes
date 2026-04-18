#!/usr/bin/env bash

set -euo pipefail

ENV_FILE="${1:-.env}"

if ! command -v gh >/dev/null 2>&1; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Install it first, then run this script again."
    exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
    echo "Error: You are not authenticated with gh."
    echo "Run: gh auth login"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found."
    exit 1
fi

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    ORIGIN_URL="$(git config --get remote.origin.url || true)"
else
    ORIGIN_URL=""
fi

REPO="${GITHUB_REPOSITORY:-}"
if [ -z "$REPO" ] && [ -n "$ORIGIN_URL" ]; then
    REPO="$(echo "$ORIGIN_URL" | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"
fi

if [ -z "$REPO" ]; then
    echo "Error: Could not determine target repository."
    echo "Set GITHUB_REPOSITORY=owner/repo and retry."
    exit 1
fi

echo "Starting secret upload to GitHub repository: $REPO"

gh secret set -f "$ENV_FILE" --repo "$REPO"

echo "All secrets have been pushed successfully to $REPO."