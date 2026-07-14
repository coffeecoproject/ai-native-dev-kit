#!/usr/bin/env bash
set -euo pipefail

node scripts/workflow-next.mjs . --json --intent "verify the current Android project safely" >/dev/null
node scripts/resolve-work-queue.mjs . --json >/dev/null
node scripts/resolve-task-governance.mjs . --json --intent "verify the current Android project safely" >/dev/null

if [ ! -x "./gradlew" ]; then
  echo "IntentOS project-entry, Work Queue, and Task Governance checks passed."
  echo "The Android product scaffold is not present yet, so Gradle verification is not applicable."
  exit 0
fi

./gradlew test
./gradlew lint
./gradlew assembleDebug
