# IntentOS 1.98.1 Release Record

## Theme

Trust Review Close-Out.

## Human Summary

This patch closes the independent review of 1.98.0. It does not add another
workflow. It makes existing completion, controlled apply, release, adoption,
baseline, and generated-project claims depend on the exact current task,
project state, approved action graph, and installed behavior.

## Delivered

- Git evidence identity includes staged, unstaged, and untracked business
  content while excluding code-owned workflow outputs;
- public continuation and completion require one durable CURRENT Work Queue
  item, and Work Queue, Completion Evidence, and Closure must match the exact
  task reference and intent digest;
- a clearly different request during active work now produces a bounded task
  switch review instead of silently changing the current task;
- migration plans stay inside approved project plan directories and match the
  actually installed IntentOS version;
- existing `agent.md` or `.agent.md` authority is preserved instead of creating
  a parallel `AGENTS.md`, and an approved appendix must satisfy the same agent
  sections consumed by activation;
- backup creation, replay, rollback, activation, and Apply Receipt persistence
  fail closed as one bounded transaction;
- project-local activation scripts must match the approved plan before they run;
- Launch Review carries structured project, revision, exact checked Closure,
  surface, and digest evidence before Release Execution can proceed;
- release authority binds the exact candidate digest and treats macOS
  `/var`/`/private/var` path aliases as the same canonical project root;
- blocked release channels and empty strict approvals cannot authorize review;
- VERIFIED_ACTIVE adoption requires a real IntentOS-aware agent entry;
- BL1/BL2 installation proves environment and every selected profile has the
  required standard or industrial pack;
- generated CLI version and source-only command behavior match its target
  distribution, and release-channel assets are part of target completeness.

## Boundaries

- No report proves an external human identity or provider state.
- No checker approves implementation, business correctness, release, or
  production.
- Controlled apply remains limited to exact reviewed project-local actions.
- External deploy, store submission, migration, secrets, DNS, payment,
  permissions, and production configuration remain outside automatic apply.

## Allowed Claims

- Public completion now requires the same durable current task across Work
  Queue, Completion Evidence, and Closure.
- Controlled apply rolls back replayed project-local writes if activation or
  Receipt persistence fails.
- Release Execution requires a structured current-project Launch Review and a
  strict structured human approval chain.
- Generated projects expose the installed IntentOS version and do not expose
  source-maintainer commands as runnable target commands.

## Forbidden Claims

- These checks do not prove business or product correctness.
- They do not authenticate a named human or external provider.
- They do not approve implementation, native apply beyond the exact approved
  graph, release, store submission, or production.
- They do not certify draft baseline packs for production use.

## Evidence Status

- focused execution/distribution trust regressions: PASS
- Operating Model and Work Queue regressions: PASS
- authoritative Manifest and target distribution check: PASS
- full repository self-check and `npm run verify`: PASS
- initial independent multi-surface audit findings: governed
- post-repair main-thread full-chain re-verification: PASS
- post-repair subagent rerun: unavailable after agent usage limit was exhausted

## Known Limitations

- External identities and provider state remain outside local evidence
  authority.
- Rollback cannot reverse prohibited external side effects.
- Full adoption proves observed activation and project entry, not error-free
  future AI behavior.
- See [known-limitations.md](known-limitations.md) for the complete boundary.

## Verification

- `node --test tests/execution-distribution-trust.test.mjs tests/operating-model.test.mjs`
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `npm run verify`
- `git diff --check`

See [self-check-report.md](self-check-report.md) for command-level evidence.
