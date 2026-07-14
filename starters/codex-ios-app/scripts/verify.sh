#!/usr/bin/env bash
set -euo pipefail

node scripts/workflow-next.mjs . --json --intent "verify the current iOS project safely" >/dev/null
node scripts/resolve-work-queue.mjs . --json >/dev/null
node scripts/resolve-task-governance.mjs . --json --intent "verify the current iOS project safely" >/dev/null

if ! find . -maxdepth 3 \( -name '*.xcodeproj' -o -name '*.xcworkspace' -o -name 'Package.swift' \) -print -quit | grep -q .; then
  echo "IntentOS project-entry, Work Queue, and Task Governance checks passed."
  echo "The iOS product scaffold is not present yet, so xcodebuild verification is not applicable."
  exit 0
fi

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild not found. Install Xcode command line tools or update scripts/verify.sh for this project."
  exit 1
fi

SCHEME="${IOS_SCHEME:-}"
DESTINATION="${IOS_DESTINATION:-platform=iOS Simulator,name=iPhone 16}"

if [ -z "$SCHEME" ]; then
  echo "IOS_SCHEME is not set. Update scripts/verify.sh or export IOS_SCHEME for this project."
  exit 1
fi

if [ -n "${IOS_WORKSPACE:-}" ]; then
  xcodebuild test -workspace "$IOS_WORKSPACE" -scheme "$SCHEME" -destination "$DESTINATION"
elif [ -n "${IOS_PROJECT:-}" ]; then
  xcodebuild test -project "$IOS_PROJECT" -scheme "$SCHEME" -destination "$DESTINATION"
else
  xcodebuild test -scheme "$SCHEME" -destination "$DESTINATION"
fi
