# Test Evidence Report

## Human Summary

Test evidence state TEST_EVIDENCE_COMPLETE; 119/119 required obligations covered by 125 evidence item(s).

## User Request

- Request: Complete IntentOS 1.113 cross-domain trust closure by enforcing required task consumers, evidence authority, security boundaries, atomic apply recovery, existing-project activation, baseline integrity, and bounded source distribution evidence while prohibiting external effects.
- Task ref: `task:17bb774d904e7e5418668f77f40440ad80a50edf32bc43c9a71860a2a8503b98`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `verification_plan` | `RECORDED` | `artifact:verification-plans/113-cross-domain-trust-closure.md` | `VERIFICATION_PLAN_READY` | `sha256:92f1c62c8ed6b3853df2ec2e594ca1c7d4a40d93668dc793c7fa98666994bbdc` |
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/113-cross-domain-trust-closure.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:25b859c4b4ccf0095286e33bea88cb336cb3d743f96a008d4524993403791e6b` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/preflight-113-cross-domain-trust-closure.md` | `CHANGE_IMPACT_RECORDED` | `sha256:85a4a3739b6fbbc2852ba3f0ae7c0aa76acf199998d66b479d445456ef2b68ac` |
| `business_universe_coverage` | `RECORDED` | `artifact:business-universe-coverage-reports/113-cross-domain-trust-closure.md` | `COVERAGE_READY` | `sha256:3fd5627529d7fe3a6905cf6bcf4d164e20f363983bdf8e1b00b28e7402b5197a` |
| `control_effectiveness` | `RECORDED` | `artifact:control-effectiveness-reports/113-cross-domain-trust-closure.md` | `CONTROL_PROVEN_EFFECTIVE` | `sha256:f746500af84ea19fba21ed879f8635020a5e65f101e8a687ca4e2810c326cad7` |
| `verification_run_manifest` | `RECORDED` | `artifact:verification-run-manifests/113-cross-domain-trust-closure.md` | `RUNTIME_TRUST_COMPLETE` | `sha256:85bef60cf3445edc21524788ccd1342ca0a9ec3a6b88f182efc852adabe213c0` |

## Test Evidence Identity

- Test evidence ref: `artifact:test-evidence-reports/113-cross-domain-trust-closure.md`
- Test evidence digest: `sha256:c948841fe728bc4bb30ec96269f0f33abed6abff6929ecb9ff71cfd327df5297`
- Verification plan ref: `artifact:verification-plans/113-cross-domain-trust-closure.md`
- Verification plan digest: `sha256:92f1c62c8ed6b3853df2ec2e594ca1c7d4a40d93668dc793c7fa98666994bbdc`
- Intent digest: `sha256:ffe295876d2af0c000da0c80666b673afdbbd82ecd18dd77919641947306594d`

## Verification Plan Binding

- Verification plan state: `VERIFICATION_PLAN_READY`
- Required obligations: `119`
- Covered obligations: `119`
- Missing obligations: `0`

## Runtime Trust Binding

| Field | Value |
| --- | --- |
| Requirement | `REQUIRED` |
| Status | `VERIFIED` |
| Run Manifest | `artifact:verification-run-manifests/113-cross-domain-trust-closure.md` |
| Run ID | `vrun-113-cross-domain-trust-r45` |
| Task Ref | `task:17bb774d904e7e5418668f77f40440ad80a50edf32bc43c9a71860a2a8503b98` |
| Intent Digest | `sha256:ffe295876d2af0c000da0c80666b673afdbbd82ecd18dd77919641947306594d` |
| Runtime Trust Level | `ISOLATED_RUNTIME` |
| Current Project Match | `Yes` |
| Current Task Match | `Yes` |
| Current Intent Match | `Yes` |
| Current Verification Plan Match | `Yes` |
| Reason | The exact current run passed the authoritative checker and consumer identity checks. |

## Control Effectiveness Binding

- Requirement: `REQUIRED`
- Status: `VERIFIED`
- Report: `artifact:control-effectiveness-reports/113-cross-domain-trust-closure.md`
- Report digest: `sha256:f746500af84ea19fba21ed879f8635020a5e65f101e8a687ca4e2810c326cad7`
- Required claims: `claim:package-script-verify-candidate`, `claim:package-script-verify-runtime-trust-core`, `claim:package-script-verify-runtime-trust`, `claim:package-script-verify-consumer-chain-candidate`, `claim:package-script-verify-baseline`, `claim:package-script-verify-example-observed-evidence`, `claim:package-script-verify-release-topology-consumers`, `claim:package-script-verify-planning-closure`
- Assessment outcome: `CONTROL_PROVEN_EFFECTIVE`
- Reason: The exact current report proves every relied-on bounded control claim.

## Business Universe Scenario Coverage

