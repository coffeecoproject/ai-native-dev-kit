# Product Baseline

## Human Summary

Product Baseline constrains how AI Native Dev Kit itself may evolve. It keeps upgrades aligned with guided delivery instead of letting the system grow heavier, louder, or less controlled.

## Product Principles

- Human decides.
- AI drafts, executes approved work, verifies, and reports.
- Reports are not approvals.
- Review Packets are not approvals.
- Goal Cards are not approvals.
- Subagent outputs are not approvals.
- Simulated evidence is not production evidence.
- Draft packs are not stable packs.
- Industrial packs are selected-only.
- Unknown, dirty, governed, and production-sensitive projects default to read-only assessment.
- Existing project writes are plan-first.
- Baseline files record confirmed facts, pending decisions, and not-applicable items.
- AI assumptions must be marked and routed to humans when they affect decisions.

## Upgrade Rules

Every meaningful Dev Kit upgrade must declare:

- what outcome it improves
- what user burden it reduces
- what authority it does not grant to AI
- what evidence exists
- what evidence does not exist yet
- what claims are allowed
- what claims are forbidden
- what known limitations remain

## Default Safety Rules

The kit must not:

- make `start` write target project files
- make `baseline` write target project files by default
- apply migration plans without review
- auto-enable BL2
- install all industrial packs by default
- promote draft packs because files are complete
- call external reviewer APIs by default
- let subagents write in parallel
- treat final reports as release approval
- hide unresolved assumptions in technical details

## Evidence Maturity

Evidence must be labeled honestly:

| Evidence | Meaning | Allowed Claim |
|---|---|---|
| Simulated dogfood | The workflow was rehearsed inside fixtures or examples. | This path is structurally covered. |
| Generated-project smoke | A generated project can receive and run the assets. | Bootstrap behavior is covered. |
| Controlled real-project trial | A real project used the workflow under observation. | Trial evidence exists for that project type. |
| Production adoption evidence | A production project used the workflow with delivery evidence. | Production evidence exists for that explicit context. |

No evidence type may be upgraded by wording alone.

## Release Requirements

Every release record for a meaningful phase should include:

- Allowed Claims
- Forbidden Claims
- Evidence Status
- Known Limitations
- Verification

## Review Requirements

Product Baseline review checks whether the change:

- keeps humans responsible for judgment and approval
- keeps AI inside execution and reporting authority
- avoids unbounded automation
- avoids default industrial expansion
- avoids overclaiming evidence
- keeps output readable for non-expert users
