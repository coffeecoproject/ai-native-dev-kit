#!/usr/bin/env bash
set -euo pipefail

if [ ! -x "./gradlew" ]; then
  echo "Gradle wrapper ./gradlew not found. Update scripts/verify.sh for this project."
  exit 0
fi

./gradlew test
./gradlew lint
./gradlew assembleDebug

