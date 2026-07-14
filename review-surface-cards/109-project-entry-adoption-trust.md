# Review Surface Card: IntentOS 1.109

## Human Decision Summary

Conclusion: all trust, transaction, compatibility, and generated-project
surfaces require independent review.

Recommended next step: finish Phase 0 source binding, then enter implementation
review.

Can AI continue now: limited.

What I need from you: none.

What happens if you do nothing: no production implementation begins.

## Plain Summary

Codex must check that the same project identity, goal, rules, current work, and
evidence are used from first entry through adoption and task routing. The
review also checks that new-project setup is reversible, existing-project work
is preserved, generated projects work without borrowing the source checkout,
and the user is never asked to make technical trust decisions.

## Project Reading

| Field | Value |
|---|---|
| User mode | `plain` |
| Project state | `INTENTOS_REPOSITORY` |
| Existing users assumed | `Yes` |
| Can write files now | `No` |
| Risk level | `high` |
| Dirty | `Yes; only current 1.109 governance and unrelated parked 1.110 plan` |

## Selected Review Surfaces

| Surface | Why | Required before execution | Required after execution | Human decision needed |
|---|---|---|---|---|
| `FUNCTIONAL_REVIEW` | Check the one-entry and behavior-complete adoption contract. | Yes | Yes | No |
| `CODE_REVIEW` | Check shared-library use, target topology, transactions, and consumer consistency. | Yes | Yes | No |
| `VERIFICATION_REVIEW` | Check strict, adversarial and generated-project evidence. | Yes | Yes | No |
| `DEBT_REVIEW` | Prevent local patches and duplicated truth systems. | Yes | Yes | No |
| `EXISTING_GOVERNANCE_REVIEW` | Check Guidance, authority accounting, migration, stronger-rule preservation, legacy evidence, and current work. | Yes | Yes | No |
| `SECURITY_PRIVACY_REVIEW` | Check path, symlink, target swap, absent/empty/non-empty topology, rollback, and receipt safety. | Yes | Yes | No |
| `UX_REVIEW` | Keep technical adoption and trust decisions inside Codex/IntentOS for a zero-experience user. | Yes | Yes | No |
| `DOCUMENTATION_REVIEW` | Check active Guidance, compatibility wording, starter instructions, and current release authority. | Yes | Yes | No |
| `RELEASE_IMPACT_REVIEW` | Keep behavioral adoption, task completion, platform readiness, and release readiness separate. | Yes | Yes | No |

## Review Surface Checklist

| Surface | Before execution | After execution | Missing evidence action |
|---|---|---|---|
| `FUNCTIONAL_REVIEW` | Bind one entry, goal, project-fact projection, and adoption route. | Confirm new and existing projects follow the intended route without overclaiming activation. | Block the affected entry or adoption claim. |
| `CODE_REVIEW` | Declare shared libraries, consumers, exact write paths, and transaction invariants. | Check canonical paths, same-run evidence, atomic apply, rollback, and cross-consumer reuse. | Continue Codex remediation inside the approved boundary. |
| `VERIFICATION_REVIEW` | Bind positive, negative, rollback, generated-parity, and 1.108 consumer obligations. | Run focused and full verification and record exact failures or passes. | Do not claim the task or release complete. |
| `DEBT_REVIEW` | Identify duplicate identity, state, evidence, and completion authority risks. | Confirm no parallel truth system or compatibility bypass was added. | Record bounded follow-up or block release when it changes trust. |
| `EXISTING_GOVERNANCE_REVIEW` | Inventory active, historical, legacy, and unresolved authority plus current work. | Confirm stronger project rules and in-flight work remain mapped and active. | Keep adoption read-only and continue Codex-owned reconciliation. |
| `SECURITY_PRIVACY_REVIEW` | Define topology, symlink, TOCTOU, exact-action, rollback, and receipt checks. | Confirm failed or pending setup cannot appear verified and leaves exact recovery evidence. | Block writes until the technical defect is repaired. |
| `UX_REVIEW` | Classify every possible question under the current four user-decision classes. | Confirm no technical menu, owner role, evidence handoff, or repeated approval reaches the user. | Rewrite the output and rerun semantic checks. |
| `DOCUMENTATION_REVIEW` | Bind current plan, active Guidance, starter assets, Manifest, and release records. | Confirm source and generated guidance agree and historical material is not current authority. | Block release metadata promotion. |
| `RELEASE_IMPACT_REVIEW` | Separate behavioral activation, first-task completion, product completeness, and release readiness. | Confirm no local setup or adoption result authorizes release or production. | Keep the release path blocked without asking for technical approval. |

## Questions For Human

None. This task contains no missing business fact or concrete real-world effect.

## Post-Execution Review Contract

- Per-surface result: pass, fail, or not verified for every selected surface.
- Unverified surfaces block release.
- Debt result: no duplicated entry, state, evidence, or completion authority.
- Next delivery state: release review only after strict finish.

## Boundaries

- This card writes target files: No
- This card modifies CI: No
- This card installs hooks: No
- This card deletes or archives documents: No
- This card changes task state: No
- This card approves implementation: No
- This card approves release or production: No
- This card approves security/privacy/compliance/payment/migration decisions: No

## Outcome

`REVIEW_SURFACE_RECORDED`
