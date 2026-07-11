# IntentOS 1.99.1 Release Record

## Theme

Review Context Authority.

## Human Summary

IntentOS now gives the current zero-experience solo operating contract explicit
priority over old release language and machine-compatibility fields. External
GPT review, reviewer agents, and review subagents receive the same current
context before making recommendations.

The release does not add user modes or weaken technical gates. It prevents old
`owner`, `human decision`, team, and enterprise wording from returning as the
current product model.

## Delivered

- one human-readable current review-context contract;
- one machine-readable authority registry with `CURRENT`, `COMPATIBILITY`, and
  `HISTORICAL` classifications plus conflicting-guidance failure semantics;
- fixed interpretation precedence from current product contract to historical
  audit records;
- reviewer and GPT prompts that reject team modes, technical user choices,
  internal-owner delegation, historical authority drift, and capability scope
  inflation;
- bounded `CURRENT_CONVERSATION_USER` semantics that do not imply legal,
  provider, platform, regulatory, release, or production authority;
- current README entry separated from detailed historical release narration;
- generated Agent governance and installed review-context assets;
- focused negative regressions and one repository checker.

## Preserved Safety

- historical release records remain unchanged and available for audit;
- compatibility fields remain readable by existing artifacts;
- project-native rules remain authoritative when stricter and proven;
- business truth and external facts are not invented;
- real-world consent remains exact, prepared, and non-transferable;
- task, evidence, apply, rollback, completion, release, and production gates
  remain unchanged.

## Evidence Status

Repository evidence includes the machine-readable context registry, exact path
classification cases, negative review-recommendation regressions, bounded
current-user consent checks, a real Operating Loop release-bypass regression,
reviewer/GPT prompt contract checks, README language/history separation,
Manifest source/target validation, and generated Agent governance. Final claims
require the focused checker, Manifest checker, repository self-check, full
verification suite, and diff check to pass on the same source snapshot.

## Known Limitations

Review-drift detection is deterministic and cannot prove every natural-language
recommendation correct. Historical records and compatibility field names remain
in the repository for audit and artifact readability. A reviewer that ignores
the current context contract can still quote them incorrectly. External legal,
regulatory, provider, platform, and third-party authority cannot be inferred
from the current conversation identity. See
[known-limitations.md](known-limitations.md).

## Allowed Claims

- Current IntentOS direction is interpreted from current contracts and active
  runtime, not from old records or compatibility field names.
- Industrial engineering depth does not imply a multi-person user model.
- Review recommendations that delegate technical decisions to the user can be
  detected and rejected by the 1.99.1 review-context checker.
- Generated projects receive the same review-context contract and prompt rules.

## Forbidden Claims

- The checker is not a substitute for semantic review.
- `CURRENT_CONVERSATION_USER` is not universal external authority.
- This release does not rename every historical compatibility field.
- This release does not approve implementation, apply, release, or production.
- This release does not add Solo/Team/Enterprise product modes.

## Verification

- `node scripts/check-review-context-authority.mjs`
- `node --test tests/review-context-authority.test.mjs`
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `npm run verify`
- `git diff --check`

See [known-limitations.md](known-limitations.md) and
[self-check-report.md](self-check-report.md).