| Scenario ID | Required obligations | Covered obligations | Proof strength | Coverage state | Evidence IDs |
|---|---|---|---|---|---|
| `coverage-scenario:43cece0c8802346401b5deae` | `verify:universe-01b5deae-expected`, `verify:universe-01b5deae-negative` | `verify:universe-01b5deae-expected`, `verify:universe-01b5deae-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-483e9b2cb75b726f0695`, `evidence:runtime-observed-proof-8f5826af135bc96e4317` |
| `coverage-scenario:caa9e24d2528c535370c5a1e` | `verify:universe-370c5a1e-expected`, `verify:universe-370c5a1e-negative` | `verify:universe-370c5a1e-expected`, `verify:universe-370c5a1e-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-40eeec27cf402d543de0`, `evidence:runtime-observed-proof-b8f6d5e2606cc8d3e76e` |
| `coverage-scenario:bc414288b7476f119f9fa3e5` | `verify:universe-9f9fa3e5-expected`, `verify:universe-9f9fa3e5-negative` | `verify:universe-9f9fa3e5-expected`, `verify:universe-9f9fa3e5-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-8074726f1340db93a631`, `evidence:runtime-observed-proof-c09d33262cd36dbe50b3` |
| `coverage-scenario:47f468f00b595c2dd5cda5ec` | `verify:universe-d5cda5ec-expected`, `verify:universe-d5cda5ec-negative` | `verify:universe-d5cda5ec-expected`, `verify:universe-d5cda5ec-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-6c3e2ab5061a2550c76d`, `evidence:runtime-observed-proof-3be29929cb5adb63b4b8` |
| `coverage-scenario:9d22b95ae9bd8ae8909edc85` | `verify:universe-909edc85-expected`, `verify:universe-909edc85-negative` | `verify:universe-909edc85-expected`, `verify:universe-909edc85-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-eb8017c68e13f2d6ab80`, `evidence:runtime-observed-proof-dbb2e99e646226d7a5d8` |
| `coverage-scenario:f4c1fef659b1700b868d4b91` | `verify:universe-868d4b91-expected`, `verify:universe-868d4b91-negative` | `verify:universe-868d4b91-expected`, `verify:universe-868d4b91-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-013ec0534cfd2e60a36d`, `evidence:runtime-observed-proof-86bef721dd8885f9c4a4` |
| `coverage-scenario:48c63a3946eec4af133bfd71` | `verify:universe-133bfd71-expected`, `verify:universe-133bfd71-negative` | `verify:universe-133bfd71-expected`, `verify:universe-133bfd71-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-9532a686b8f9f5cd2869`, `evidence:runtime-observed-proof-c7e12b63bcc7bfe196d0` |
| `coverage-scenario:1d0e7e6faf265961a238de93` | `verify:universe-a238de93-expected`, `verify:universe-a238de93-negative` | `verify:universe-a238de93-expected`, `verify:universe-a238de93-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-4699f1b9fe49cbd678c4`, `evidence:runtime-observed-proof-af970f13ef0b0c57fc74` |
| `coverage-scenario:650b4c64a1b70e12230f46e1` | `verify:universe-230f46e1-expected`, `verify:universe-230f46e1-negative` | `verify:universe-230f46e1-expected`, `verify:universe-230f46e1-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-50c181611b2c4bf2c35b`, `evidence:runtime-observed-proof-129bef2a28c88ca60e2c` |
| `coverage-scenario:3272d1cc0edb15536a3c13eb` | `verify:universe-6a3c13eb-expected`, `verify:universe-6a3c13eb-negative` | `verify:universe-6a3c13eb-expected`, `verify:universe-6a3c13eb-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-a00d0134ab2f9b74ec8f`, `evidence:runtime-observed-proof-39813869c1a1e4ca8fec` |
| `coverage-scenario:6f717f8e7c64216dbb4f1e0b` | `verify:universe-bb4f1e0b-expected`, `verify:universe-bb4f1e0b-negative` | `verify:universe-bb4f1e0b-expected`, `verify:universe-bb4f1e0b-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-3833e019a6e32f75f7cc`, `evidence:runtime-observed-proof-895ab35bfe67b98c2cb9` |
| `coverage-scenario:48079dd4871b73ccf7ab67ee` | `verify:universe-f7ab67ee-expected`, `verify:universe-f7ab67ee-negative` | `verify:universe-f7ab67ee-expected`, `verify:universe-f7ab67ee-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-0a1d21f23ea7c5b5a473`, `evidence:runtime-observed-proof-64165c4c9b0479f31333` |
| `coverage-scenario:ade6f1a45d265c29dfbddc4b` | `verify:universe-dfbddc4b-expected`, `verify:universe-dfbddc4b-negative` | `verify:universe-dfbddc4b-expected`, `verify:universe-dfbddc4b-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-4cf861ea705d96351e7b`, `evidence:runtime-observed-proof-2afc5aa5f51f77179b61` |
| `coverage-scenario:aeb5a30daff1205dca9f9831` | `verify:universe-ca9f9831-expected`, `verify:universe-ca9f9831-negative` | `verify:universe-ca9f9831-expected`, `verify:universe-ca9f9831-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-77195bc86d0883dd4859`, `evidence:runtime-observed-proof-10b4f39ad55b29a61d57` |
| `coverage-scenario:989f4d4f1010b74f8dca8d52` | `verify:universe-8dca8d52-expected`, `verify:universe-8dca8d52-negative` | `verify:universe-8dca8d52-expected`, `verify:universe-8dca8d52-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-7f05177ef676e9142f06`, `evidence:runtime-observed-proof-6a1b12ff3559ac05e5e3` |
| `coverage-scenario:c835f11288b928940ad03c62` | `verify:universe-0ad03c62-expected`, `verify:universe-0ad03c62-negative` | `verify:universe-0ad03c62-expected`, `verify:universe-0ad03c62-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-559c5a7c06e773cb4d94`, `evidence:runtime-observed-proof-1f3053a9816e3208430f` |
| `coverage-scenario:208b4e9979a2effb88185f96` | `verify:universe-88185f96-expected`, `verify:universe-88185f96-negative` | `verify:universe-88185f96-expected`, `verify:universe-88185f96-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-7a0b42b5583875be5174`, `evidence:runtime-observed-proof-ce6cff30826053ba2542` |
| `coverage-scenario:5ca8093ed114d2caab243239` | `verify:universe-ab243239-expected`, `verify:universe-ab243239-negative` | `verify:universe-ab243239-expected`, `verify:universe-ab243239-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-a2ae53c13ba450ccbffc`, `evidence:runtime-observed-proof-174838e91c79f44c2f72` |
| `coverage-scenario:29f7d80aefbb6a5feafe80a3` | `verify:universe-eafe80a3-expected`, `verify:universe-eafe80a3-negative` | `verify:universe-eafe80a3-expected`, `verify:universe-eafe80a3-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-3a8ea2868458b83cdb33`, `evidence:runtime-observed-proof-adbcf030dff5eddd7f5c` |
| `coverage-scenario:1dbeb7a48e5d24c87bea42b3` | `verify:universe-7bea42b3-expected`, `verify:universe-7bea42b3-negative` | `verify:universe-7bea42b3-expected`, `verify:universe-7bea42b3-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-73253ed44b9e253a88cb`, `evidence:runtime-observed-proof-9cf63a9e56481a6fc27d` |
| `coverage-scenario:c2fb3632955495444cd77b0a` | `verify:universe-4cd77b0a-expected`, `verify:universe-4cd77b0a-negative` | `verify:universe-4cd77b0a-expected`, `verify:universe-4cd77b0a-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-a8ae74acee1c786a5efe`, `evidence:runtime-observed-proof-384096f2c51507882454` |
| `coverage-scenario:6905316f96d53cf16f5a5aa3` | `verify:universe-6f5a5aa3-expected`, `verify:universe-6f5a5aa3-negative` | `verify:universe-6f5a5aa3-expected`, `verify:universe-6f5a5aa3-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-79bb360923f1f6bae8e1`, `evidence:runtime-observed-proof-d23582d795efb8ef7f41` |
| `coverage-scenario:7e08056abf0da28194a115a4` | `verify:universe-94a115a4-expected`, `verify:universe-94a115a4-negative` | `verify:universe-94a115a4-expected`, `verify:universe-94a115a4-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-fd59672ebd21554e8e65`, `evidence:runtime-observed-proof-af4d8c7d5b7811fd3798` |
| `coverage-scenario:d2242869cef4b9434087f54e` | `verify:universe-4087f54e-expected`, `verify:universe-4087f54e-negative` | `verify:universe-4087f54e-expected`, `verify:universe-4087f54e-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-7b25d973d6cb40cd40cc`, `evidence:runtime-observed-proof-23bc96c3ab7d06d1c088` |
| `coverage-scenario:3b33292838217b6f3ad67323` | `verify:universe-3ad67323-expected`, `verify:universe-3ad67323-negative` | `verify:universe-3ad67323-expected`, `verify:universe-3ad67323-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-ee972279cb0a66368d36`, `evidence:runtime-observed-proof-067c0ec0e9df62b0e469` |
| `coverage-scenario:dddd76cf5cba725595d747e1` | `verify:universe-95d747e1-expected`, `verify:universe-95d747e1-negative` | `verify:universe-95d747e1-expected`, `verify:universe-95d747e1-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-b62000a72e049da75b26`, `evidence:runtime-observed-proof-084e8cdb032d8202a54b` |
| `coverage-scenario:62ea36bafb14320100218482` | `verify:universe-00218482-expected`, `verify:universe-00218482-negative` | `verify:universe-00218482-expected`, `verify:universe-00218482-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-836f4252cd6ffc569462`, `evidence:runtime-observed-proof-c9051539fa587a64efe1` |
| `coverage-scenario:5808f2fdec78752d72c3bacf` | `verify:universe-72c3bacf-expected`, `verify:universe-72c3bacf-negative` | `verify:universe-72c3bacf-expected`, `verify:universe-72c3bacf-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-7d5c54753ae4850b3f29`, `evidence:runtime-observed-proof-8430cd0784f0b3f73b57` |
| `coverage-scenario:f8b5b1567a6a232da0707b63` | `verify:universe-a0707b63-expected`, `verify:universe-a0707b63-negative` | `verify:universe-a0707b63-expected`, `verify:universe-a0707b63-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-bc19c9c606908407fabf`, `evidence:runtime-observed-proof-6e3456ef3bebee9c76e8` |
| `coverage-scenario:ec7f91d480466a9da4833a0b` | `verify:universe-a4833a0b-expected`, `verify:universe-a4833a0b-negative` | `verify:universe-a4833a0b-expected`, `verify:universe-a4833a0b-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-939e64da3debdfa5ce71`, `evidence:runtime-observed-proof-9af0b5d96ceea7fb7f18` |
| `coverage-scenario:4f13fa15a81c906d8331c5ae` | `verify:universe-8331c5ae-expected`, `verify:universe-8331c5ae-negative` | `verify:universe-8331c5ae-expected`, `verify:universe-8331c5ae-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-54fd0cbc7befd6355cc9`, `evidence:runtime-observed-proof-a25fcccaf83e95b2f627` |
| `coverage-scenario:c09cab4c94ed1443aa4f5177` | `verify:universe-aa4f5177-expected`, `verify:universe-aa4f5177-negative` | `verify:universe-aa4f5177-expected`, `verify:universe-aa4f5177-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-f3a4563bd8476581bd96`, `evidence:runtime-observed-proof-da1a0e3a85a416bc3d38` |
| `coverage-scenario:ef0f28c65a09b433d36e2a76` | `verify:universe-d36e2a76-expected`, `verify:universe-d36e2a76-negative` | `verify:universe-d36e2a76-expected`, `verify:universe-d36e2a76-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-40fb52a88645b546cd07`, `evidence:runtime-observed-proof-345ba77bb8899e938497` |
| `coverage-scenario:8435057357f8c67e610c7460` | `verify:universe-610c7460-expected`, `verify:universe-610c7460-negative` | `verify:universe-610c7460-expected`, `verify:universe-610c7460-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-a74967512e88fe1a6351`, `evidence:runtime-observed-proof-feecc3a494242f830d81` |
| `coverage-scenario:e7db0204a08697529a3804d1` | `verify:universe-9a3804d1-expected`, `verify:universe-9a3804d1-negative` | `verify:universe-9a3804d1-expected`, `verify:universe-9a3804d1-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-0e4edb4968c686c7822f`, `evidence:runtime-observed-proof-619bd95b44a63a0c2e9f` |
| `coverage-scenario:627884e4631b728248f98d4e` | `verify:universe-48f98d4e-expected`, `verify:universe-48f98d4e-negative` | `verify:universe-48f98d4e-expected`, `verify:universe-48f98d4e-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-0e5e1552a17b67a3ac28`, `evidence:runtime-observed-proof-59640216e16852df6a0a` |
| `coverage-scenario:082ecd834caae2279a1bf08b` | `verify:universe-9a1bf08b-expected`, `verify:universe-9a1bf08b-negative` | `verify:universe-9a1bf08b-expected`, `verify:universe-9a1bf08b-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-cf23257e2fe5f4ebb5b2`, `evidence:runtime-observed-proof-681cc422b5fabf7c229c` |
| `coverage-scenario:ff3a5f1df630306ee710bac0` | `verify:universe-e710bac0-expected`, `verify:universe-e710bac0-negative` | `verify:universe-e710bac0-expected`, `verify:universe-e710bac0-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-1aa74e5f8b8fa6082498`, `evidence:runtime-observed-proof-0c93ca6453919d4de5b7` |
| `coverage-scenario:a06aef8c3cb6dd8966ba9a71` | `verify:universe-66ba9a71-expected`, `verify:universe-66ba9a71-negative` | `verify:universe-66ba9a71-expected`, `verify:universe-66ba9a71-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-02a3ddcfcf2ece7ca844`, `evidence:runtime-observed-proof-69fd7dd0ec2166ebe1d7` |
| `coverage-scenario:9baeb48aec07c853211b9347` | `verify:universe-211b9347-expected`, `verify:universe-211b9347-negative` | `verify:universe-211b9347-expected`, `verify:universe-211b9347-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-f2fe947cbb177db744f1`, `evidence:runtime-observed-proof-53036f0258587dd11d9f` |
| `coverage-scenario:e0061077530f923c3e9d296e` | `verify:universe-3e9d296e-expected`, `verify:universe-3e9d296e-negative` | `verify:universe-3e9d296e-expected`, `verify:universe-3e9d296e-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-69de9108b7fe9e97c2af`, `evidence:runtime-observed-proof-40c834354ee37fe86a7f` |
| `coverage-scenario:a5f2b10fd0a66cbe4ea05a71` | `verify:universe-4ea05a71-expected`, `verify:universe-4ea05a71-negative` | `verify:universe-4ea05a71-expected`, `verify:universe-4ea05a71-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-ffa2d2ba416029bb3499`, `evidence:runtime-observed-proof-406ad8a7f62f332b655e` |
| `coverage-scenario:891d12ce1ee1d2980a935c21` | `verify:universe-0a935c21-expected`, `verify:universe-0a935c21-negative` | `verify:universe-0a935c21-expected`, `verify:universe-0a935c21-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-376448331fefcf1702a7`, `evidence:runtime-observed-proof-a42ef4213003b1c7955d` |
| `coverage-scenario:ba3f489385b617c1ce319ca9` | `verify:universe-ce319ca9-expected`, `verify:universe-ce319ca9-negative` | `verify:universe-ce319ca9-expected`, `verify:universe-ce319ca9-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-4b54f3c239f11ab7a165`, `evidence:runtime-observed-proof-9b869d9f40c835ebf41e` |
| `coverage-scenario:ba39a1bceb6834df010135e0` | `verify:universe-010135e0-expected`, `verify:universe-010135e0-negative` | `verify:universe-010135e0-expected`, `verify:universe-010135e0-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d0c8135dfb43abf138ad`, `evidence:runtime-observed-proof-65b87c3f9dd49e966012` |
| `coverage-scenario:68d06d9ea1a65c887e9a2282` | `verify:universe-7e9a2282-expected`, `verify:universe-7e9a2282-negative` | `verify:universe-7e9a2282-expected`, `verify:universe-7e9a2282-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-859323409eaced5882ac`, `evidence:runtime-observed-proof-17193589e0828b8971e6` |
| `coverage-scenario:0c36f7a0be696aec1a4fabb1` | `verify:universe-1a4fabb1-expected`, `verify:universe-1a4fabb1-negative` | `verify:universe-1a4fabb1-expected`, `verify:universe-1a4fabb1-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d7b7f34c22aa76910d30`, `evidence:runtime-observed-proof-8fe163944414e7d05067` |
| `coverage-scenario:65bb609c4f41160568b60ab3` | `verify:universe-68b60ab3-expected`, `verify:universe-68b60ab3-negative` | `verify:universe-68b60ab3-expected`, `verify:universe-68b60ab3-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-7d69946119a78cd09402`, `evidence:runtime-observed-proof-0d03ab3ac80c13fd562b` |
| `coverage-scenario:fa831c674e070c926a0a12c4` | `verify:universe-6a0a12c4-expected`, `verify:universe-6a0a12c4-negative` | `verify:universe-6a0a12c4-expected`, `verify:universe-6a0a12c4-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-8382fdd3517912235b3c`, `evidence:runtime-observed-proof-155bd3913ed1f936b38d` |
| `coverage-scenario:a4314123edddb1c83b1e8f43` | `verify:universe-3b1e8f43-expected`, `verify:universe-3b1e8f43-negative` | `verify:universe-3b1e8f43-expected`, `verify:universe-3b1e8f43-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-caede192e5e8d5edc5c8`, `evidence:runtime-observed-proof-4524a6f3ed1f624517ac` |
| `coverage-scenario:0251c7a2449f87f10adf81f2` | `verify:universe-0adf81f2-expected`, `verify:universe-0adf81f2-negative` | `verify:universe-0adf81f2-expected`, `verify:universe-0adf81f2-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-fea830ebdeff2248ebe1`, `evidence:runtime-observed-proof-df8362538c6c6a9effc6` |
| `coverage-scenario:529fb9db9c61162241c23483` | `verify:universe-41c23483-expected`, `verify:universe-41c23483-negative` | `verify:universe-41c23483-expected`, `verify:universe-41c23483-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-dc3a0e8af397740882e9`, `evidence:runtime-observed-proof-98784547f2bf99c4a025` |
| `coverage-scenario:992de49bc34fc2d806b86b13` | `verify:universe-06b86b13-expected`, `verify:universe-06b86b13-negative` | `verify:universe-06b86b13-expected`, `verify:universe-06b86b13-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-f47f98e11daeed0e37ea`, `evidence:runtime-observed-proof-2e0b202066a75f6f91a3` |
| `coverage-scenario:ff3062fc90293a63d6fb92e1` | `verify:universe-d6fb92e1-expected`, `verify:universe-d6fb92e1-negative` | `verify:universe-d6fb92e1-expected`, `verify:universe-d6fb92e1-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-27e527ce5d984c0a75a5`, `evidence:runtime-observed-proof-18798e14155abf98fbe4` |

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `runtime:self-runtime-negative` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-negative.log` | node scripts/verification-runtime-self-service.mjs negative | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:2720c59e5878303132946002df6cd08e812b58ff1cdf8453aab90f2ffc9522b5` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-runtime-positive` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-positive.log` | node scripts/verification-runtime-self-service.mjs positive | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:48c84829e1b1558d08bc9bb6179088f09b46f00fe63383e752f448f194bc64ee` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-candidate-verification` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-candidate-verification.log` | npm run verify:pre-runtime | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:a197838c685be11bb481cbcdf9fb6b2315db8b5fd680321241b251bd269a6c24` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-obligation-evidence` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr`, `verify:data-model-data-model-check-data-model-historical-records-migrat`, `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders`, `verify:external-integration-integration-contract-check-external-integra`, `verify:permission-risk-permission-boundary-test-role-tenant-visibility-`, `verify:release-impact-release-smoke-check-release-rollback-monitoring-o`, `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb`, `verify:test-coverage-regression-smoke-task-specific-verification-exists`, `verify:universe-00218482-expected`, `verify:universe-00218482-negative`, `verify:universe-010135e0-expected`, `verify:universe-010135e0-negative`, `verify:universe-01b5deae-expected`, `verify:universe-01b5deae-negative`, `verify:universe-06b86b13-expected`, `verify:universe-06b86b13-negative`, `verify:universe-0a935c21-expected`, `verify:universe-0a935c21-negative`, `verify:universe-0ad03c62-expected`, `verify:universe-0ad03c62-negative`, `verify:universe-0adf81f2-expected`, `verify:universe-0adf81f2-negative`, `verify:universe-133bfd71-expected`, `verify:universe-133bfd71-negative`, `verify:universe-1a4fabb1-expected`, `verify:universe-1a4fabb1-negative`, `verify:universe-211b9347-expected`, `verify:universe-211b9347-negative`, `verify:universe-230f46e1-expected`, `verify:universe-230f46e1-negative`, `verify:universe-370c5a1e-expected`, `verify:universe-370c5a1e-negative`, `verify:universe-3ad67323-expected`, `verify:universe-3ad67323-negative`, `verify:universe-3b1e8f43-expected`, `verify:universe-3b1e8f43-negative`, `verify:universe-3e9d296e-expected`, `verify:universe-3e9d296e-negative`, `verify:universe-4087f54e-expected`, `verify:universe-4087f54e-negative`, `verify:universe-41c23483-expected`, `verify:universe-41c23483-negative`, `verify:universe-48f98d4e-expected`, `verify:universe-48f98d4e-negative`, `verify:universe-4cd77b0a-expected`, `verify:universe-4cd77b0a-negative`, `verify:universe-4ea05a71-expected`, `verify:universe-4ea05a71-negative`, `verify:universe-610c7460-expected`, `verify:universe-610c7460-negative`, `verify:universe-66ba9a71-expected`, `verify:universe-66ba9a71-negative`, `verify:universe-68b60ab3-expected`, `verify:universe-68b60ab3-negative`, `verify:universe-6a0a12c4-expected`, `verify:universe-6a0a12c4-negative`, `verify:universe-6a3c13eb-expected`, `verify:universe-6a3c13eb-negative`, `verify:universe-6f5a5aa3-expected`, `verify:universe-6f5a5aa3-negative`, `verify:universe-72c3bacf-expected`, `verify:universe-72c3bacf-negative`, `verify:universe-7bea42b3-expected`, `verify:universe-7bea42b3-negative`, `verify:universe-7e9a2282-expected`, `verify:universe-7e9a2282-negative`, `verify:universe-8331c5ae-expected`, `verify:universe-8331c5ae-negative`, `verify:universe-868d4b91-expected`, `verify:universe-868d4b91-negative`, `verify:universe-88185f96-expected`, `verify:universe-88185f96-negative`, `verify:universe-8dca8d52-expected`, `verify:universe-8dca8d52-negative`, `verify:universe-909edc85-expected`, `verify:universe-909edc85-negative`, `verify:universe-94a115a4-expected`, `verify:universe-94a115a4-negative`, `verify:universe-95d747e1-expected`, `verify:universe-95d747e1-negative`, `verify:universe-9a1bf08b-expected`, `verify:universe-9a1bf08b-negative`, `verify:universe-9a3804d1-expected`, `verify:universe-9a3804d1-negative`, `verify:universe-9f9fa3e5-expected`, `verify:universe-9f9fa3e5-negative`, `verify:universe-a0707b63-expected`, `verify:universe-a0707b63-negative`, `verify:universe-a238de93-expected`, `verify:universe-a238de93-negative`, `verify:universe-a4833a0b-expected`, `verify:universe-a4833a0b-negative`, `verify:universe-aa4f5177-expected`, `verify:universe-aa4f5177-negative`, `verify:universe-ab243239-expected`, `verify:universe-ab243239-negative`, `verify:universe-bb4f1e0b-expected`, `verify:universe-bb4f1e0b-negative`, `verify:universe-ca9f9831-expected`, `verify:universe-ca9f9831-negative`, `verify:universe-ce319ca9-expected`, `verify:universe-ce319ca9-negative`, `verify:universe-d36e2a76-expected`, `verify:universe-d36e2a76-negative`, `verify:universe-d5cda5ec-expected`, `verify:universe-d5cda5ec-negative`, `verify:universe-d6fb92e1-expected`, `verify:universe-d6fb92e1-negative`, `verify:universe-dfbddc4b-expected`, `verify:universe-dfbddc4b-negative`, `verify:universe-e710bac0-expected`, `verify:universe-e710bac0-negative`, `verify:universe-eafe80a3-expected`, `verify:universe-eafe80a3-negative`, `verify:universe-f7ab67ee-expected`, `verify:universe-f7ab67ee-negative`, `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af`, `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-runtime-behavior` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:257e20cf25778e772d417576177e48f3740bd9ad7e44195b8d726eb64ed38c76` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `evidence:runtime-observed-proof-483e9b2cb75b726f0695` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-01b5deae-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/task-obligation-hardcut.test.mjs :: 1.113 Work Queue takeover ignores fixtures and accepts one governed current task in a dirty worktree; source line 4. |
| `evidence:runtime-observed-proof-8f5826af135bc96e4317` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-01b5deae-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/task-obligation-hardcut.test.mjs :: 1.113 Work Queue takeover ignores fixtures and accepts one governed current task in a dirty worktree; source line 5. |
| `evidence:runtime-observed-proof-40eeec27cf402d543de0` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-370c5a1e-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 6. |
| `evidence:runtime-observed-proof-b8f6d5e2606cc8d3e76e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-370c5a1e-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 7. |
| `evidence:runtime-observed-proof-8074726f1340db93a631` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9f9fa3e5-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 8. |
| `evidence:runtime-observed-proof-c09d33262cd36dbe50b3` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9f9fa3e5-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 9. |
| `evidence:runtime-observed-proof-6c3e2ab5061a2550c76d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d5cda5ec-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 10. |
| `evidence:runtime-observed-proof-3be29929cb5adb63b4b8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d5cda5ec-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 11. |
| `evidence:runtime-observed-proof-eb8017c68e13f2d6ab80` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-909edc85-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 12. |
| `evidence:runtime-observed-proof-dbb2e99e646226d7a5d8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-909edc85-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 13. |
| `evidence:runtime-observed-proof-013ec0534cfd2e60a36d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-868d4b91-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 14. |
| `evidence:runtime-observed-proof-86bef721dd8885f9c4a4` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-868d4b91-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 15. |
| `evidence:runtime-observed-proof-9532a686b8f9f5cd2869` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-133bfd71-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 16. |
| `evidence:runtime-observed-proof-c7e12b63bcc7bfe196d0` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-133bfd71-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 17. |
| `evidence:runtime-observed-proof-4699f1b9fe49cbd678c4` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a238de93-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 18. |
| `evidence:runtime-observed-proof-af970f13ef0b0c57fc74` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a238de93-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 19. |
| `evidence:runtime-observed-proof-50c181611b2c4bf2c35b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-230f46e1-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 20. |
| `evidence:runtime-observed-proof-129bef2a28c88ca60e2c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-230f46e1-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 21. |
| `evidence:runtime-observed-proof-c9efa8660cee159c7f2f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:data-model-data-model-check-data-model-historical-records-migrat` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/typed-consumer-contract.test.mjs :: 1.113 historical completion evidence is readable but cannot satisfy current readiness; source line 22. |
| `evidence:runtime-observed-proof-df2569ac7d558efb63e1` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/typed-consumer-contract.test.mjs :: 1.113 evidence authority binds an exact item inside a file-backed artifact; source line 23. |
| `evidence:runtime-observed-proof-a00d0134ab2f9b74ec8f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6a3c13eb-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound local authority accepts an exact reversible existing-project adoption graph; source line 26. |
| `evidence:runtime-observed-proof-39813869c1a1e4ca8fec` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6a3c13eb-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound local authority accepts an exact reversible existing-project adoption graph; source line 27. |
| `evidence:runtime-observed-proof-3833e019a6e32f75f7cc` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-bb4f1e0b-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a target lock prevents two controlled applies from starting concurrently; source line 28. |
| `evidence:runtime-observed-proof-895ab35bfe67b98c2cb9` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-bb4f1e0b-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a target lock prevents two controlled applies from starting concurrently; source line 29. |
| `evidence:runtime-observed-proof-0a1d21f23ea7c5b5a473` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-f7ab67ee-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 30. |
| `evidence:runtime-observed-proof-64165c4c9b0479f31333` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-f7ab67ee-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 31. |
| `evidence:runtime-observed-proof-4cf861ea705d96351e7b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-dfbddc4b-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 32. |
| `evidence:runtime-observed-proof-2afc5aa5f51f77179b61` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-dfbddc4b-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 33. |
| `evidence:runtime-observed-proof-77195bc86d0883dd4859` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ca9f9831-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: APPLY_VERIFIED closeout validation failure immediately rolls back and verifies preimages; source line 34. |
| `evidence:runtime-observed-proof-10b4f39ad55b29a61d57` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ca9f9831-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: APPLY_VERIFIED closeout validation failure immediately rolls back and verifies preimages; source line 35. |
| `evidence:runtime-observed-proof-7f05177ef676e9142f06` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-8dca8d52-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 36. |
| `evidence:runtime-observed-proof-6a1b12ff3559ac05e5e3` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-8dca8d52-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 37. |
| `evidence:runtime-observed-proof-559c5a7c06e773cb4d94` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0ad03c62-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 38. |
| `evidence:runtime-observed-proof-1f3053a9816e3208430f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0ad03c62-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 39. |
| `evidence:runtime-observed-proof-7a0b42b5583875be5174` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-88185f96-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 40. |
| `evidence:runtime-observed-proof-ce6cff30826053ba2542` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-88185f96-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 41. |
| `evidence:runtime-observed-proof-a2ae53c13ba450ccbffc` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ab243239-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 42. |
| `evidence:runtime-observed-proof-174838e91c79f44c2f72` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ab243239-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 43. |
| `evidence:runtime-observed-proof-e0a04c5b32bc62f0fa05` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 44. |
| `evidence:runtime-observed-proof-3a8ea2868458b83cdb33` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-eafe80a3-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 47. |
| `evidence:runtime-observed-proof-adbcf030dff5eddd7f5c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-eafe80a3-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 48. |
| `evidence:runtime-observed-proof-73253ed44b9e253a88cb` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7bea42b3-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 adoption autopilot consumes one strict same-run chain for a light existing project; source line 49. |
| `evidence:runtime-observed-proof-9cf63a9e56481a6fc27d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7bea42b3-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 adoption autopilot consumes one strict same-run chain for a light existing project; source line 50. |
| `evidence:runtime-observed-proof-a8ae74acee1c786a5efe` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4cd77b0a-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 51. |
| `evidence:runtime-observed-proof-384096f2c51507882454` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4cd77b0a-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 52. |
| `evidence:runtime-observed-proof-79bb360923f1f6bae8e1` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6f5a5aa3-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 53. |
| `evidence:runtime-observed-proof-d23582d795efb8ef7f41` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6f5a5aa3-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 54. |
| `evidence:runtime-observed-proof-fd59672ebd21554e8e65` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-94a115a4-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 55. |
| `evidence:runtime-observed-proof-af4d8c7d5b7811fd3798` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-94a115a4-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 56. |
| `evidence:runtime-observed-proof-7b25d973d6cb40cd40cc` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4087f54e-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 57. |
| `evidence:runtime-observed-proof-23bc96c3ab7d06d1c088` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4087f54e-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 58. |
| `evidence:runtime-observed-proof-ee972279cb0a66368d36` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3ad67323-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: Work Queue and adoption assurance reject directory and .gitkeep presence as behavioral proof; source line 59. |
| `evidence:runtime-observed-proof-067c0ec0e9df62b0e469` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3ad67323-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: Work Queue and adoption assurance reject directory and .gitkeep presence as behavioral proof; source line 60. |
| `evidence:runtime-observed-proof-b62000a72e049da75b26` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-95d747e1-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 61. |
| `evidence:runtime-observed-proof-084e8cdb032d8202a54b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-95d747e1-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 62. |
| `evidence:runtime-observed-proof-836f4252cd6ffc569462` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-00218482-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 current-work discovery covers root TODO, sessions, plans, and conflicting current items; source line 63. |
| `evidence:runtime-observed-proof-c9051539fa587a64efe1` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-00218482-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 current-work discovery covers root TODO, sessions, plans, and conflicting current items; source line 64. |
| `evidence:runtime-observed-proof-a85694134a008b0ac30d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: generated project cold-starts from its own cwd and exercises the strict operating route; source line 65. |
| `evidence:runtime-observed-proof-2e2624053ab54b3f326d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: generated project cold-starts from its own cwd and exercises the strict operating route; source line 66. |
| `evidence:runtime-observed-proof-68b78ef5f5f0e7ed9086` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:permission-risk-permission-boundary-test-role-tenant-visibility-` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound authority rejects business code and a fabricated legacy-agent bridge; source line 67. |
| `evidence:runtime-observed-proof-7d5c54753ae4850b3f29` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-72c3bacf-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 70. |
| `evidence:runtime-observed-proof-8430cd0784f0b3f73b57` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-72c3bacf-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 71. |
| `evidence:runtime-observed-proof-bc19c9c606908407fabf` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a0707b63-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 72. |
| `evidence:runtime-observed-proof-6e3456ef3bebee9c76e8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a0707b63-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 73. |
| `evidence:runtime-observed-proof-939e64da3debdfa5ce71` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a4833a0b-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: baseline planning augments explicit packs to complete environment and profile coverage; source line 74. |
| `evidence:runtime-observed-proof-9af0b5d96ceea7fb7f18` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a4833a0b-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: baseline planning augments explicit packs to complete environment and profile coverage; source line 75. |
| `evidence:runtime-observed-proof-54fd0cbc7befd6355cc9` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-8331c5ae-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: every supported starter reaches verified project-entry activation; source line 76. |
| `evidence:runtime-observed-proof-a25fcccaf83e95b2f627` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-8331c5ae-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: every supported starter reaches verified project-entry activation; source line 77. |
| `evidence:runtime-observed-proof-f3a4563bd8476581bd96` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-aa4f5177-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 78. |
| `evidence:runtime-observed-proof-da1a0e3a85a416bc3d38` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-aa4f5177-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 79. |
| `evidence:runtime-observed-proof-40fb52a88645b546cd07` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d36e2a76-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 80. |
| `evidence:runtime-observed-proof-345ba77bb8899e938497` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d36e2a76-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 81. |
| `evidence:runtime-observed-proof-a74967512e88fe1a6351` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-610c7460-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: project evidence failures and truncation are visible and block baseline selection; source line 82. |
| `evidence:runtime-observed-proof-feecc3a494242f830d81` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-610c7460-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: project evidence failures and truncation are visible and block baseline selection; source line 83. |
| `evidence:runtime-observed-proof-0e4edb4968c686c7822f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9a3804d1-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 84. |
| `evidence:runtime-observed-proof-619bd95b44a63a0c2e9f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9a3804d1-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 85. |
| `evidence:runtime-observed-proof-0e5e1552a17b67a3ac28` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-48f98d4e-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: installed and source-side baseline checks resolve the same target authority; source line 86. |
| `evidence:runtime-observed-proof-59640216e16852df6a0a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-48f98d4e-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: installed and source-side baseline checks resolve the same target authority; source line 87. |
| `evidence:runtime-observed-proof-cf23257e2fe5f4ebb5b2` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9a1bf08b-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 90. |
| `evidence:runtime-observed-proof-681cc422b5fabf7c229c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9a1bf08b-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 91. |
| `evidence:runtime-observed-proof-1aa74e5f8b8fa6082498` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-e710bac0-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 92. |
| `evidence:runtime-observed-proof-0c93ca6453919d4de5b7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-e710bac0-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 93. |
| `evidence:runtime-observed-proof-02a3ddcfcf2ece7ca844` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-66ba9a71-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 94. |
| `evidence:runtime-observed-proof-69fd7dd0ec2166ebe1d7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-66ba9a71-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 95. |
| `evidence:runtime-observed-proof-f2fe947cbb177db744f1` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-211b9347-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 96. |
| `evidence:runtime-observed-proof-53036f0258587dd11d9f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-211b9347-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 97. |
| `evidence:runtime-observed-proof-69de9108b7fe9e97c2af` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3e9d296e-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 98. |
| `evidence:runtime-observed-proof-40c834354ee37fe86a7f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3e9d296e-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 99. |
| `evidence:runtime-observed-proof-ffa2d2ba416029bb3499` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4ea05a71-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 100. |
| `evidence:runtime-observed-proof-406ad8a7f62f332b655e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4ea05a71-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 101. |
| `evidence:runtime-observed-proof-376448331fefcf1702a7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0a935c21-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 102. |
| `evidence:runtime-observed-proof-a42ef4213003b1c7955d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0a935c21-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 103. |
| `evidence:runtime-observed-proof-4b54f3c239f11ab7a165` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ce319ca9-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 104. |
| `evidence:runtime-observed-proof-9b869d9f40c835ebf41e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ce319ca9-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 105. |
| `evidence:runtime-observed-proof-d0c8135dfb43abf138ad` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-010135e0-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 106. |
| `evidence:runtime-observed-proof-65b87c3f9dd49e966012` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-010135e0-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 107. |
| `evidence:runtime-observed-proof-65954073c9d3b199de41` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:external-integration-integration-contract-check-external-integra` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 108. |
| `evidence:runtime-observed-proof-d5a92fd2b8b0e0600392` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 109. |
| `evidence:runtime-observed-proof-f61628766f85822bc413` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: workflow package scripts recursively expose provider deploys and explicit source_only stays blocked; source line 110. |
| `evidence:runtime-observed-proof-859323409eaced5882ac` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7e9a2282-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 113. |
| `evidence:runtime-observed-proof-17193589e0828b8971e6` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7e9a2282-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 114. |
| `evidence:runtime-observed-proof-d7b7f34c22aa76910d30` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-1a4fabb1-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 115. |
| `evidence:runtime-observed-proof-8fe163944414e7d05067` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-1a4fabb1-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 116. |
| `evidence:runtime-observed-proof-7d69946119a78cd09402` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-68b60ab3-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 117. |
| `evidence:runtime-observed-proof-0d03ab3ac80c13fd562b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-68b60ab3-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 118. |
| `evidence:runtime-observed-proof-8382fdd3517912235b3c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6a0a12c4-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 119. |
| `evidence:runtime-observed-proof-155bd3913ed1f936b38d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6a0a12c4-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 120. |
| `evidence:runtime-observed-proof-caede192e5e8d5edc5c8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3b1e8f43-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 121. |
| `evidence:runtime-observed-proof-4524a6f3ed1f624517ac` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3b1e8f43-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 122. |
| `evidence:runtime-observed-proof-fea830ebdeff2248ebe1` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0adf81f2-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 123. |
| `evidence:runtime-observed-proof-df8362538c6c6a9effc6` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0adf81f2-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 124. |
| `evidence:runtime-observed-proof-dc3a0e8af397740882e9` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-41c23483-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 125. |
| `evidence:runtime-observed-proof-98784547f2bf99c4a025` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-41c23483-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 126. |
| `evidence:runtime-observed-proof-f47f98e11daeed0e37ea` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-06b86b13-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 127. |
| `evidence:runtime-observed-proof-2e0b202066a75f6f91a3` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-06b86b13-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 128. |
| `evidence:runtime-observed-proof-27e527ce5d984c0a75a5` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d6fb92e1-expected` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 129. |
| `evidence:runtime-observed-proof-18798e14155abf98fbe4` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d6fb92e1-negative` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 130. |
| `evidence:runtime-observed-proof-7562517dce9c24a39330` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 131. |
| `evidence:runtime-observed-proof-c245657c0c7c5ebb6cac` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:257e20cf25778e772d417576177e48f3740bd9ad7e44195b8d726eb64ed38c76` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1. |
| `evidence:runtime-observed-proof-b43fce3bbbfb6a03e28a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:257e20cf25778e772d417576177e48f3740bd9ad7e44195b8d726eb64ed38c76` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2. |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:universe-01b5deae-expected` | `COVERED` | `evidence:runtime-observed-proof-483e9b2cb75b726f0695` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-01b5deae-negative` | `COVERED` | `evidence:runtime-observed-proof-8f5826af135bc96e4317` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-370c5a1e-expected` | `COVERED` | `evidence:runtime-observed-proof-40eeec27cf402d543de0` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-370c5a1e-negative` | `COVERED` | `evidence:runtime-observed-proof-b8f6d5e2606cc8d3e76e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9f9fa3e5-expected` | `COVERED` | `evidence:runtime-observed-proof-8074726f1340db93a631` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9f9fa3e5-negative` | `COVERED` | `evidence:runtime-observed-proof-c09d33262cd36dbe50b3` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d5cda5ec-expected` | `COVERED` | `evidence:runtime-observed-proof-6c3e2ab5061a2550c76d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d5cda5ec-negative` | `COVERED` | `evidence:runtime-observed-proof-3be29929cb5adb63b4b8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-909edc85-expected` | `COVERED` | `evidence:runtime-observed-proof-eb8017c68e13f2d6ab80` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-909edc85-negative` | `COVERED` | `evidence:runtime-observed-proof-dbb2e99e646226d7a5d8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-868d4b91-expected` | `COVERED` | `evidence:runtime-observed-proof-013ec0534cfd2e60a36d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-868d4b91-negative` | `COVERED` | `evidence:runtime-observed-proof-86bef721dd8885f9c4a4` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-133bfd71-expected` | `COVERED` | `evidence:runtime-observed-proof-9532a686b8f9f5cd2869` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-133bfd71-negative` | `COVERED` | `evidence:runtime-observed-proof-c7e12b63bcc7bfe196d0` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a238de93-expected` | `COVERED` | `evidence:runtime-observed-proof-4699f1b9fe49cbd678c4` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a238de93-negative` | `COVERED` | `evidence:runtime-observed-proof-af970f13ef0b0c57fc74` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-230f46e1-expected` | `COVERED` | `evidence:runtime-observed-proof-50c181611b2c4bf2c35b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-230f46e1-negative` | `COVERED` | `evidence:runtime-observed-proof-129bef2a28c88ca60e2c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6a3c13eb-expected` | `COVERED` | `evidence:runtime-observed-proof-a00d0134ab2f9b74ec8f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6a3c13eb-negative` | `COVERED` | `evidence:runtime-observed-proof-39813869c1a1e4ca8fec` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-bb4f1e0b-expected` | `COVERED` | `evidence:runtime-observed-proof-3833e019a6e32f75f7cc` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-bb4f1e0b-negative` | `COVERED` | `evidence:runtime-observed-proof-895ab35bfe67b98c2cb9` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f7ab67ee-expected` | `COVERED` | `evidence:runtime-observed-proof-0a1d21f23ea7c5b5a473` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f7ab67ee-negative` | `COVERED` | `evidence:runtime-observed-proof-64165c4c9b0479f31333` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-dfbddc4b-expected` | `COVERED` | `evidence:runtime-observed-proof-4cf861ea705d96351e7b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-dfbddc4b-negative` | `COVERED` | `evidence:runtime-observed-proof-2afc5aa5f51f77179b61` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ca9f9831-expected` | `COVERED` | `evidence:runtime-observed-proof-77195bc86d0883dd4859` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ca9f9831-negative` | `COVERED` | `evidence:runtime-observed-proof-10b4f39ad55b29a61d57` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-8dca8d52-expected` | `COVERED` | `evidence:runtime-observed-proof-7f05177ef676e9142f06` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-8dca8d52-negative` | `COVERED` | `evidence:runtime-observed-proof-6a1b12ff3559ac05e5e3` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0ad03c62-expected` | `COVERED` | `evidence:runtime-observed-proof-559c5a7c06e773cb4d94` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0ad03c62-negative` | `COVERED` | `evidence:runtime-observed-proof-1f3053a9816e3208430f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-88185f96-expected` | `COVERED` | `evidence:runtime-observed-proof-7a0b42b5583875be5174` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-88185f96-negative` | `COVERED` | `evidence:runtime-observed-proof-ce6cff30826053ba2542` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ab243239-expected` | `COVERED` | `evidence:runtime-observed-proof-a2ae53c13ba450ccbffc` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ab243239-negative` | `COVERED` | `evidence:runtime-observed-proof-174838e91c79f44c2f72` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-eafe80a3-expected` | `COVERED` | `evidence:runtime-observed-proof-3a8ea2868458b83cdb33` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-eafe80a3-negative` | `COVERED` | `evidence:runtime-observed-proof-adbcf030dff5eddd7f5c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7bea42b3-expected` | `COVERED` | `evidence:runtime-observed-proof-73253ed44b9e253a88cb` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7bea42b3-negative` | `COVERED` | `evidence:runtime-observed-proof-9cf63a9e56481a6fc27d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4cd77b0a-expected` | `COVERED` | `evidence:runtime-observed-proof-a8ae74acee1c786a5efe` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4cd77b0a-negative` | `COVERED` | `evidence:runtime-observed-proof-384096f2c51507882454` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6f5a5aa3-expected` | `COVERED` | `evidence:runtime-observed-proof-79bb360923f1f6bae8e1` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6f5a5aa3-negative` | `COVERED` | `evidence:runtime-observed-proof-d23582d795efb8ef7f41` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-94a115a4-expected` | `COVERED` | `evidence:runtime-observed-proof-fd59672ebd21554e8e65` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-94a115a4-negative` | `COVERED` | `evidence:runtime-observed-proof-af4d8c7d5b7811fd3798` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4087f54e-expected` | `COVERED` | `evidence:runtime-observed-proof-7b25d973d6cb40cd40cc` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4087f54e-negative` | `COVERED` | `evidence:runtime-observed-proof-23bc96c3ab7d06d1c088` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3ad67323-expected` | `COVERED` | `evidence:runtime-observed-proof-ee972279cb0a66368d36` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3ad67323-negative` | `COVERED` | `evidence:runtime-observed-proof-067c0ec0e9df62b0e469` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-95d747e1-expected` | `COVERED` | `evidence:runtime-observed-proof-b62000a72e049da75b26` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-95d747e1-negative` | `COVERED` | `evidence:runtime-observed-proof-084e8cdb032d8202a54b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-00218482-expected` | `COVERED` | `evidence:runtime-observed-proof-836f4252cd6ffc569462` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-00218482-negative` | `COVERED` | `evidence:runtime-observed-proof-c9051539fa587a64efe1` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-72c3bacf-expected` | `COVERED` | `evidence:runtime-observed-proof-7d5c54753ae4850b3f29` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-72c3bacf-negative` | `COVERED` | `evidence:runtime-observed-proof-8430cd0784f0b3f73b57` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a0707b63-expected` | `COVERED` | `evidence:runtime-observed-proof-bc19c9c606908407fabf` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a0707b63-negative` | `COVERED` | `evidence:runtime-observed-proof-6e3456ef3bebee9c76e8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a4833a0b-expected` | `COVERED` | `evidence:runtime-observed-proof-939e64da3debdfa5ce71` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a4833a0b-negative` | `COVERED` | `evidence:runtime-observed-proof-9af0b5d96ceea7fb7f18` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-8331c5ae-expected` | `COVERED` | `evidence:runtime-observed-proof-54fd0cbc7befd6355cc9` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-8331c5ae-negative` | `COVERED` | `evidence:runtime-observed-proof-a25fcccaf83e95b2f627` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-aa4f5177-expected` | `COVERED` | `evidence:runtime-observed-proof-f3a4563bd8476581bd96` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-aa4f5177-negative` | `COVERED` | `evidence:runtime-observed-proof-da1a0e3a85a416bc3d38` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d36e2a76-expected` | `COVERED` | `evidence:runtime-observed-proof-40fb52a88645b546cd07` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d36e2a76-negative` | `COVERED` | `evidence:runtime-observed-proof-345ba77bb8899e938497` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-610c7460-expected` | `COVERED` | `evidence:runtime-observed-proof-a74967512e88fe1a6351` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-610c7460-negative` | `COVERED` | `evidence:runtime-observed-proof-feecc3a494242f830d81` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9a3804d1-expected` | `COVERED` | `evidence:runtime-observed-proof-0e4edb4968c686c7822f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9a3804d1-negative` | `COVERED` | `evidence:runtime-observed-proof-619bd95b44a63a0c2e9f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-48f98d4e-expected` | `COVERED` | `evidence:runtime-observed-proof-0e5e1552a17b67a3ac28` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-48f98d4e-negative` | `COVERED` | `evidence:runtime-observed-proof-59640216e16852df6a0a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9a1bf08b-expected` | `COVERED` | `evidence:runtime-observed-proof-cf23257e2fe5f4ebb5b2` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9a1bf08b-negative` | `COVERED` | `evidence:runtime-observed-proof-681cc422b5fabf7c229c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-e710bac0-expected` | `COVERED` | `evidence:runtime-observed-proof-1aa74e5f8b8fa6082498` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-e710bac0-negative` | `COVERED` | `evidence:runtime-observed-proof-0c93ca6453919d4de5b7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-66ba9a71-expected` | `COVERED` | `evidence:runtime-observed-proof-02a3ddcfcf2ece7ca844` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-66ba9a71-negative` | `COVERED` | `evidence:runtime-observed-proof-69fd7dd0ec2166ebe1d7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-211b9347-expected` | `COVERED` | `evidence:runtime-observed-proof-f2fe947cbb177db744f1` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-211b9347-negative` | `COVERED` | `evidence:runtime-observed-proof-53036f0258587dd11d9f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3e9d296e-expected` | `COVERED` | `evidence:runtime-observed-proof-69de9108b7fe9e97c2af` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3e9d296e-negative` | `COVERED` | `evidence:runtime-observed-proof-40c834354ee37fe86a7f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4ea05a71-expected` | `COVERED` | `evidence:runtime-observed-proof-ffa2d2ba416029bb3499` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4ea05a71-negative` | `COVERED` | `evidence:runtime-observed-proof-406ad8a7f62f332b655e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0a935c21-expected` | `COVERED` | `evidence:runtime-observed-proof-376448331fefcf1702a7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0a935c21-negative` | `COVERED` | `evidence:runtime-observed-proof-a42ef4213003b1c7955d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ce319ca9-expected` | `COVERED` | `evidence:runtime-observed-proof-4b54f3c239f11ab7a165` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ce319ca9-negative` | `COVERED` | `evidence:runtime-observed-proof-9b869d9f40c835ebf41e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-010135e0-expected` | `COVERED` | `evidence:runtime-observed-proof-d0c8135dfb43abf138ad` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-010135e0-negative` | `COVERED` | `evidence:runtime-observed-proof-65b87c3f9dd49e966012` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7e9a2282-expected` | `COVERED` | `evidence:runtime-observed-proof-859323409eaced5882ac` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7e9a2282-negative` | `COVERED` | `evidence:runtime-observed-proof-17193589e0828b8971e6` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-1a4fabb1-expected` | `COVERED` | `evidence:runtime-observed-proof-d7b7f34c22aa76910d30` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-1a4fabb1-negative` | `COVERED` | `evidence:runtime-observed-proof-8fe163944414e7d05067` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-68b60ab3-expected` | `COVERED` | `evidence:runtime-observed-proof-7d69946119a78cd09402` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-68b60ab3-negative` | `COVERED` | `evidence:runtime-observed-proof-0d03ab3ac80c13fd562b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6a0a12c4-expected` | `COVERED` | `evidence:runtime-observed-proof-8382fdd3517912235b3c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6a0a12c4-negative` | `COVERED` | `evidence:runtime-observed-proof-155bd3913ed1f936b38d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3b1e8f43-expected` | `COVERED` | `evidence:runtime-observed-proof-caede192e5e8d5edc5c8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3b1e8f43-negative` | `COVERED` | `evidence:runtime-observed-proof-4524a6f3ed1f624517ac` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0adf81f2-expected` | `COVERED` | `evidence:runtime-observed-proof-fea830ebdeff2248ebe1` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0adf81f2-negative` | `COVERED` | `evidence:runtime-observed-proof-df8362538c6c6a9effc6` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-41c23483-expected` | `COVERED` | `evidence:runtime-observed-proof-dc3a0e8af397740882e9` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-41c23483-negative` | `COVERED` | `evidence:runtime-observed-proof-98784547f2bf99c4a025` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-06b86b13-expected` | `COVERED` | `evidence:runtime-observed-proof-f47f98e11daeed0e37ea` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-06b86b13-negative` | `COVERED` | `evidence:runtime-observed-proof-2e0b202066a75f6f91a3` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d6fb92e1-expected` | `COVERED` | `evidence:runtime-observed-proof-27e527ce5d984c0a75a5` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d6fb92e1-negative` | `COVERED` | `evidence:runtime-observed-proof-18798e14155abf98fbe4` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `COVERED` | `evidence:runtime-observed-proof-a85694134a008b0ac30d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `COVERED` | `evidence:runtime-observed-proof-2e2624053ab54b3f326d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:data-model-data-model-check-data-model-historical-records-migrat` | `COVERED` | `evidence:runtime-observed-proof-c9efa8660cee159c7f2f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:permission-risk-permission-boundary-test-role-tenant-visibility-` | `COVERED` | `evidence:runtime-observed-proof-68b78ef5f5f0e7ed9086` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `COVERED` | `evidence:runtime-observed-proof-d5a92fd2b8b0e0600392` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:background-work-integration-contract-check-scheduled-queued-retr` | `COVERED` | `evidence:runtime-observed-proof-f61628766f85822bc413` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:external-integration-integration-contract-check-external-integra` | `COVERED` | `evidence:runtime-observed-proof-65954073c9d3b199de41` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `COVERED` | `evidence:runtime-observed-proof-c245657c0c7c5ebb6cac`, `evidence:runtime-observed-proof-b43fce3bbbfb6a03e28a` | A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation. |
| `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `COVERED` | `evidence:runtime-observed-proof-e0a04c5b32bc62f0fa05` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `COVERED` | `evidence:runtime-observed-proof-7562517dce9c24a39330` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `COVERED` | `evidence:runtime-observed-proof-df2569ac7d558efb63e1` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:negative-path-required` | `API_CONTRACT` | `NOT_APPLICABLE_WITH_REASON` |  | No Verification Plan obligation uses this control surface. |
| `control:generated-test-review-required` | `TEST_COVERAGE` | `SATISFIED` | `runtime:self-current-obligation-evidence`, `evidence:runtime-observed-proof-df2569ac7d558efb63e1` | Evidence is mapped to related Verification Plan obligations. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:runtime-observed-proof-df2569ac7d558efb63e1` | Evidence is mapped to related Verification Plan obligations. |

