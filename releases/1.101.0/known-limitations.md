# IntentOS 1.101.0 Known Limitations

## Adapter Execution

The runtime adapter is selected and validated, but 1.101 does not start or stop
local processes, containers, Kubernetes workloads, serverless deployments,
simulators, or project-native test environments. Adapter execution is a later
phase and must remain project-aware and bounded.

## Resource Lifecycle

The ownership ledger and cleanup contract are enforceable records. This release
does not create, isolate, or clean databases, caches, sessions, ports, files, or
other runtime resources. Future execution must use `run_id` plus owner markers
and must never use broad process kills or shared-resource deletion.

## Downstream Consumers

Existing Test Evidence, Execution Assurance, Completion Evidence, and release
consumers are not yet required to reference a Verification Run Manifest. A
later compatibility hardcut must add that requirement without invalidating
unrelated historical records or making LOW tasks unnecessarily heavy.

## Project-Specific Reality

Repository checks cannot know every custom runtime, test harness, provider, or
data topology. Unsupported adapters remain blocked instead of asking the
zero-experience user to select infrastructure.

## External Truth

A valid run manifest does not prove that the business rule is desirable,
legally valid, or correct in every real-world environment. Production and
provider effects remain separately governed external facts.
