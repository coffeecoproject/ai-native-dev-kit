# Release Topology Consumer Binding

## Purpose

Release Topology Consumer Binding makes the strict release chain consume one
current Release Execution Topology without turning that projection into release
approval or execution authority.

## Binding Contract

The following consumers may require the same topology file and file digest:

- Release Evidence Gate;
- Release Approval Record;
- Release Execution Plan;
- Runtime Hygiene for release operations.

Each strict consumer must independently verify:

1. the topology report resolves inside the current project without symlinks;
2. its file digest and canonical topology digest match;
3. its project identity and source revision are current;
4. its recommendation is technically ready;
5. its boundaries remain non-authorizing;
6. every downstream ref and digest agrees with the approval source chain.

The Release Plan remains a derived explanation. It cannot override a failed
topology input or authorize a release action.

## Compatibility

Legacy Release Channel Policy remains readable. It cannot satisfy
`--require-release-topology`, supply current consent, or establish current
release readiness by itself.

## User Contract

Codex selects and checks the technical topology. The zero-experience solo user
does not choose runners, orchestration, package transport, evidence storage, or
release protocols. The user is asked only for a missing business/external fact
or consent to one prepared concrete real-world effect.

## Boundaries

- Changes project or provider configuration: No
- Approves release or production: No
- Executes deployment or submission: No
- Treats embedded consent as authority: No
- Creates a second release state machine: No
