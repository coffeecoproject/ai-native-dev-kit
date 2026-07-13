# Release Execution Topology Core

## Purpose

Release execution topology is a read-only projection of how one release moves
from source to its real target. It separates six planes:

1. Source Control;
2. Orchestrator;
3. Execution Backend;
4. Package Transport;
5. Evidence Store;
6. Production Target.

Changing one plane does not prove that another plane changed. SSH transport,
for example, does not prove local or self-hosted execution.

## User Contract

The public user is one zero-experience solo developer. IntentOS and Codex own
topology discovery, capability derivation, candidate comparison, and the
technical recommendation, including selection of runners, orchestrators,
stores, protocols, locks, rollback commands, and internal artifacts. No
technical topology decision is delegated to the user.

User input is limited to missing business facts, unavailable external facts,
or consent to one prepared concrete real-world effect.

## Fact Confidence

Every fact is one of `OBSERVED`, `DECLARED`, `INFERRED`, or `UNKNOWN`.
Documentation presence alone does not prove an active executor, trigger,
package path, evidence store, lock, rollback path, or production target.

## Authority

The topology record is a computed read-only projection. It can explain and
recommend, but it cannot approve release, authorize project writes, grant
production authority, embed consent as authority, or override stronger
project-native rules.

Release Channel Policy 1.87 remains compatibility evidence. Legacy fields may
be translated into topology facts, but legacy evidence alone cannot establish
strict topology readiness or authorize migration.

## Recommendation

IntentOS derives mandatory capabilities, rejects incomplete candidates,
preserves stronger project rules, and selects one deterministic recommendation.
Cost and convenience are optimization inputs only; they cannot replace release
identity, lock, rollback, evidence, isolation, and observation requirements.

## Safety

- recommendation is not approval;
- topology description is not active-topology proof;
- transport migration is not executor migration;
- one candidate has one exact source and package identity;
- unknown production effects fail closed;
- secrets are referenced and redacted;
- cleanup is limited to exact run-owned resources.
