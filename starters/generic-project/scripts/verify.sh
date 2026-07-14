#!/usr/bin/env bash
set -euo pipefail

node scripts/workflow-next.mjs . --json --intent "verify the current project safely" >/dev/null
node scripts/resolve-work-queue.mjs . --json >/dev/null
node scripts/resolve-task-governance.mjs . --json --intent "verify the current project safely" >/dev/null

if [ -f package.json ]; then
  if command -v corepack >/dev/null 2>&1 && [ -f pnpm-lock.yaml ]; then
    corepack pnpm lint
    corepack pnpm typecheck
    corepack pnpm test
    corepack pnpm build
  elif [ -f package-lock.json ]; then
    npm run lint
    npm run typecheck
    npm test
    npm run build
  elif [ -f yarn.lock ]; then
    yarn lint
    yarn typecheck
    yarn test
    yarn build
  else
    npm run lint
    npm run typecheck
    npm test
    npm run build
  fi
elif [ -f pyproject.toml ]; then
  echo "Python project detected. Update scripts/verify.sh with this project's lint/type/test commands."
  exit 1
elif [ -f go.mod ]; then
  go test ./...
else
  echo "IntentOS project-entry, Work Queue, and Task Governance checks passed."
  echo "No product stack exists yet, so stack-specific verification is not applicable."
fi
