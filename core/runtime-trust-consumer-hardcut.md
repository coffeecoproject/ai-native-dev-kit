# Runtime Trust Consumer Hardcut

IntentOS must not close a task from a written PASS claim when the current code was never proven to run in the recorded verification environment. Version 1.104 makes one current Verification Run Manifest mandatory across every strict completion consumer.

## Authority Chain

```text
Verification Plan
-> Verification Runtime Plan
-> Verification Runtime Lifecycle Plan
-> Verification Run Manifest
-> Test Evidence
-> Execution Assurance
-> Completion Evidence
-> public finish decision
```

The Run Manifest is observed runtime evidence. It is not an approval. Every downstream consumer independently validates it through the authoritative checker and binds the same project, source revision, task, intent, Verification Plan, run ID, Runtime Plan, Lifecycle Plan, outputs, and cleanup result.

## Fail-Closed Rule

- no verified current-task Run Manifest means no complete Test Evidence;
- no matching runtime binding means no verified Execution Assurance;
- disagreement between direct, Test Evidence, and Execution Assurance bindings means no ready Completion Evidence;
- no verified Runtime Trust input means public `finish` cannot return `DONE`.

Historical consumer schemas remain readable for audit and migration. They cannot satisfy `--require-runtime-trust`, and `--allow-empty` cannot weaken that requirement.

## Consumer Agreement

Runtime identity is one tuple:

```text
manifest ref + manifest digest + run ID + task ref + intent digest
+ Runtime Plan ref/digest + Lifecycle Plan ref/digest
+ Verification Plan ref/digest
```

Test Evidence maps each covered obligation to a passing execution output from that manifest. Execution Assurance records the same binding as an independent source and evidence item. Completion Evidence validates the manifest directly and rejects any upstream disagreement. Public `finish` consumes the same current binding as one required decision input while preserving stricter blockers.

## User Contract

The zero-experience solo user describes the business behavior. Codex selects and runs the technical verification chain, repairs missing technical evidence when safely possible, and reports only a plain-language blocker. The user is not asked to choose a manifest, port, database, command, adapter, isolation mode, checker, or strict flag.

## Boundary

Runtime Trust proves that recorded outputs came from the bound current run under the recorded conditions. It does not prove that assertions are semantically correct, erase missing business coverage, approve implementation, authorize commit or push, or authorize release, provider, production, payment, DNS, secret, migration, or irreversible effects.