## Known Gaps

| Gap ID | Severity | Reason | Required Follow-up |
|---|---|---|---|
| `none` | `NONE` | No known gaps recorded. | Not required. |

## Manual Verification

| ID | Owner | Decision Ref | Evidence Ref | Status | Reason |
|---|---|---|---|---|---|
| `none` | None | `not required` | `not required` | `NOT_REQUIRED` | No manual verification required by the Verification Plan. |

## Existing Project Mapping

- Status: `NOT_APPLICABLE`
- Ref: `not provided`
- Reason: No existing-project mapping was provided for this Test Evidence Report.

## Boundaries

- This report writes target files: No
- This report executes tests: No
- This report fabricates evidence: No
- This report authorizes implementation: No
- This report approves release or production: No
- This report proves product correctness: No
- This report proves real-environment behavior: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.110.0",
  "artifact_type": "test_evidence",
  "task_ref": "task:17bb774d904e7e5418668f77f40440ad80a50edf32bc43c9a71860a2a8503b98",
  "intent": "Complete IntentOS 1.113 cross-domain trust closure by enforcing required task consumers, evidence authority, security boundaries, atomic apply recovery, existing-project activation, baseline integrity, and bounded source distribution evidence while prohibiting external effects.",
  "intent_digest": "sha256:ffe295876d2af0c000da0c80666b673afdbbd82ecd18dd77919641947306594d",
  "test_evidence_ref": "artifact:test-evidence-reports/113-cross-domain-trust-closure.md",
  "test_evidence_digest": "sha256:c948841fe728bc4bb30ec96269f0f33abed6abff6929ecb9ff71cfd327df5297",
  "verification_plan_ref": "artifact:verification-plans/113-cross-domain-trust-closure.md",
  "verification_plan_digest": "sha256:92f1c62c8ed6b3853df2ec2e594ca1c7d4a40d93668dc793c7fa98666994bbdc",
  "verification_plan_state": "VERIFICATION_PLAN_READY",
  "source_systems": [
    {
      "name": "verification_plan",
      "status": "RECORDED",
      "ref": "artifact:verification-plans/113-cross-domain-trust-closure.md",
      "source_outcome": "VERIFICATION_PLAN_READY",
      "digest": "sha256:92f1c62c8ed6b3853df2ec2e594ca1c7d4a40d93668dc793c7fa98666994bbdc"
    },
    {
      "name": "business_rule_closure",
      "status": "RECORDED",
      "ref": "artifact:business-rule-closures/113-cross-domain-trust-closure.md",
      "source_outcome": "READY_FOR_IMPACT_COVERAGE",
      "digest": "sha256:25b859c4b4ccf0095286e33bea88cb336cb3d743f96a008d4524993403791e6b"
    },
    {
      "name": "change_impact_coverage",
      "status": "RECORDED",
      "ref": "artifact:change-impact-coverage-reports/preflight-113-cross-domain-trust-closure.md",
      "source_outcome": "CHANGE_IMPACT_RECORDED",
      "digest": "sha256:85a4a3739b6fbbc2852ba3f0ae7c0aa76acf199998d66b479d445456ef2b68ac"
    },
    {
      "name": "business_universe_coverage",
      "status": "RECORDED",
      "ref": "artifact:business-universe-coverage-reports/113-cross-domain-trust-closure.md",
      "source_outcome": "COVERAGE_READY",
      "digest": "sha256:3fd5627529d7fe3a6905cf6bcf4d164e20f363983bdf8e1b00b28e7402b5197a"
    },
    {
      "name": "control_effectiveness",
      "status": "RECORDED",
      "ref": "artifact:control-effectiveness-reports/113-cross-domain-trust-closure.md",
      "source_outcome": "CONTROL_PROVEN_EFFECTIVE",
      "digest": "sha256:f746500af84ea19fba21ed879f8635020a5e65f101e8a687ca4e2810c326cad7"
    },
    {
      "name": "verification_run_manifest",
      "status": "RECORDED",
      "ref": "artifact:verification-run-manifests/113-cross-domain-trust-closure.md",
      "source_outcome": "RUNTIME_TRUST_COMPLETE",
      "digest": "sha256:85bef60cf3445edc21524788ccd1342ca0a9ec3a6b88f182efc852adabe213c0"
    }
  ],
  "runtime_trust_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "run_manifest_ref": "artifact:verification-run-manifests/113-cross-domain-trust-closure.md",
    "run_manifest_digest": "sha256:85bef60cf3445edc21524788ccd1342ca0a9ec3a6b88f182efc852adabe213c0",
    "run_id": "vrun-113-cross-domain-trust-r45",
    "task_ref": "task:17bb774d904e7e5418668f77f40440ad80a50edf32bc43c9a71860a2a8503b98",
    "intent_digest": "sha256:ffe295876d2af0c000da0c80666b673afdbbd82ecd18dd77919641947306594d",
    "runtime_trust_level": "ISOLATED_RUNTIME",
    "runtime_plan_ref": "artifact:verification-runtime-plans/113-cross-domain-trust-closure.md",
    "runtime_plan_digest": "sha256:003a712b6718685438ea9588b6adaf85920180a6d332851861be9cb24b0c22a9",
    "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/113-cross-domain-trust-closure.md",
    "lifecycle_plan_digest": "sha256:3e353ef582539fe44ae1efd7809d9ecaebcab3ed676037ce065c0d89d5155adb",
    "verification_plan_ref": "artifact:verification-plans/113-cross-domain-trust-closure.md",
    "verification_plan_digest": "sha256:92f1c62c8ed6b3853df2ec2e594ca1c7d4a40d93668dc793c7fa98666994bbdc",
    "current_project_match": "Yes",
    "current_task_match": "Yes",
    "current_intent_match": "Yes",
    "current_verification_plan_match": "Yes",
    "checker": "scripts/check-verification-run-manifest.mjs --require-complete",
    "reason": "The exact current run passed the authoritative checker and consumer identity checks."
  },
  "control_effectiveness_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "report_ref": "artifact:control-effectiveness-reports/113-cross-domain-trust-closure.md",
    "report_digest": "sha256:f746500af84ea19fba21ed879f8635020a5e65f101e8a687ca4e2810c326cad7",
    "required_claim_ids": [
      "claim:package-script-verify-candidate",
      "claim:package-script-verify-runtime-trust-core",
      "claim:package-script-verify-runtime-trust",
      "claim:package-script-verify-consumer-chain-candidate",
      "claim:package-script-verify-baseline",
      "claim:package-script-verify-example-observed-evidence",
      "claim:package-script-verify-release-topology-consumers",
      "claim:package-script-verify-planning-closure"
    ],
    "assessment_outcome": "CONTROL_PROVEN_EFFECTIVE",
    "current_project_match": "Yes",
    "current_task_match": "Yes",
    "current_intent_match": "Yes",
    "checker": "scripts/check-control-effectiveness.mjs --require-effective",
    "reason": "The exact current report proves every relied-on bounded control claim."
  },
  "authority_binding": {
    "binding_version": "1.91.0",
    "project": {
      "kind": "GIT",
      "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
      "revision": "sha256:9ee346c880b91a2f1f8595c7bcad7aedb1e63722328a289ed61c3788fdd88f0a"
    },
    "task": {
      "task_ref": "task:17bb774d904e7e5418668f77f40440ad80a50edf32bc43c9a71860a2a8503b98",
      "intent_digest": "sha256:ffe295876d2af0c000da0c80666b673afdbbd82ecd18dd77919641947306594d"
    },
    "sources": [
      {
        "ref": "artifact:verification-plans/113-cross-domain-trust-closure.md",
        "relative_path": "verification-plans/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:d11076bd1482b227c3efc710181f37f672b4c17786153430815938367691a3a8"
      },
      {
        "ref": "artifact:business-rule-closures/113-cross-domain-trust-closure.md",
        "relative_path": "business-rule-closures/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:c254ed804d859983e11d3eeefd53f7bc319309fbca6852828fc8e3aab8308b8f"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/preflight-113-cross-domain-trust-closure.md",
        "relative_path": "change-impact-coverage-reports/preflight-113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:71a1387d0d31058727587df3014c7fef8a3da93d1872536b231181f9e61a0159"
      },
      {
        "ref": "artifact:business-universe-coverage-reports/113-cross-domain-trust-closure.md",
        "relative_path": "business-universe-coverage-reports/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:202ec5ac2dfa3d3c7c7fa618e7d6dd4c3f65e2b5e8bbeeff2adb8a21a6c07a22"
      },
      {
        "ref": "artifact:control-effectiveness-reports/113-cross-domain-trust-closure.md",
        "relative_path": "control-effectiveness-reports/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:c99aad15f7026e3f117a0ae54ad52433da2be299c6b66ef8760cc06941cb91c9"
      },
      {
        "ref": "artifact:verification-run-manifests/113-cross-domain-trust-closure.md",
        "relative_path": "verification-run-manifests/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:0bc0ba6eaab3682aeea46af6823e7152910f80763e72ad0b3515b45bb6450559"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:2720c59e5878303132946002df6cd08e812b58ff1cdf8453aab90f2ffc9522b5"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:48c84829e1b1558d08bc9bb6179088f09b46f00fe63383e752f448f194bc64ee"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:a197838c685be11bb481cbcdf9fb6b2315db8b5fd680321241b251bd269a6c24"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:257e20cf25778e772d417576177e48f3740bd9ad7e44195b8d726eb64ed38c76"
      }
    ]
  },
  "test_evidence_state": "TEST_EVIDENCE_COMPLETE",
  "evidence_items": [
    {
      "id": "runtime:self-runtime-negative",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-negative.log",
      "command": "node scripts/verification-runtime-self-service.mjs negative",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:29:15.059Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:2720c59e5878303132946002df6cd08e812b58ff1cdf8453aab90f2ffc9522b5",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-runtime-positive",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-runtime-positive.log",
      "command": "node scripts/verification-runtime-self-service.mjs positive",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:29:15.091Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:48c84829e1b1558d08bc9bb6179088f09b46f00fe63383e752f448f194bc64ee",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-candidate-verification",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-candidate-verification.log",
      "command": "npm run verify:pre-runtime",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:37:17.223Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:a197838c685be11bb481cbcdf9fb6b2315db8b5fd680321241b251bd269a6c24",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-obligation-evidence",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:data-model-data-model-check-data-model-historical-records-migrat",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:external-integration-integration-contract-check-external-integra",
        "verify:permission-risk-permission-boundary-test-role-tenant-visibility-",
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:universe-00218482-expected",
        "verify:universe-00218482-negative",
        "verify:universe-010135e0-expected",
        "verify:universe-010135e0-negative",
        "verify:universe-01b5deae-expected",
        "verify:universe-01b5deae-negative",
        "verify:universe-06b86b13-expected",
        "verify:universe-06b86b13-negative",
        "verify:universe-0a935c21-expected",
        "verify:universe-0a935c21-negative",
        "verify:universe-0ad03c62-expected",
        "verify:universe-0ad03c62-negative",
        "verify:universe-0adf81f2-expected",
        "verify:universe-0adf81f2-negative",
        "verify:universe-133bfd71-expected",
        "verify:universe-133bfd71-negative",
        "verify:universe-1a4fabb1-expected",
        "verify:universe-1a4fabb1-negative",
        "verify:universe-211b9347-expected",
        "verify:universe-211b9347-negative",
        "verify:universe-230f46e1-expected",
        "verify:universe-230f46e1-negative",
        "verify:universe-370c5a1e-expected",
        "verify:universe-370c5a1e-negative",
        "verify:universe-3ad67323-expected",
        "verify:universe-3ad67323-negative",
        "verify:universe-3b1e8f43-expected",
        "verify:universe-3b1e8f43-negative",
        "verify:universe-3e9d296e-expected",
        "verify:universe-3e9d296e-negative",
        "verify:universe-4087f54e-expected",
        "verify:universe-4087f54e-negative",
        "verify:universe-41c23483-expected",
        "verify:universe-41c23483-negative",
        "verify:universe-48f98d4e-expected",
        "verify:universe-48f98d4e-negative",
        "verify:universe-4cd77b0a-expected",
        "verify:universe-4cd77b0a-negative",
        "verify:universe-4ea05a71-expected",
        "verify:universe-4ea05a71-negative",
        "verify:universe-610c7460-expected",
        "verify:universe-610c7460-negative",
        "verify:universe-66ba9a71-expected",
        "verify:universe-66ba9a71-negative",
        "verify:universe-68b60ab3-expected",
        "verify:universe-68b60ab3-negative",
        "verify:universe-6a0a12c4-expected",
        "verify:universe-6a0a12c4-negative",
        "verify:universe-6a3c13eb-expected",
        "verify:universe-6a3c13eb-negative",
        "verify:universe-6f5a5aa3-expected",
        "verify:universe-6f5a5aa3-negative",
        "verify:universe-72c3bacf-expected",
        "verify:universe-72c3bacf-negative",
        "verify:universe-7bea42b3-expected",
        "verify:universe-7bea42b3-negative",
        "verify:universe-7e9a2282-expected",
        "verify:universe-7e9a2282-negative",
        "verify:universe-8331c5ae-expected",
        "verify:universe-8331c5ae-negative",
        "verify:universe-868d4b91-expected",
        "verify:universe-868d4b91-negative",
        "verify:universe-88185f96-expected",
        "verify:universe-88185f96-negative",
        "verify:universe-8dca8d52-expected",
        "verify:universe-8dca8d52-negative",
        "verify:universe-909edc85-expected",
        "verify:universe-909edc85-negative",
        "verify:universe-94a115a4-expected",
        "verify:universe-94a115a4-negative",
        "verify:universe-95d747e1-expected",
        "verify:universe-95d747e1-negative",
        "verify:universe-9a1bf08b-expected",
        "verify:universe-9a1bf08b-negative",
        "verify:universe-9a3804d1-expected",
        "verify:universe-9a3804d1-negative",
        "verify:universe-9f9fa3e5-expected",
        "verify:universe-9f9fa3e5-negative",
        "verify:universe-a0707b63-expected",
        "verify:universe-a0707b63-negative",
        "verify:universe-a238de93-expected",
        "verify:universe-a238de93-negative",
        "verify:universe-a4833a0b-expected",
        "verify:universe-a4833a0b-negative",
        "verify:universe-aa4f5177-expected",
        "verify:universe-aa4f5177-negative",
        "verify:universe-ab243239-expected",
        "verify:universe-ab243239-negative",
        "verify:universe-bb4f1e0b-expected",
        "verify:universe-bb4f1e0b-negative",
        "verify:universe-ca9f9831-expected",
        "verify:universe-ca9f9831-negative",
        "verify:universe-ce319ca9-expected",
        "verify:universe-ce319ca9-negative",
        "verify:universe-d36e2a76-expected",
        "verify:universe-d36e2a76-negative",
        "verify:universe-d5cda5ec-expected",
        "verify:universe-d5cda5ec-negative",
        "verify:universe-d6fb92e1-expected",
        "verify:universe-d6fb92e1-negative",
        "verify:universe-dfbddc4b-expected",
        "verify:universe-dfbddc4b-negative",
        "verify:universe-e710bac0-expected",
        "verify:universe-e710bac0-negative",
        "verify:universe-eafe80a3-expected",
        "verify:universe-eafe80a3-negative",
        "verify:universe-f7ab67ee-expected",
        "verify:universe-f7ab67ee-negative",
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-runtime-behavior",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.353Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:257e20cf25778e772d417576177e48f3740bd9ad7e44195b8d726eb64ed38c76",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "evidence:runtime-observed-proof-483e9b2cb75b726f0695",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-01b5deae-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/task-obligation-hardcut.test.mjs :: 1.113 Work Queue takeover ignores fixtures and accepts one governed current task in a dirty worktree; source line 4."
    },
    {
      "id": "evidence:runtime-observed-proof-8f5826af135bc96e4317",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-01b5deae-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/task-obligation-hardcut.test.mjs :: 1.113 Work Queue takeover ignores fixtures and accepts one governed current task in a dirty worktree; source line 5."
    },
    {
      "id": "evidence:runtime-observed-proof-40eeec27cf402d543de0",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-370c5a1e-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 6."
    },
    {
      "id": "evidence:runtime-observed-proof-b8f6d5e2606cc8d3e76e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-370c5a1e-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 7."
    },
    {
      "id": "evidence:runtime-observed-proof-8074726f1340db93a631",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9f9fa3e5-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 8."
    },
    {
      "id": "evidence:runtime-observed-proof-c09d33262cd36dbe50b3",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9f9fa3e5-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 9."
    },
    {
      "id": "evidence:runtime-observed-proof-6c3e2ab5061a2550c76d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d5cda5ec-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 10."
    },
    {
      "id": "evidence:runtime-observed-proof-3be29929cb5adb63b4b8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d5cda5ec-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 11."
    },
    {
      "id": "evidence:runtime-observed-proof-eb8017c68e13f2d6ab80",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-909edc85-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 12."
    },
    {
      "id": "evidence:runtime-observed-proof-dbb2e99e646226d7a5d8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-909edc85-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 13."
    },
    {
      "id": "evidence:runtime-observed-proof-013ec0534cfd2e60a36d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-868d4b91-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 14."
    },
    {
      "id": "evidence:runtime-observed-proof-86bef721dd8885f9c4a4",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-868d4b91-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 15."
    },
    {
      "id": "evidence:runtime-observed-proof-9532a686b8f9f5cd2869",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-133bfd71-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 16."
    },
    {
      "id": "evidence:runtime-observed-proof-c7e12b63bcc7bfe196d0",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-133bfd71-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 17."
    },
    {
      "id": "evidence:runtime-observed-proof-4699f1b9fe49cbd678c4",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a238de93-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 18."
    },
    {
      "id": "evidence:runtime-observed-proof-af970f13ef0b0c57fc74",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a238de93-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 19."
    },
    {
      "id": "evidence:runtime-observed-proof-50c181611b2c4bf2c35b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-230f46e1-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 20."
    },
    {
      "id": "evidence:runtime-observed-proof-129bef2a28c88ca60e2c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-230f46e1-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 21."
    },
    {
      "id": "evidence:runtime-observed-proof-c9efa8660cee159c7f2f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:data-model-data-model-check-data-model-historical-records-migrat"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/typed-consumer-contract.test.mjs :: 1.113 historical completion evidence is readable but cannot satisfy current readiness; source line 22."
    },
    {
      "id": "evidence:runtime-observed-proof-df2569ac7d558efb63e1",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/typed-consumer-contract.test.mjs :: 1.113 evidence authority binds an exact item inside a file-backed artifact; source line 23."
    },
    {
      "id": "evidence:runtime-observed-proof-a00d0134ab2f9b74ec8f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6a3c13eb-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound local authority accepts an exact reversible existing-project adoption graph; source line 26."
    },
    {
      "id": "evidence:runtime-observed-proof-39813869c1a1e4ca8fec",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6a3c13eb-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound local authority accepts an exact reversible existing-project adoption graph; source line 27."
    },
    {
      "id": "evidence:runtime-observed-proof-3833e019a6e32f75f7cc",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-bb4f1e0b-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a target lock prevents two controlled applies from starting concurrently; source line 28."
    },
    {
      "id": "evidence:runtime-observed-proof-895ab35bfe67b98c2cb9",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-bb4f1e0b-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a target lock prevents two controlled applies from starting concurrently; source line 29."
    },
    {
      "id": "evidence:runtime-observed-proof-0a1d21f23ea7c5b5a473",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f7ab67ee-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 30."
    },
    {
      "id": "evidence:runtime-observed-proof-64165c4c9b0479f31333",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f7ab67ee-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 31."
    },
    {
      "id": "evidence:runtime-observed-proof-4cf861ea705d96351e7b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-dfbddc4b-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 32."
    },
    {
      "id": "evidence:runtime-observed-proof-2afc5aa5f51f77179b61",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-dfbddc4b-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 33."
    },
    {
      "id": "evidence:runtime-observed-proof-77195bc86d0883dd4859",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ca9f9831-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: APPLY_VERIFIED closeout validation failure immediately rolls back and verifies preimages; source line 34."
    },
    {
      "id": "evidence:runtime-observed-proof-10b4f39ad55b29a61d57",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ca9f9831-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: APPLY_VERIFIED closeout validation failure immediately rolls back and verifies preimages; source line 35."
    },
    {
      "id": "evidence:runtime-observed-proof-7f05177ef676e9142f06",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-8dca8d52-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 36."
    },
    {
      "id": "evidence:runtime-observed-proof-6a1b12ff3559ac05e5e3",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-8dca8d52-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 37."
    },
    {
      "id": "evidence:runtime-observed-proof-559c5a7c06e773cb4d94",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0ad03c62-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 38."
    },
    {
      "id": "evidence:runtime-observed-proof-1f3053a9816e3208430f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0ad03c62-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 39."
    },
    {
      "id": "evidence:runtime-observed-proof-7a0b42b5583875be5174",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-88185f96-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 40."
    },
    {
      "id": "evidence:runtime-observed-proof-ce6cff30826053ba2542",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-88185f96-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 41."
    },
    {
      "id": "evidence:runtime-observed-proof-a2ae53c13ba450ccbffc",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ab243239-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 42."
    },
    {
      "id": "evidence:runtime-observed-proof-174838e91c79f44c2f72",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ab243239-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 43."
    },
    {
      "id": "evidence:runtime-observed-proof-e0a04c5b32bc62f0fa05",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 44."
    },
    {
      "id": "evidence:runtime-observed-proof-3a8ea2868458b83cdb33",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-eafe80a3-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 47."
    },
    {
      "id": "evidence:runtime-observed-proof-adbcf030dff5eddd7f5c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-eafe80a3-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 48."
    },
    {
      "id": "evidence:runtime-observed-proof-73253ed44b9e253a88cb",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7bea42b3-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 adoption autopilot consumes one strict same-run chain for a light existing project; source line 49."
    },
    {
      "id": "evidence:runtime-observed-proof-9cf63a9e56481a6fc27d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7bea42b3-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 adoption autopilot consumes one strict same-run chain for a light existing project; source line 50."
    },
    {
      "id": "evidence:runtime-observed-proof-a8ae74acee1c786a5efe",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4cd77b0a-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 51."
    },
    {
      "id": "evidence:runtime-observed-proof-384096f2c51507882454",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4cd77b0a-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 52."
    },
    {
      "id": "evidence:runtime-observed-proof-79bb360923f1f6bae8e1",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6f5a5aa3-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 53."
    },
    {
      "id": "evidence:runtime-observed-proof-d23582d795efb8ef7f41",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6f5a5aa3-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 54."
    },
    {
      "id": "evidence:runtime-observed-proof-fd59672ebd21554e8e65",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-94a115a4-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 55."
    },
    {
      "id": "evidence:runtime-observed-proof-af4d8c7d5b7811fd3798",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-94a115a4-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 56."
    },
    {
      "id": "evidence:runtime-observed-proof-7b25d973d6cb40cd40cc",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4087f54e-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 57."
    },
    {
      "id": "evidence:runtime-observed-proof-23bc96c3ab7d06d1c088",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4087f54e-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 58."
    },
    {
      "id": "evidence:runtime-observed-proof-ee972279cb0a66368d36",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3ad67323-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: Work Queue and adoption assurance reject directory and .gitkeep presence as behavioral proof; source line 59."
    },
    {
      "id": "evidence:runtime-observed-proof-067c0ec0e9df62b0e469",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3ad67323-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: Work Queue and adoption assurance reject directory and .gitkeep presence as behavioral proof; source line 60."
    },
    {
      "id": "evidence:runtime-observed-proof-b62000a72e049da75b26",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-95d747e1-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 61."
    },
    {
      "id": "evidence:runtime-observed-proof-084e8cdb032d8202a54b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-95d747e1-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 62."
    },
    {
      "id": "evidence:runtime-observed-proof-836f4252cd6ffc569462",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-00218482-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 current-work discovery covers root TODO, sessions, plans, and conflicting current items; source line 63."
    },
    {
      "id": "evidence:runtime-observed-proof-c9051539fa587a64efe1",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-00218482-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 current-work discovery covers root TODO, sessions, plans, and conflicting current items; source line 64."
    },
    {
      "id": "evidence:runtime-observed-proof-a85694134a008b0ac30d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: generated project cold-starts from its own cwd and exercises the strict operating route; source line 65."
    },
    {
      "id": "evidence:runtime-observed-proof-2e2624053ab54b3f326d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: generated project cold-starts from its own cwd and exercises the strict operating route; source line 66."
    },
    {
      "id": "evidence:runtime-observed-proof-68b78ef5f5f0e7ed9086",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:permission-risk-permission-boundary-test-role-tenant-visibility-"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound authority rejects business code and a fabricated legacy-agent bridge; source line 67."
    },
    {
      "id": "evidence:runtime-observed-proof-7d5c54753ae4850b3f29",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-72c3bacf-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 70."
    },
    {
      "id": "evidence:runtime-observed-proof-8430cd0784f0b3f73b57",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-72c3bacf-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 71."
    },
    {
      "id": "evidence:runtime-observed-proof-bc19c9c606908407fabf",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a0707b63-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 72."
    },
    {
      "id": "evidence:runtime-observed-proof-6e3456ef3bebee9c76e8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a0707b63-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 73."
    },
    {
      "id": "evidence:runtime-observed-proof-939e64da3debdfa5ce71",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a4833a0b-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: baseline planning augments explicit packs to complete environment and profile coverage; source line 74."
    },
    {
      "id": "evidence:runtime-observed-proof-9af0b5d96ceea7fb7f18",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a4833a0b-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: baseline planning augments explicit packs to complete environment and profile coverage; source line 75."
    },
    {
      "id": "evidence:runtime-observed-proof-54fd0cbc7befd6355cc9",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-8331c5ae-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: every supported starter reaches verified project-entry activation; source line 76."
    },
    {
      "id": "evidence:runtime-observed-proof-a25fcccaf83e95b2f627",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-8331c5ae-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: every supported starter reaches verified project-entry activation; source line 77."
    },
    {
      "id": "evidence:runtime-observed-proof-f3a4563bd8476581bd96",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-aa4f5177-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 78."
    },
    {
      "id": "evidence:runtime-observed-proof-da1a0e3a85a416bc3d38",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-aa4f5177-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 79."
    },
    {
      "id": "evidence:runtime-observed-proof-40fb52a88645b546cd07",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d36e2a76-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 80."
    },
    {
      "id": "evidence:runtime-observed-proof-345ba77bb8899e938497",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d36e2a76-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 81."
    },
    {
      "id": "evidence:runtime-observed-proof-a74967512e88fe1a6351",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-610c7460-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: project evidence failures and truncation are visible and block baseline selection; source line 82."
    },
    {
      "id": "evidence:runtime-observed-proof-feecc3a494242f830d81",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-610c7460-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: project evidence failures and truncation are visible and block baseline selection; source line 83."
    },
    {
      "id": "evidence:runtime-observed-proof-0e4edb4968c686c7822f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9a3804d1-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 84."
    },
    {
      "id": "evidence:runtime-observed-proof-619bd95b44a63a0c2e9f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9a3804d1-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 85."
    },
    {
      "id": "evidence:runtime-observed-proof-0e5e1552a17b67a3ac28",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-48f98d4e-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: installed and source-side baseline checks resolve the same target authority; source line 86."
    },
    {
      "id": "evidence:runtime-observed-proof-59640216e16852df6a0a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-48f98d4e-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: installed and source-side baseline checks resolve the same target authority; source line 87."
    },
    {
      "id": "evidence:runtime-observed-proof-cf23257e2fe5f4ebb5b2",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9a1bf08b-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 90."
    },
    {
      "id": "evidence:runtime-observed-proof-681cc422b5fabf7c229c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9a1bf08b-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 91."
    },
    {
      "id": "evidence:runtime-observed-proof-1aa74e5f8b8fa6082498",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-e710bac0-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 92."
    },
    {
      "id": "evidence:runtime-observed-proof-0c93ca6453919d4de5b7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-e710bac0-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 93."
    },
    {
      "id": "evidence:runtime-observed-proof-02a3ddcfcf2ece7ca844",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-66ba9a71-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 94."
    },
    {
      "id": "evidence:runtime-observed-proof-69fd7dd0ec2166ebe1d7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-66ba9a71-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 95."
    },
    {
      "id": "evidence:runtime-observed-proof-f2fe947cbb177db744f1",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-211b9347-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 96."
    },
    {
      "id": "evidence:runtime-observed-proof-53036f0258587dd11d9f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-211b9347-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 97."
    },
    {
      "id": "evidence:runtime-observed-proof-69de9108b7fe9e97c2af",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3e9d296e-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 98."
    },
    {
      "id": "evidence:runtime-observed-proof-40c834354ee37fe86a7f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3e9d296e-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 99."
    },
    {
      "id": "evidence:runtime-observed-proof-ffa2d2ba416029bb3499",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4ea05a71-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 100."
    },
    {
      "id": "evidence:runtime-observed-proof-406ad8a7f62f332b655e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4ea05a71-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 101."
    },
    {
      "id": "evidence:runtime-observed-proof-376448331fefcf1702a7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0a935c21-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 102."
    },
    {
      "id": "evidence:runtime-observed-proof-a42ef4213003b1c7955d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0a935c21-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 103."
    },
    {
      "id": "evidence:runtime-observed-proof-4b54f3c239f11ab7a165",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ce319ca9-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 104."
    },
    {
      "id": "evidence:runtime-observed-proof-9b869d9f40c835ebf41e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ce319ca9-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 105."
    },
    {
      "id": "evidence:runtime-observed-proof-d0c8135dfb43abf138ad",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-010135e0-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 106."
    },
    {
      "id": "evidence:runtime-observed-proof-65b87c3f9dd49e966012",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-010135e0-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 107."
    },
    {
      "id": "evidence:runtime-observed-proof-65954073c9d3b199de41",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:external-integration-integration-contract-check-external-integra"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 108."
    },
    {
      "id": "evidence:runtime-observed-proof-d5a92fd2b8b0e0600392",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 109."
    },
    {
      "id": "evidence:runtime-observed-proof-f61628766f85822bc413",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: workflow package scripts recursively expose provider deploys and explicit source_only stays blocked; source line 110."
    },
    {
      "id": "evidence:runtime-observed-proof-859323409eaced5882ac",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7e9a2282-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 113."
    },
    {
      "id": "evidence:runtime-observed-proof-17193589e0828b8971e6",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7e9a2282-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 114."
    },
    {
      "id": "evidence:runtime-observed-proof-d7b7f34c22aa76910d30",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-1a4fabb1-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 115."
    },
    {
      "id": "evidence:runtime-observed-proof-8fe163944414e7d05067",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-1a4fabb1-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 116."
    },
    {
      "id": "evidence:runtime-observed-proof-7d69946119a78cd09402",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-68b60ab3-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 117."
    },
    {
      "id": "evidence:runtime-observed-proof-0d03ab3ac80c13fd562b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-68b60ab3-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 118."
    },
    {
      "id": "evidence:runtime-observed-proof-8382fdd3517912235b3c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6a0a12c4-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 119."
    },
    {
      "id": "evidence:runtime-observed-proof-155bd3913ed1f936b38d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6a0a12c4-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 120."
    },
    {
      "id": "evidence:runtime-observed-proof-caede192e5e8d5edc5c8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3b1e8f43-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 121."
    },
    {
      "id": "evidence:runtime-observed-proof-4524a6f3ed1f624517ac",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3b1e8f43-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 122."
    },
    {
      "id": "evidence:runtime-observed-proof-fea830ebdeff2248ebe1",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0adf81f2-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 123."
    },
    {
      "id": "evidence:runtime-observed-proof-df8362538c6c6a9effc6",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0adf81f2-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 124."
    },
    {
      "id": "evidence:runtime-observed-proof-dc3a0e8af397740882e9",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-41c23483-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 125."
    },
    {
      "id": "evidence:runtime-observed-proof-98784547f2bf99c4a025",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-41c23483-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 126."
    },
    {
      "id": "evidence:runtime-observed-proof-f47f98e11daeed0e37ea",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-06b86b13-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 127."
    },
    {
      "id": "evidence:runtime-observed-proof-2e0b202066a75f6f91a3",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-06b86b13-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 128."
    },
    {
      "id": "evidence:runtime-observed-proof-27e527ce5d984c0a75a5",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d6fb92e1-expected"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 129."
    },
    {
      "id": "evidence:runtime-observed-proof-18798e14155abf98fbe4",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d6fb92e1-negative"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 130."
    },
    {
      "id": "evidence:runtime-observed-proof-7562517dce9c24a39330",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.257Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders"
      ],
      "output_digest": "sha256:fd867ec850039dec48bc969a9f48c901bdb508880b0489fe4c5245f2267e2d5e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 131."
    },
    {
      "id": "evidence:runtime-observed-proof-c245657c0c7c5ebb6cac",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.353Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:257e20cf25778e772d417576177e48f3740bd9ad7e44195b8d726eb64ed38c76",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-b43fce3bbbfb6a03e28a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r45/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T01:41:32.353Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:257e20cf25778e772d417576177e48f3740bd9ad7e44195b8d726eb64ed38c76",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2."
    }
  ],
  "coverage_map": [
    {
      "obligation_id": "verify:universe-01b5deae-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-483e9b2cb75b726f0695"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-01b5deae-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8f5826af135bc96e4317"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-370c5a1e-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-40eeec27cf402d543de0"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-370c5a1e-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b8f6d5e2606cc8d3e76e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9f9fa3e5-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8074726f1340db93a631"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9f9fa3e5-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c09d33262cd36dbe50b3"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d5cda5ec-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6c3e2ab5061a2550c76d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d5cda5ec-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-3be29929cb5adb63b4b8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-909edc85-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-eb8017c68e13f2d6ab80"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-909edc85-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-dbb2e99e646226d7a5d8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-868d4b91-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-013ec0534cfd2e60a36d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-868d4b91-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-86bef721dd8885f9c4a4"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-133bfd71-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9532a686b8f9f5cd2869"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-133bfd71-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c7e12b63bcc7bfe196d0"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a238de93-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4699f1b9fe49cbd678c4"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a238de93-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-af970f13ef0b0c57fc74"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-230f46e1-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-50c181611b2c4bf2c35b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-230f46e1-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-129bef2a28c88ca60e2c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6a3c13eb-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a00d0134ab2f9b74ec8f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6a3c13eb-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-39813869c1a1e4ca8fec"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-bb4f1e0b-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-3833e019a6e32f75f7cc"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-bb4f1e0b-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-895ab35bfe67b98c2cb9"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f7ab67ee-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0a1d21f23ea7c5b5a473"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f7ab67ee-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-64165c4c9b0479f31333"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-dfbddc4b-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4cf861ea705d96351e7b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-dfbddc4b-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-2afc5aa5f51f77179b61"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ca9f9831-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-77195bc86d0883dd4859"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ca9f9831-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-10b4f39ad55b29a61d57"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-8dca8d52-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7f05177ef676e9142f06"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-8dca8d52-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6a1b12ff3559ac05e5e3"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0ad03c62-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-559c5a7c06e773cb4d94"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0ad03c62-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-1f3053a9816e3208430f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-88185f96-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7a0b42b5583875be5174"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-88185f96-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ce6cff30826053ba2542"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ab243239-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a2ae53c13ba450ccbffc"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ab243239-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-174838e91c79f44c2f72"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-eafe80a3-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-3a8ea2868458b83cdb33"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-eafe80a3-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-adbcf030dff5eddd7f5c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7bea42b3-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-73253ed44b9e253a88cb"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7bea42b3-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9cf63a9e56481a6fc27d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4cd77b0a-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a8ae74acee1c786a5efe"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4cd77b0a-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-384096f2c51507882454"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6f5a5aa3-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-79bb360923f1f6bae8e1"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6f5a5aa3-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d23582d795efb8ef7f41"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-94a115a4-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-fd59672ebd21554e8e65"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-94a115a4-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-af4d8c7d5b7811fd3798"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4087f54e-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7b25d973d6cb40cd40cc"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4087f54e-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-23bc96c3ab7d06d1c088"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3ad67323-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ee972279cb0a66368d36"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3ad67323-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-067c0ec0e9df62b0e469"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-95d747e1-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b62000a72e049da75b26"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-95d747e1-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-084e8cdb032d8202a54b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-00218482-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-836f4252cd6ffc569462"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-00218482-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c9051539fa587a64efe1"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-72c3bacf-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7d5c54753ae4850b3f29"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-72c3bacf-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8430cd0784f0b3f73b57"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a0707b63-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-bc19c9c606908407fabf"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a0707b63-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6e3456ef3bebee9c76e8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a4833a0b-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-939e64da3debdfa5ce71"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a4833a0b-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9af0b5d96ceea7fb7f18"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-8331c5ae-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-54fd0cbc7befd6355cc9"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-8331c5ae-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a25fcccaf83e95b2f627"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-aa4f5177-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f3a4563bd8476581bd96"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-aa4f5177-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-da1a0e3a85a416bc3d38"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d36e2a76-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-40fb52a88645b546cd07"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d36e2a76-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-345ba77bb8899e938497"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-610c7460-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a74967512e88fe1a6351"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-610c7460-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-feecc3a494242f830d81"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9a3804d1-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0e4edb4968c686c7822f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9a3804d1-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-619bd95b44a63a0c2e9f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-48f98d4e-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0e5e1552a17b67a3ac28"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-48f98d4e-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-59640216e16852df6a0a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9a1bf08b-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-cf23257e2fe5f4ebb5b2"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9a1bf08b-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-681cc422b5fabf7c229c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-e710bac0-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-1aa74e5f8b8fa6082498"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-e710bac0-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0c93ca6453919d4de5b7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-66ba9a71-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-02a3ddcfcf2ece7ca844"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-66ba9a71-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-69fd7dd0ec2166ebe1d7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-211b9347-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f2fe947cbb177db744f1"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-211b9347-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-53036f0258587dd11d9f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3e9d296e-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-69de9108b7fe9e97c2af"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3e9d296e-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-40c834354ee37fe86a7f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4ea05a71-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ffa2d2ba416029bb3499"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4ea05a71-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-406ad8a7f62f332b655e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0a935c21-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-376448331fefcf1702a7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0a935c21-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a42ef4213003b1c7955d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ce319ca9-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4b54f3c239f11ab7a165"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ce319ca9-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9b869d9f40c835ebf41e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-010135e0-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d0c8135dfb43abf138ad"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-010135e0-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-65b87c3f9dd49e966012"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7e9a2282-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-859323409eaced5882ac"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7e9a2282-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-17193589e0828b8971e6"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-1a4fabb1-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d7b7f34c22aa76910d30"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-1a4fabb1-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8fe163944414e7d05067"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-68b60ab3-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7d69946119a78cd09402"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-68b60ab3-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0d03ab3ac80c13fd562b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6a0a12c4-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8382fdd3517912235b3c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6a0a12c4-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-155bd3913ed1f936b38d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3b1e8f43-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-caede192e5e8d5edc5c8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3b1e8f43-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4524a6f3ed1f624517ac"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0adf81f2-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-fea830ebdeff2248ebe1"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0adf81f2-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-df8362538c6c6a9effc6"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-41c23483-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-dc3a0e8af397740882e9"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-41c23483-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-98784547f2bf99c4a025"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-06b86b13-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f47f98e11daeed0e37ea"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-06b86b13-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-2e0b202066a75f6f91a3"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d6fb92e1-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-27e527ce5d984c0a75a5"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d6fb92e1-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-18798e14155abf98fbe4"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a85694134a008b0ac30d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-2e2624053ab54b3f326d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:data-model-data-model-check-data-model-historical-records-migrat",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c9efa8660cee159c7f2f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:permission-risk-permission-boundary-test-role-tenant-visibility-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-68b78ef5f5f0e7ed9086"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d5a92fd2b8b0e0600392"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:background-work-integration-contract-check-scheduled-queued-retr",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f61628766f85822bc413"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:external-integration-integration-contract-check-external-integra",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-65954073c9d3b199de41"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c245657c0c7c5ebb6cac",
        "evidence:runtime-observed-proof-b43fce3bbbfb6a03e28a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation."
    },
    {
      "obligation_id": "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e0a04c5b32bc62f0fa05"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7562517dce9c24a39330"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-df2569ac7d558efb63e1"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    }
  ],
  "business_universe_binding": {
    "required": "Yes",
    "routing_result": "REQUIRED_WITH_EVIDENCE",
    "business_universe_ref": "artifact:business-universe-coverage-reports/113-cross-domain-trust-closure.md",
    "business_universe_digest": "sha256:3fd5627529d7fe3a6905cf6bcf4d164e20f363983bdf8e1b00b28e7402b5197a",
    "business_universe_state": "COVERAGE_READY",
    "coverage_scenario_ids": [
      "coverage-scenario:43cece0c8802346401b5deae",
      "coverage-scenario:caa9e24d2528c535370c5a1e",
      "coverage-scenario:bc414288b7476f119f9fa3e5",
      "coverage-scenario:47f468f00b595c2dd5cda5ec",
      "coverage-scenario:9d22b95ae9bd8ae8909edc85",
      "coverage-scenario:f4c1fef659b1700b868d4b91",
      "coverage-scenario:48c63a3946eec4af133bfd71",
      "coverage-scenario:1d0e7e6faf265961a238de93",
      "coverage-scenario:650b4c64a1b70e12230f46e1",
      "coverage-scenario:3272d1cc0edb15536a3c13eb",
      "coverage-scenario:6f717f8e7c64216dbb4f1e0b",
      "coverage-scenario:48079dd4871b73ccf7ab67ee",
      "coverage-scenario:ade6f1a45d265c29dfbddc4b",
      "coverage-scenario:aeb5a30daff1205dca9f9831",
      "coverage-scenario:989f4d4f1010b74f8dca8d52",
      "coverage-scenario:c835f11288b928940ad03c62",
      "coverage-scenario:208b4e9979a2effb88185f96",
      "coverage-scenario:5ca8093ed114d2caab243239",
      "coverage-scenario:29f7d80aefbb6a5feafe80a3",
      "coverage-scenario:1dbeb7a48e5d24c87bea42b3",
      "coverage-scenario:c2fb3632955495444cd77b0a",
      "coverage-scenario:6905316f96d53cf16f5a5aa3",
      "coverage-scenario:7e08056abf0da28194a115a4",
      "coverage-scenario:d2242869cef4b9434087f54e",
      "coverage-scenario:3b33292838217b6f3ad67323",
      "coverage-scenario:dddd76cf5cba725595d747e1",
      "coverage-scenario:62ea36bafb14320100218482",
      "coverage-scenario:5808f2fdec78752d72c3bacf",
      "coverage-scenario:f8b5b1567a6a232da0707b63",
      "coverage-scenario:ec7f91d480466a9da4833a0b",
      "coverage-scenario:4f13fa15a81c906d8331c5ae",
      "coverage-scenario:c09cab4c94ed1443aa4f5177",
      "coverage-scenario:ef0f28c65a09b433d36e2a76",
      "coverage-scenario:8435057357f8c67e610c7460",
      "coverage-scenario:e7db0204a08697529a3804d1",
      "coverage-scenario:627884e4631b728248f98d4e",
      "coverage-scenario:082ecd834caae2279a1bf08b",
      "coverage-scenario:ff3a5f1df630306ee710bac0",
      "coverage-scenario:a06aef8c3cb6dd8966ba9a71",
      "coverage-scenario:9baeb48aec07c853211b9347",
      "coverage-scenario:e0061077530f923c3e9d296e",
      "coverage-scenario:a5f2b10fd0a66cbe4ea05a71",
      "coverage-scenario:891d12ce1ee1d2980a935c21",
      "coverage-scenario:ba3f489385b617c1ce319ca9",
      "coverage-scenario:ba39a1bceb6834df010135e0",
      "coverage-scenario:68d06d9ea1a65c887e9a2282",
      "coverage-scenario:0c36f7a0be696aec1a4fabb1",
      "coverage-scenario:65bb609c4f41160568b60ab3",
      "coverage-scenario:fa831c674e070c926a0a12c4",
      "coverage-scenario:a4314123edddb1c83b1e8f43",
      "coverage-scenario:0251c7a2449f87f10adf81f2",
      "coverage-scenario:529fb9db9c61162241c23483",
      "coverage-scenario:992de49bc34fc2d806b86b13",
      "coverage-scenario:ff3062fc90293a63d6fb92e1"
    ],
    "coverage_mapping_status": "COMPLETE"
  },
  "scenario_coverage_map": [
    {
      "coverage_scenario_id": "coverage-scenario:43cece0c8802346401b5deae",
      "required_obligation_ids": [
        "verify:universe-01b5deae-expected",
        "verify:universe-01b5deae-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-01b5deae-expected",
        "verify:universe-01b5deae-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-483e9b2cb75b726f0695",
        "evidence:runtime-observed-proof-8f5826af135bc96e4317"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:caa9e24d2528c535370c5a1e",
      "required_obligation_ids": [
        "verify:universe-370c5a1e-expected",
        "verify:universe-370c5a1e-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-370c5a1e-expected",
        "verify:universe-370c5a1e-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-40eeec27cf402d543de0",
        "evidence:runtime-observed-proof-b8f6d5e2606cc8d3e76e"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:bc414288b7476f119f9fa3e5",
      "required_obligation_ids": [
        "verify:universe-9f9fa3e5-expected",
        "verify:universe-9f9fa3e5-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-9f9fa3e5-expected",
        "verify:universe-9f9fa3e5-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8074726f1340db93a631",
        "evidence:runtime-observed-proof-c09d33262cd36dbe50b3"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:47f468f00b595c2dd5cda5ec",
      "required_obligation_ids": [
        "verify:universe-d5cda5ec-expected",
        "verify:universe-d5cda5ec-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-d5cda5ec-expected",
        "verify:universe-d5cda5ec-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6c3e2ab5061a2550c76d",
        "evidence:runtime-observed-proof-3be29929cb5adb63b4b8"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:9d22b95ae9bd8ae8909edc85",
      "required_obligation_ids": [
        "verify:universe-909edc85-expected",
        "verify:universe-909edc85-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-909edc85-expected",
        "verify:universe-909edc85-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-eb8017c68e13f2d6ab80",
        "evidence:runtime-observed-proof-dbb2e99e646226d7a5d8"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:f4c1fef659b1700b868d4b91",
      "required_obligation_ids": [
        "verify:universe-868d4b91-expected",
        "verify:universe-868d4b91-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-868d4b91-expected",
        "verify:universe-868d4b91-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-013ec0534cfd2e60a36d",
        "evidence:runtime-observed-proof-86bef721dd8885f9c4a4"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:48c63a3946eec4af133bfd71",
      "required_obligation_ids": [
        "verify:universe-133bfd71-expected",
        "verify:universe-133bfd71-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-133bfd71-expected",
        "verify:universe-133bfd71-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9532a686b8f9f5cd2869",
        "evidence:runtime-observed-proof-c7e12b63bcc7bfe196d0"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:1d0e7e6faf265961a238de93",
      "required_obligation_ids": [
        "verify:universe-a238de93-expected",
        "verify:universe-a238de93-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-a238de93-expected",
        "verify:universe-a238de93-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4699f1b9fe49cbd678c4",
        "evidence:runtime-observed-proof-af970f13ef0b0c57fc74"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:650b4c64a1b70e12230f46e1",
      "required_obligation_ids": [
        "verify:universe-230f46e1-expected",
        "verify:universe-230f46e1-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-230f46e1-expected",
        "verify:universe-230f46e1-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-50c181611b2c4bf2c35b",
        "evidence:runtime-observed-proof-129bef2a28c88ca60e2c"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:3272d1cc0edb15536a3c13eb",
      "required_obligation_ids": [
        "verify:universe-6a3c13eb-expected",
        "verify:universe-6a3c13eb-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-6a3c13eb-expected",
        "verify:universe-6a3c13eb-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a00d0134ab2f9b74ec8f",
        "evidence:runtime-observed-proof-39813869c1a1e4ca8fec"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:6f717f8e7c64216dbb4f1e0b",
      "required_obligation_ids": [
        "verify:universe-bb4f1e0b-expected",
        "verify:universe-bb4f1e0b-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-bb4f1e0b-expected",
        "verify:universe-bb4f1e0b-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-3833e019a6e32f75f7cc",
        "evidence:runtime-observed-proof-895ab35bfe67b98c2cb9"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:48079dd4871b73ccf7ab67ee",
      "required_obligation_ids": [
        "verify:universe-f7ab67ee-expected",
        "verify:universe-f7ab67ee-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-f7ab67ee-expected",
        "verify:universe-f7ab67ee-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0a1d21f23ea7c5b5a473",
        "evidence:runtime-observed-proof-64165c4c9b0479f31333"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:ade6f1a45d265c29dfbddc4b",
      "required_obligation_ids": [
        "verify:universe-dfbddc4b-expected",
        "verify:universe-dfbddc4b-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-dfbddc4b-expected",
        "verify:universe-dfbddc4b-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4cf861ea705d96351e7b",
        "evidence:runtime-observed-proof-2afc5aa5f51f77179b61"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:aeb5a30daff1205dca9f9831",
      "required_obligation_ids": [
        "verify:universe-ca9f9831-expected",
        "verify:universe-ca9f9831-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-ca9f9831-expected",
        "verify:universe-ca9f9831-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-77195bc86d0883dd4859",
        "evidence:runtime-observed-proof-10b4f39ad55b29a61d57"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:989f4d4f1010b74f8dca8d52",
      "required_obligation_ids": [
        "verify:universe-8dca8d52-expected",
        "verify:universe-8dca8d52-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-8dca8d52-expected",
        "verify:universe-8dca8d52-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7f05177ef676e9142f06",
        "evidence:runtime-observed-proof-6a1b12ff3559ac05e5e3"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:c835f11288b928940ad03c62",
      "required_obligation_ids": [
        "verify:universe-0ad03c62-expected",
        "verify:universe-0ad03c62-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-0ad03c62-expected",
        "verify:universe-0ad03c62-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-559c5a7c06e773cb4d94",
        "evidence:runtime-observed-proof-1f3053a9816e3208430f"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:208b4e9979a2effb88185f96",
      "required_obligation_ids": [
        "verify:universe-88185f96-expected",
        "verify:universe-88185f96-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-88185f96-expected",
        "verify:universe-88185f96-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7a0b42b5583875be5174",
        "evidence:runtime-observed-proof-ce6cff30826053ba2542"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:5ca8093ed114d2caab243239",
      "required_obligation_ids": [
        "verify:universe-ab243239-expected",
        "verify:universe-ab243239-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-ab243239-expected",
        "verify:universe-ab243239-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a2ae53c13ba450ccbffc",
        "evidence:runtime-observed-proof-174838e91c79f44c2f72"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:29f7d80aefbb6a5feafe80a3",
      "required_obligation_ids": [
        "verify:universe-eafe80a3-expected",
        "verify:universe-eafe80a3-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-eafe80a3-expected",
        "verify:universe-eafe80a3-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-3a8ea2868458b83cdb33",
        "evidence:runtime-observed-proof-adbcf030dff5eddd7f5c"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:1dbeb7a48e5d24c87bea42b3",
      "required_obligation_ids": [
        "verify:universe-7bea42b3-expected",
        "verify:universe-7bea42b3-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-7bea42b3-expected",
        "verify:universe-7bea42b3-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-73253ed44b9e253a88cb",
        "evidence:runtime-observed-proof-9cf63a9e56481a6fc27d"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:c2fb3632955495444cd77b0a",
      "required_obligation_ids": [
        "verify:universe-4cd77b0a-expected",
        "verify:universe-4cd77b0a-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-4cd77b0a-expected",
        "verify:universe-4cd77b0a-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a8ae74acee1c786a5efe",
        "evidence:runtime-observed-proof-384096f2c51507882454"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:6905316f96d53cf16f5a5aa3",
      "required_obligation_ids": [
        "verify:universe-6f5a5aa3-expected",
        "verify:universe-6f5a5aa3-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-6f5a5aa3-expected",
        "verify:universe-6f5a5aa3-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-79bb360923f1f6bae8e1",
        "evidence:runtime-observed-proof-d23582d795efb8ef7f41"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:7e08056abf0da28194a115a4",
      "required_obligation_ids": [
        "verify:universe-94a115a4-expected",
        "verify:universe-94a115a4-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-94a115a4-expected",
        "verify:universe-94a115a4-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-fd59672ebd21554e8e65",
        "evidence:runtime-observed-proof-af4d8c7d5b7811fd3798"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:d2242869cef4b9434087f54e",
      "required_obligation_ids": [
        "verify:universe-4087f54e-expected",
        "verify:universe-4087f54e-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-4087f54e-expected",
        "verify:universe-4087f54e-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7b25d973d6cb40cd40cc",
        "evidence:runtime-observed-proof-23bc96c3ab7d06d1c088"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:3b33292838217b6f3ad67323",
      "required_obligation_ids": [
        "verify:universe-3ad67323-expected",
        "verify:universe-3ad67323-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-3ad67323-expected",
        "verify:universe-3ad67323-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ee972279cb0a66368d36",
        "evidence:runtime-observed-proof-067c0ec0e9df62b0e469"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:dddd76cf5cba725595d747e1",
      "required_obligation_ids": [
        "verify:universe-95d747e1-expected",
        "verify:universe-95d747e1-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-95d747e1-expected",
        "verify:universe-95d747e1-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b62000a72e049da75b26",
        "evidence:runtime-observed-proof-084e8cdb032d8202a54b"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:62ea36bafb14320100218482",
      "required_obligation_ids": [
        "verify:universe-00218482-expected",
        "verify:universe-00218482-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-00218482-expected",
        "verify:universe-00218482-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-836f4252cd6ffc569462",
        "evidence:runtime-observed-proof-c9051539fa587a64efe1"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:5808f2fdec78752d72c3bacf",
      "required_obligation_ids": [
        "verify:universe-72c3bacf-expected",
        "verify:universe-72c3bacf-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-72c3bacf-expected",
        "verify:universe-72c3bacf-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7d5c54753ae4850b3f29",
        "evidence:runtime-observed-proof-8430cd0784f0b3f73b57"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:f8b5b1567a6a232da0707b63",
      "required_obligation_ids": [
        "verify:universe-a0707b63-expected",
        "verify:universe-a0707b63-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-a0707b63-expected",
        "verify:universe-a0707b63-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-bc19c9c606908407fabf",
        "evidence:runtime-observed-proof-6e3456ef3bebee9c76e8"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:ec7f91d480466a9da4833a0b",
      "required_obligation_ids": [
        "verify:universe-a4833a0b-expected",
        "verify:universe-a4833a0b-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-a4833a0b-expected",
        "verify:universe-a4833a0b-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-939e64da3debdfa5ce71",
        "evidence:runtime-observed-proof-9af0b5d96ceea7fb7f18"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:4f13fa15a81c906d8331c5ae",
      "required_obligation_ids": [
        "verify:universe-8331c5ae-expected",
        "verify:universe-8331c5ae-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-8331c5ae-expected",
        "verify:universe-8331c5ae-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-54fd0cbc7befd6355cc9",
        "evidence:runtime-observed-proof-a25fcccaf83e95b2f627"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:c09cab4c94ed1443aa4f5177",
      "required_obligation_ids": [
        "verify:universe-aa4f5177-expected",
        "verify:universe-aa4f5177-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-aa4f5177-expected",
        "verify:universe-aa4f5177-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f3a4563bd8476581bd96",
        "evidence:runtime-observed-proof-da1a0e3a85a416bc3d38"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:ef0f28c65a09b433d36e2a76",
      "required_obligation_ids": [
        "verify:universe-d36e2a76-expected",
        "verify:universe-d36e2a76-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-d36e2a76-expected",
        "verify:universe-d36e2a76-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-40fb52a88645b546cd07",
        "evidence:runtime-observed-proof-345ba77bb8899e938497"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:8435057357f8c67e610c7460",
      "required_obligation_ids": [
        "verify:universe-610c7460-expected",
        "verify:universe-610c7460-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-610c7460-expected",
        "verify:universe-610c7460-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a74967512e88fe1a6351",
        "evidence:runtime-observed-proof-feecc3a494242f830d81"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:e7db0204a08697529a3804d1",
      "required_obligation_ids": [
        "verify:universe-9a3804d1-expected",
        "verify:universe-9a3804d1-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-9a3804d1-expected",
        "verify:universe-9a3804d1-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0e4edb4968c686c7822f",
        "evidence:runtime-observed-proof-619bd95b44a63a0c2e9f"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:627884e4631b728248f98d4e",
      "required_obligation_ids": [
        "verify:universe-48f98d4e-expected",
        "verify:universe-48f98d4e-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-48f98d4e-expected",
        "verify:universe-48f98d4e-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0e5e1552a17b67a3ac28",
        "evidence:runtime-observed-proof-59640216e16852df6a0a"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:082ecd834caae2279a1bf08b",
      "required_obligation_ids": [
        "verify:universe-9a1bf08b-expected",
        "verify:universe-9a1bf08b-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-9a1bf08b-expected",
        "verify:universe-9a1bf08b-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-cf23257e2fe5f4ebb5b2",
        "evidence:runtime-observed-proof-681cc422b5fabf7c229c"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:ff3a5f1df630306ee710bac0",
      "required_obligation_ids": [
        "verify:universe-e710bac0-expected",
        "verify:universe-e710bac0-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-e710bac0-expected",
        "verify:universe-e710bac0-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-1aa74e5f8b8fa6082498",
        "evidence:runtime-observed-proof-0c93ca6453919d4de5b7"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:a06aef8c3cb6dd8966ba9a71",
      "required_obligation_ids": [
        "verify:universe-66ba9a71-expected",
        "verify:universe-66ba9a71-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-66ba9a71-expected",
        "verify:universe-66ba9a71-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-02a3ddcfcf2ece7ca844",
        "evidence:runtime-observed-proof-69fd7dd0ec2166ebe1d7"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:9baeb48aec07c853211b9347",
      "required_obligation_ids": [
        "verify:universe-211b9347-expected",
        "verify:universe-211b9347-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-211b9347-expected",
        "verify:universe-211b9347-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f2fe947cbb177db744f1",
        "evidence:runtime-observed-proof-53036f0258587dd11d9f"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:e0061077530f923c3e9d296e",
      "required_obligation_ids": [
        "verify:universe-3e9d296e-expected",
        "verify:universe-3e9d296e-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-3e9d296e-expected",
        "verify:universe-3e9d296e-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-69de9108b7fe9e97c2af",
        "evidence:runtime-observed-proof-40c834354ee37fe86a7f"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:a5f2b10fd0a66cbe4ea05a71",
      "required_obligation_ids": [
        "verify:universe-4ea05a71-expected",
        "verify:universe-4ea05a71-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-4ea05a71-expected",
        "verify:universe-4ea05a71-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ffa2d2ba416029bb3499",
        "evidence:runtime-observed-proof-406ad8a7f62f332b655e"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:891d12ce1ee1d2980a935c21",
      "required_obligation_ids": [
        "verify:universe-0a935c21-expected",
        "verify:universe-0a935c21-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-0a935c21-expected",
        "verify:universe-0a935c21-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-376448331fefcf1702a7",
        "evidence:runtime-observed-proof-a42ef4213003b1c7955d"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:ba3f489385b617c1ce319ca9",
      "required_obligation_ids": [
        "verify:universe-ce319ca9-expected",
        "verify:universe-ce319ca9-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-ce319ca9-expected",
        "verify:universe-ce319ca9-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4b54f3c239f11ab7a165",
        "evidence:runtime-observed-proof-9b869d9f40c835ebf41e"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:ba39a1bceb6834df010135e0",
      "required_obligation_ids": [
        "verify:universe-010135e0-expected",
        "verify:universe-010135e0-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-010135e0-expected",
        "verify:universe-010135e0-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d0c8135dfb43abf138ad",
        "evidence:runtime-observed-proof-65b87c3f9dd49e966012"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:68d06d9ea1a65c887e9a2282",
      "required_obligation_ids": [
        "verify:universe-7e9a2282-expected",
        "verify:universe-7e9a2282-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-7e9a2282-expected",
        "verify:universe-7e9a2282-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-859323409eaced5882ac",
        "evidence:runtime-observed-proof-17193589e0828b8971e6"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:0c36f7a0be696aec1a4fabb1",
      "required_obligation_ids": [
        "verify:universe-1a4fabb1-expected",
        "verify:universe-1a4fabb1-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-1a4fabb1-expected",
        "verify:universe-1a4fabb1-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d7b7f34c22aa76910d30",
        "evidence:runtime-observed-proof-8fe163944414e7d05067"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:65bb609c4f41160568b60ab3",
      "required_obligation_ids": [
        "verify:universe-68b60ab3-expected",
        "verify:universe-68b60ab3-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-68b60ab3-expected",
        "verify:universe-68b60ab3-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7d69946119a78cd09402",
        "evidence:runtime-observed-proof-0d03ab3ac80c13fd562b"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:fa831c674e070c926a0a12c4",
      "required_obligation_ids": [
        "verify:universe-6a0a12c4-expected",
        "verify:universe-6a0a12c4-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-6a0a12c4-expected",
        "verify:universe-6a0a12c4-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8382fdd3517912235b3c",
        "evidence:runtime-observed-proof-155bd3913ed1f936b38d"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:a4314123edddb1c83b1e8f43",
      "required_obligation_ids": [
        "verify:universe-3b1e8f43-expected",
        "verify:universe-3b1e8f43-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-3b1e8f43-expected",
        "verify:universe-3b1e8f43-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-caede192e5e8d5edc5c8",
        "evidence:runtime-observed-proof-4524a6f3ed1f624517ac"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:0251c7a2449f87f10adf81f2",
      "required_obligation_ids": [
        "verify:universe-0adf81f2-expected",
        "verify:universe-0adf81f2-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-0adf81f2-expected",
        "verify:universe-0adf81f2-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-fea830ebdeff2248ebe1",
        "evidence:runtime-observed-proof-df8362538c6c6a9effc6"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:529fb9db9c61162241c23483",
      "required_obligation_ids": [
        "verify:universe-41c23483-expected",
        "verify:universe-41c23483-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-41c23483-expected",
        "verify:universe-41c23483-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-dc3a0e8af397740882e9",
        "evidence:runtime-observed-proof-98784547f2bf99c4a025"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:992de49bc34fc2d806b86b13",
      "required_obligation_ids": [
        "verify:universe-06b86b13-expected",
        "verify:universe-06b86b13-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-06b86b13-expected",
        "verify:universe-06b86b13-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f47f98e11daeed0e37ea",
        "evidence:runtime-observed-proof-2e0b202066a75f6f91a3"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:ff3062fc90293a63d6fb92e1",
      "required_obligation_ids": [
        "verify:universe-d6fb92e1-expected",
        "verify:universe-d6fb92e1-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-d6fb92e1-expected",
        "verify:universe-d6fb92e1-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-27e527ce5d984c0a75a5",
        "evidence:runtime-observed-proof-18798e14155abf98fbe4"
      ]
    }
  ],
  "test_quality_controls": [
    {
      "id": "control:negative-path-required",
      "applies_to": "API_CONTRACT",
      "status": "NOT_APPLICABLE_WITH_REASON",
      "evidence_ids": [],
      "reason": "No Verification Plan obligation uses this control surface."
    },
    {
      "id": "control:generated-test-review-required",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "runtime:self-current-obligation-evidence",
        "evidence:runtime-observed-proof-df2569ac7d558efb63e1"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-df2569ac7d558efb63e1"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    }
  ],
  "known_gaps": [
    {
      "id": "none",
      "severity": "NONE",
      "reason": "No known gaps recorded.",
      "required_follow_up": "Not required."
    }
  ],
  "manual_verification": [
    {
      "id": "none",
      "owner": "None",
      "decision_ref": "not required",
      "evidence_ref": "not required",
      "status": "NOT_REQUIRED",
      "reason": "No manual verification required by the Verification Plan."
    }
  ],
  "existing_project_mapping": {
    "status": "NOT_APPLICABLE",
    "ref": "not provided",
    "reason": "No existing-project mapping was provided for this Test Evidence Report."
  },
  "boundaries": {
    "writes_target_files": "No",
    "executes_tests": "No",
    "fabricates_evidence": "No",
    "authorizes_implementation": "No",
    "approves_release_or_production": "No",
    "proves_product_correctness": "No",
    "proves_real_environment_behavior": "No"
  },
  "next_step": "Proceed to execution closure or finish check with this report as evidence."
}
```

## Outcome

`TEST_EVIDENCE_COMPLETE`

## Next Step

Proceed to execution closure or finish check with this report as evidence.
