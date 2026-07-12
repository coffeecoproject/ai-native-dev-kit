# IntentOS 1.99.2 Known Limitations

## Deterministic Conflict Detection

Active-guidance conflict detection covers direct supported assertions. It does
not prove that every natural-language sentence is semantically aligned. Review
still evaluates task-specific meaning and evidence.

## Registered Guidance Surface

Only explicitly registered semantic guidance has current product-direction
authority. A new guidance surface must be registered before it can become
authoritative. Non-semantic runtime files may remain outside that list.

## Legacy Review Inputs

Historical Review Packets and GPT review prompts may not carry context binding.
They remain readable for audit compatibility but cannot claim explicit binding
to the current contract.

## Compatibility Vocabulary

Existing schema fields such as `owner`, `reviewer`, `human_decision`, and
`*_owner_ref` remain compatibility vocabulary. They are still translated
through the current product contract.

## Capability Scope

Capability coverage remains derived and internal. This patch does not add a
new required/recommended/deferred capability state machine.
