#!/usr/bin/env bash
set -euo pipefail

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
else
  echo "No package.json found. Update scripts/verify.sh for this project stack."
fi

