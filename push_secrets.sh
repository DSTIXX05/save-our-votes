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

while IFS= read -r line || [ -n "$line" ]; do
    line_trimmed="$(echo "$line" | sed -E 's/^[[:space:]]+//')"

    # Skip blank lines and comments.
    [ -z "$line_trimmed" ] && continue
    [[ "$line_trimmed" == \#* ]] && continue

    # Parse KEY=VALUE pairs only.
    if [[ "$line_trimmed" != *"="* ]]; then
        echo "Skipping invalid line: $line_trimmed"
        continue
    fi

    key="${line_trimmed%%=*}"
    value="${line_trimmed#*=}"
    key="$(echo "$key" | xargs)"

    [ -z "$key" ] && continue

    echo "Setting secret: $key"
    printf '%s' "$value" | gh secret set "$key" --repo "$REPO"
done < "$ENV_FILE"

echo "All secrets have been pushed successfully to $REPO."