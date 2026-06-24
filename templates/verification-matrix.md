# Verification Matrix: <project-or-profile-name>

## Purpose

Define what evidence is required before claiming a change is complete.

## Default Commands

```bash
# Replace with project-specific commands.
bash scripts/verify.sh
```

## Matrix

| Change Type | Required Checks | Optional Checks | Evidence |
|---|---|---|---|
| Docs only | spelling/link review | - | changed files summary |
| Local code change | lint, unit tests | typecheck, build | command output summary |
| Cross-module change | lint, typecheck, unit/integration tests | e2e | command output summary |
| UI/interface change | behavior check, state review | screenshot/visual regression | screenshots or notes |
| API/contract change | contract tests, integration tests | consumer tests | contract diff and command output |
| Data/migration change | migration test, rollback note | backup/restore drill | migration evidence |
| High-risk change | full gate evidence, human approval | post-release monitor | approval and release evidence |

## Platform-specific Commands

### iOS

```bash
# Example only. Replace scheme and destination.
xcodebuild test -scheme <Scheme> -destination 'platform=iOS Simulator,name=<Device>'
```

### Android

```bash
./gradlew test
./gradlew lint
./gradlew assembleDebug
```

### Web

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Backend

```bash
# Replace with stack-specific commands.
```

## Evidence Rules

- Record what was run.
- Record failures and retries.
- Record skipped checks with rationale.
- Do not claim readiness from template existence.

