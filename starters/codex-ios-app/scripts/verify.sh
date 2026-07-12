#!/usr/bin/env bash
set -euo pipefail

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
