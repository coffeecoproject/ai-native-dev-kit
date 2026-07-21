# Test Evidence Report

## Human Summary

Test evidence state TEST_EVIDENCE_COMPLETE; 119/119 required obligations covered by 125 evidence item(s).

## User Request

- Request: Complete IntentOS 1.113 cross-domain trust closure by enforcing required task consumers, evidence authority, security boundaries, atomic apply recovery, existing-project activation, baseline integrity, and bounded source distribution evidence while prohibiting external effects.
- Task ref: `task:17bb774d904e7e5418668f77f40440ad80a50edf32bc43c9a71860a2a8503b98`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `verification_plan` | `RECORDED` | `artifact:verification-plans/113-cross-domain-trust-closure.md` | `VERIFICATION_PLAN_READY` | `sha256:f31bb1fef6875d0dc81614d4cc9a407bd3ebc902f6449b48ef8d3c0aec8c748c` |
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/113-cross-domain-trust-closure.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:25b859c4b4ccf0095286e33bea88cb336cb3d743f96a008d4524993403791e6b` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/preflight-113-cross-domain-trust-closure.md` | `CHANGE_IMPACT_RECORDED` | `sha256:85a4a3739b6fbbc2852ba3f0ae7c0aa76acf199998d66b479d445456ef2b68ac` |
| `business_universe_coverage` | `RECORDED` | `artifact:business-universe-coverage-reports/113-cross-domain-trust-closure.md` | `COVERAGE_READY` | `sha256:3fd5627529d7fe3a6905cf6bcf4d164e20f363983bdf8e1b00b28e7402b5197a` |
| `control_effectiveness` | `RECORDED` | `artifact:control-effectiveness-reports/113-cross-domain-trust-closure.md` | `CONTROL_PROVEN_EFFECTIVE` | `sha256:72c8b436fa6fff5ab18875cd7eb640d50b5377e5d00fd1ef2fa111e8b6f35057` |
| `verification_run_manifest` | `RECORDED` | `artifact:verification-run-manifests/113-cross-domain-trust-closure.md` | `RUNTIME_TRUST_COMPLETE` | `sha256:fa1c7969e781349a55da46041c1d52db22e981efcd2b6f835fe31a3829514b1e` |

## Test Evidence Identity

- Test evidence ref: `artifact:test-evidence-reports/113-cross-domain-trust-closure.md`
- Test evidence digest: `sha256:a3de78e96245ca581cbc8e4dc2f34e2786de0eb44b3c2c7d8232a379ac5139e9`
- Verification plan ref: `artifact:verification-plans/113-cross-domain-trust-closure.md`
- Verification plan digest: `sha256:f31bb1fef6875d0dc81614d4cc9a407bd3ebc902f6449b48ef8d3c0aec8c748c`
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
| Run ID | `vrun-113-cross-domain-trust-r46` |
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
- Report digest: `sha256:72c8b436fa6fff5ab18875cd7eb640d50b5377e5d00fd1ef2fa111e8b6f35057`
- Required claims: `claim:package-script-verify-candidate`, `claim:package-script-verify-runtime-trust-core`, `claim:package-script-verify-runtime-trust`, `claim:package-script-verify-consumer-chain-candidate`, `claim:package-script-verify-baseline`, `claim:package-script-verify-example-observed-evidence`, `claim:package-script-verify-release-topology-consumers`, `claim:package-script-verify-planning-closure`
- Assessment outcome: `CONTROL_PROVEN_EFFECTIVE`
- Reason: The exact current report proves every relied-on bounded control claim.

## Business Universe Scenario Coverage

| Scenario ID | Required obligations | Covered obligations | Proof strength | Coverage state | Evidence IDs |
|---|---|---|---|---|---|
| `coverage-scenario:43cece0c8802346401b5deae` | `verify:universe-01b5deae-expected`, `verify:universe-01b5deae-negative` | `verify:universe-01b5deae-expected`, `verify:universe-01b5deae-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-3fc5aaa23e066c8e1994`, `evidence:runtime-observed-proof-5cadef2a00608847e7cf` |
| `coverage-scenario:caa9e24d2528c535370c5a1e` | `verify:universe-370c5a1e-expected`, `verify:universe-370c5a1e-negative` | `verify:universe-370c5a1e-expected`, `verify:universe-370c5a1e-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-05a05bd682cdbb448f30`, `evidence:runtime-observed-proof-2acf82484cc9ddcb09fd` |
| `coverage-scenario:bc414288b7476f119f9fa3e5` | `verify:universe-9f9fa3e5-expected`, `verify:universe-9f9fa3e5-negative` | `verify:universe-9f9fa3e5-expected`, `verify:universe-9f9fa3e5-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-92576132a820c1eb89d1`, `evidence:runtime-observed-proof-6881eef83c5192f30c02` |
| `coverage-scenario:47f468f00b595c2dd5cda5ec` | `verify:universe-d5cda5ec-expected`, `verify:universe-d5cda5ec-negative` | `verify:universe-d5cda5ec-expected`, `verify:universe-d5cda5ec-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-12e660a0b2bab437d98d`, `evidence:runtime-observed-proof-b0b3be4334321fb59aba` |
| `coverage-scenario:9d22b95ae9bd8ae8909edc85` | `verify:universe-909edc85-expected`, `verify:universe-909edc85-negative` | `verify:universe-909edc85-expected`, `verify:universe-909edc85-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-8bffc55a3dbbf4a12941`, `evidence:runtime-observed-proof-b48ecc980cbb7fafa9b7` |
| `coverage-scenario:f4c1fef659b1700b868d4b91` | `verify:universe-868d4b91-expected`, `verify:universe-868d4b91-negative` | `verify:universe-868d4b91-expected`, `verify:universe-868d4b91-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-306eb71a036de03dd2c9`, `evidence:runtime-observed-proof-25d0e2045daf4978aebd` |
| `coverage-scenario:48c63a3946eec4af133bfd71` | `verify:universe-133bfd71-expected`, `verify:universe-133bfd71-negative` | `verify:universe-133bfd71-expected`, `verify:universe-133bfd71-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-542e9b57fa5f83ed987a`, `evidence:runtime-observed-proof-88d9738aaaa5bee8451a` |
| `coverage-scenario:1d0e7e6faf265961a238de93` | `verify:universe-a238de93-expected`, `verify:universe-a238de93-negative` | `verify:universe-a238de93-expected`, `verify:universe-a238de93-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-eed60b399a77f4dc2fd6`, `evidence:runtime-observed-proof-680df53c1fa1b4221490` |
| `coverage-scenario:650b4c64a1b70e12230f46e1` | `verify:universe-230f46e1-expected`, `verify:universe-230f46e1-negative` | `verify:universe-230f46e1-expected`, `verify:universe-230f46e1-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-4acd6f564173acb0c2a3`, `evidence:runtime-observed-proof-2f2a3d79c71dba26fddf` |
| `coverage-scenario:3272d1cc0edb15536a3c13eb` | `verify:universe-6a3c13eb-expected`, `verify:universe-6a3c13eb-negative` | `verify:universe-6a3c13eb-expected`, `verify:universe-6a3c13eb-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-a8a10a53e69bc3d9e7cf`, `evidence:runtime-observed-proof-34592ddbee403227ffb4` |
| `coverage-scenario:6f717f8e7c64216dbb4f1e0b` | `verify:universe-bb4f1e0b-expected`, `verify:universe-bb4f1e0b-negative` | `verify:universe-bb4f1e0b-expected`, `verify:universe-bb4f1e0b-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-763f9f83a993fb4eb691`, `evidence:runtime-observed-proof-cdcf814424a18a82a904` |
| `coverage-scenario:48079dd4871b73ccf7ab67ee` | `verify:universe-f7ab67ee-expected`, `verify:universe-f7ab67ee-negative` | `verify:universe-f7ab67ee-expected`, `verify:universe-f7ab67ee-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-5085073f22b34e656152`, `evidence:runtime-observed-proof-5612726a00a27a139bc0` |
| `coverage-scenario:ade6f1a45d265c29dfbddc4b` | `verify:universe-dfbddc4b-expected`, `verify:universe-dfbddc4b-negative` | `verify:universe-dfbddc4b-expected`, `verify:universe-dfbddc4b-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-9ab47b1f296ebff96f87`, `evidence:runtime-observed-proof-f35ad10d58e78f706472` |
| `coverage-scenario:aeb5a30daff1205dca9f9831` | `verify:universe-ca9f9831-expected`, `verify:universe-ca9f9831-negative` | `verify:universe-ca9f9831-expected`, `verify:universe-ca9f9831-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-8334f266872888104b99`, `evidence:runtime-observed-proof-2f1ef66de8193e76b0d7` |
| `coverage-scenario:989f4d4f1010b74f8dca8d52` | `verify:universe-8dca8d52-expected`, `verify:universe-8dca8d52-negative` | `verify:universe-8dca8d52-expected`, `verify:universe-8dca8d52-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-ccdd3973f99579ce0871`, `evidence:runtime-observed-proof-fe13b0776a5072041518` |
| `coverage-scenario:c835f11288b928940ad03c62` | `verify:universe-0ad03c62-expected`, `verify:universe-0ad03c62-negative` | `verify:universe-0ad03c62-expected`, `verify:universe-0ad03c62-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-edb603d611fd2c24111a`, `evidence:runtime-observed-proof-9224923404b1e9c419da` |
| `coverage-scenario:208b4e9979a2effb88185f96` | `verify:universe-88185f96-expected`, `verify:universe-88185f96-negative` | `verify:universe-88185f96-expected`, `verify:universe-88185f96-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-f1c4f3cace43d0369237`, `evidence:runtime-observed-proof-f3e9165afcf29eeaf746` |
| `coverage-scenario:5ca8093ed114d2caab243239` | `verify:universe-ab243239-expected`, `verify:universe-ab243239-negative` | `verify:universe-ab243239-expected`, `verify:universe-ab243239-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-4860f1de8b53fa03d53d`, `evidence:runtime-observed-proof-35fbc3257d301eb08bc5` |
| `coverage-scenario:29f7d80aefbb6a5feafe80a3` | `verify:universe-eafe80a3-expected`, `verify:universe-eafe80a3-negative` | `verify:universe-eafe80a3-expected`, `verify:universe-eafe80a3-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-f96ffbad9fe5a3b2ab18`, `evidence:runtime-observed-proof-e30b2551f6e62bfbed96` |
| `coverage-scenario:1dbeb7a48e5d24c87bea42b3` | `verify:universe-7bea42b3-expected`, `verify:universe-7bea42b3-negative` | `verify:universe-7bea42b3-expected`, `verify:universe-7bea42b3-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-0b63b9889b2ef6fd5c0a`, `evidence:runtime-observed-proof-f5599eedf4040fca1960` |
| `coverage-scenario:c2fb3632955495444cd77b0a` | `verify:universe-4cd77b0a-expected`, `verify:universe-4cd77b0a-negative` | `verify:universe-4cd77b0a-expected`, `verify:universe-4cd77b0a-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-f975ce305d61772c6eec`, `evidence:runtime-observed-proof-4b0c50ee113d27288791` |
| `coverage-scenario:6905316f96d53cf16f5a5aa3` | `verify:universe-6f5a5aa3-expected`, `verify:universe-6f5a5aa3-negative` | `verify:universe-6f5a5aa3-expected`, `verify:universe-6f5a5aa3-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-2173785350a6f0b314f1`, `evidence:runtime-observed-proof-a5760fef9ab5c045422a` |
| `coverage-scenario:7e08056abf0da28194a115a4` | `verify:universe-94a115a4-expected`, `verify:universe-94a115a4-negative` | `verify:universe-94a115a4-expected`, `verify:universe-94a115a4-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-b6b5826c5fdd8f2c931a`, `evidence:runtime-observed-proof-2b2b3e1c5f3edeb4f946` |
| `coverage-scenario:d2242869cef4b9434087f54e` | `verify:universe-4087f54e-expected`, `verify:universe-4087f54e-negative` | `verify:universe-4087f54e-expected`, `verify:universe-4087f54e-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d42b506439b4d4899357`, `evidence:runtime-observed-proof-95ff1721f8624293005c` |
| `coverage-scenario:3b33292838217b6f3ad67323` | `verify:universe-3ad67323-expected`, `verify:universe-3ad67323-negative` | `verify:universe-3ad67323-expected`, `verify:universe-3ad67323-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-92c5e5da6178a5e7afbd`, `evidence:runtime-observed-proof-3f9345c1bcd57307f3fb` |
| `coverage-scenario:dddd76cf5cba725595d747e1` | `verify:universe-95d747e1-expected`, `verify:universe-95d747e1-negative` | `verify:universe-95d747e1-expected`, `verify:universe-95d747e1-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d010745db5d8d545913c`, `evidence:runtime-observed-proof-99d37b0b1286bc3c4d09` |
| `coverage-scenario:62ea36bafb14320100218482` | `verify:universe-00218482-expected`, `verify:universe-00218482-negative` | `verify:universe-00218482-expected`, `verify:universe-00218482-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-8980188c02eb14d474a7`, `evidence:runtime-observed-proof-ddaa21660beb0a3fbd3a` |
| `coverage-scenario:5808f2fdec78752d72c3bacf` | `verify:universe-72c3bacf-expected`, `verify:universe-72c3bacf-negative` | `verify:universe-72c3bacf-expected`, `verify:universe-72c3bacf-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-71e9478b1857421f706c`, `evidence:runtime-observed-proof-28b19645238bb12d890c` |
| `coverage-scenario:f8b5b1567a6a232da0707b63` | `verify:universe-a0707b63-expected`, `verify:universe-a0707b63-negative` | `verify:universe-a0707b63-expected`, `verify:universe-a0707b63-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d0cc5c9944cc7d2c807a`, `evidence:runtime-observed-proof-af8fd0a42b819b80bfec` |
| `coverage-scenario:ec7f91d480466a9da4833a0b` | `verify:universe-a4833a0b-expected`, `verify:universe-a4833a0b-negative` | `verify:universe-a4833a0b-expected`, `verify:universe-a4833a0b-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-8c09e4a32a51b35b459a`, `evidence:runtime-observed-proof-6eb9dd28445c0326431e` |
| `coverage-scenario:4f13fa15a81c906d8331c5ae` | `verify:universe-8331c5ae-expected`, `verify:universe-8331c5ae-negative` | `verify:universe-8331c5ae-expected`, `verify:universe-8331c5ae-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-e802dcc289e132e40e12`, `evidence:runtime-observed-proof-3c30a2985a8d93e0bcab` |
| `coverage-scenario:c09cab4c94ed1443aa4f5177` | `verify:universe-aa4f5177-expected`, `verify:universe-aa4f5177-negative` | `verify:universe-aa4f5177-expected`, `verify:universe-aa4f5177-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-92ba013345d8040dca61`, `evidence:runtime-observed-proof-59cdbddf283fd5b630f8` |
| `coverage-scenario:ef0f28c65a09b433d36e2a76` | `verify:universe-d36e2a76-expected`, `verify:universe-d36e2a76-negative` | `verify:universe-d36e2a76-expected`, `verify:universe-d36e2a76-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-c823cdea88fa4af40566`, `evidence:runtime-observed-proof-8c574af00e0f954ec50e` |
| `coverage-scenario:8435057357f8c67e610c7460` | `verify:universe-610c7460-expected`, `verify:universe-610c7460-negative` | `verify:universe-610c7460-expected`, `verify:universe-610c7460-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-87d2206f5f2600607b75`, `evidence:runtime-observed-proof-bb25e4dc2ea9320c7697` |
| `coverage-scenario:e7db0204a08697529a3804d1` | `verify:universe-9a3804d1-expected`, `verify:universe-9a3804d1-negative` | `verify:universe-9a3804d1-expected`, `verify:universe-9a3804d1-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-8df41319df67914204df`, `evidence:runtime-observed-proof-53d29a4d628a76271718` |
| `coverage-scenario:627884e4631b728248f98d4e` | `verify:universe-48f98d4e-expected`, `verify:universe-48f98d4e-negative` | `verify:universe-48f98d4e-expected`, `verify:universe-48f98d4e-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-eac072ac8b9eae2ec23d`, `evidence:runtime-observed-proof-70ef617455bcfae0a28d` |
| `coverage-scenario:082ecd834caae2279a1bf08b` | `verify:universe-9a1bf08b-expected`, `verify:universe-9a1bf08b-negative` | `verify:universe-9a1bf08b-expected`, `verify:universe-9a1bf08b-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-7f0c5c6bb085a65f111d`, `evidence:runtime-observed-proof-bb50c4ecb5f7e25c0ef5` |
| `coverage-scenario:ff3a5f1df630306ee710bac0` | `verify:universe-e710bac0-expected`, `verify:universe-e710bac0-negative` | `verify:universe-e710bac0-expected`, `verify:universe-e710bac0-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-58148528bd5f19acbec5`, `evidence:runtime-observed-proof-6907d4866fd55251d774` |
| `coverage-scenario:a06aef8c3cb6dd8966ba9a71` | `verify:universe-66ba9a71-expected`, `verify:universe-66ba9a71-negative` | `verify:universe-66ba9a71-expected`, `verify:universe-66ba9a71-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-aac2aa9e64d8e7f7cb2b`, `evidence:runtime-observed-proof-39136aaeda352ca3b735` |
| `coverage-scenario:9baeb48aec07c853211b9347` | `verify:universe-211b9347-expected`, `verify:universe-211b9347-negative` | `verify:universe-211b9347-expected`, `verify:universe-211b9347-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-810b48dce7d8633a9b07`, `evidence:runtime-observed-proof-c4ca0ab07e57c7d22845` |
| `coverage-scenario:e0061077530f923c3e9d296e` | `verify:universe-3e9d296e-expected`, `verify:universe-3e9d296e-negative` | `verify:universe-3e9d296e-expected`, `verify:universe-3e9d296e-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d47aad523ecd783d6d21`, `evidence:runtime-observed-proof-656451ddc299516dce8e` |
| `coverage-scenario:a5f2b10fd0a66cbe4ea05a71` | `verify:universe-4ea05a71-expected`, `verify:universe-4ea05a71-negative` | `verify:universe-4ea05a71-expected`, `verify:universe-4ea05a71-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-9fa616c6cec460911de9`, `evidence:runtime-observed-proof-cc05756610bf1db467d9` |
| `coverage-scenario:891d12ce1ee1d2980a935c21` | `verify:universe-0a935c21-expected`, `verify:universe-0a935c21-negative` | `verify:universe-0a935c21-expected`, `verify:universe-0a935c21-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-ab91d0618b13ef6a3370`, `evidence:runtime-observed-proof-e2fb371649c718d36724` |
| `coverage-scenario:ba3f489385b617c1ce319ca9` | `verify:universe-ce319ca9-expected`, `verify:universe-ce319ca9-negative` | `verify:universe-ce319ca9-expected`, `verify:universe-ce319ca9-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-c4eb0decb3641804e9ad`, `evidence:runtime-observed-proof-e60350b8fd876b797e41` |
| `coverage-scenario:ba39a1bceb6834df010135e0` | `verify:universe-010135e0-expected`, `verify:universe-010135e0-negative` | `verify:universe-010135e0-expected`, `verify:universe-010135e0-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d5c1d68a1303d18779cc`, `evidence:runtime-observed-proof-5c8a124f22acff53d6db` |
| `coverage-scenario:68d06d9ea1a65c887e9a2282` | `verify:universe-7e9a2282-expected`, `verify:universe-7e9a2282-negative` | `verify:universe-7e9a2282-expected`, `verify:universe-7e9a2282-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-9187f4789c9ae85093c3`, `evidence:runtime-observed-proof-4a2a2eee3e24c74c9f07` |
| `coverage-scenario:0c36f7a0be696aec1a4fabb1` | `verify:universe-1a4fabb1-expected`, `verify:universe-1a4fabb1-negative` | `verify:universe-1a4fabb1-expected`, `verify:universe-1a4fabb1-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d0acc800a043a82395f6`, `evidence:runtime-observed-proof-17a191a8897e431fcd40` |
| `coverage-scenario:65bb609c4f41160568b60ab3` | `verify:universe-68b60ab3-expected`, `verify:universe-68b60ab3-negative` | `verify:universe-68b60ab3-expected`, `verify:universe-68b60ab3-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d2aed395a5cab3ece861`, `evidence:runtime-observed-proof-e0e03bd6ac210bc0e12b` |
| `coverage-scenario:fa831c674e070c926a0a12c4` | `verify:universe-6a0a12c4-expected`, `verify:universe-6a0a12c4-negative` | `verify:universe-6a0a12c4-expected`, `verify:universe-6a0a12c4-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-8822f7d64673f93f3357`, `evidence:runtime-observed-proof-5b09c598e2a84ae68c48` |
| `coverage-scenario:a4314123edddb1c83b1e8f43` | `verify:universe-3b1e8f43-expected`, `verify:universe-3b1e8f43-negative` | `verify:universe-3b1e8f43-expected`, `verify:universe-3b1e8f43-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-f550d81ebbadc70d8c6e`, `evidence:runtime-observed-proof-5377ce7f954f4786e87f` |
| `coverage-scenario:0251c7a2449f87f10adf81f2` | `verify:universe-0adf81f2-expected`, `verify:universe-0adf81f2-negative` | `verify:universe-0adf81f2-expected`, `verify:universe-0adf81f2-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-0048a78db380a6e88507`, `evidence:runtime-observed-proof-9f7e78fa79b47d65c7e8` |
| `coverage-scenario:529fb9db9c61162241c23483` | `verify:universe-41c23483-expected`, `verify:universe-41c23483-negative` | `verify:universe-41c23483-expected`, `verify:universe-41c23483-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-bf52e5684f98f0212b66`, `evidence:runtime-observed-proof-c42b5bebc275c18c1b2f` |
| `coverage-scenario:992de49bc34fc2d806b86b13` | `verify:universe-06b86b13-expected`, `verify:universe-06b86b13-negative` | `verify:universe-06b86b13-expected`, `verify:universe-06b86b13-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-17deaa486d338f89b68c`, `evidence:runtime-observed-proof-45c5591317c87eaa9900` |
| `coverage-scenario:ff3062fc90293a63d6fb92e1` | `verify:universe-d6fb92e1-expected`, `verify:universe-d6fb92e1-negative` | `verify:universe-d6fb92e1-expected`, `verify:universe-d6fb92e1-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d88badb4a0d7fab4b4b8`, `evidence:runtime-observed-proof-2e0b531b98eadbe88697` |

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `runtime:self-runtime-negative` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-negative.log` | node scripts/verification-runtime-self-service.mjs negative | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:db00ba10b86b4fd4d8818661ded684e4577dd51ecc46b76f371a17805b8efca1` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-runtime-positive` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-positive.log` | node scripts/verification-runtime-self-service.mjs positive | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:8337923abcf7495a8304d1642a158a91a0b79ec8804eb278d7c993525e2baf33` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-candidate-verification` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-candidate-verification.log` | npm run verify:pre-runtime | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:5095a04d9e0843b29f37d03187f8d9e957b49dfeaef89d414c17d2144e462f3a` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-obligation-evidence` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr`, `verify:data-model-data-model-check-data-model-historical-records-migrat`, `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders`, `verify:external-integration-integration-contract-check-external-integra`, `verify:permission-risk-permission-boundary-test-role-tenant-visibility-`, `verify:release-impact-release-smoke-check-release-rollback-monitoring-o`, `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb`, `verify:test-coverage-regression-smoke-task-specific-verification-exists`, `verify:universe-00218482-expected`, `verify:universe-00218482-negative`, `verify:universe-010135e0-expected`, `verify:universe-010135e0-negative`, `verify:universe-01b5deae-expected`, `verify:universe-01b5deae-negative`, `verify:universe-06b86b13-expected`, `verify:universe-06b86b13-negative`, `verify:universe-0a935c21-expected`, `verify:universe-0a935c21-negative`, `verify:universe-0ad03c62-expected`, `verify:universe-0ad03c62-negative`, `verify:universe-0adf81f2-expected`, `verify:universe-0adf81f2-negative`, `verify:universe-133bfd71-expected`, `verify:universe-133bfd71-negative`, `verify:universe-1a4fabb1-expected`, `verify:universe-1a4fabb1-negative`, `verify:universe-211b9347-expected`, `verify:universe-211b9347-negative`, `verify:universe-230f46e1-expected`, `verify:universe-230f46e1-negative`, `verify:universe-370c5a1e-expected`, `verify:universe-370c5a1e-negative`, `verify:universe-3ad67323-expected`, `verify:universe-3ad67323-negative`, `verify:universe-3b1e8f43-expected`, `verify:universe-3b1e8f43-negative`, `verify:universe-3e9d296e-expected`, `verify:universe-3e9d296e-negative`, `verify:universe-4087f54e-expected`, `verify:universe-4087f54e-negative`, `verify:universe-41c23483-expected`, `verify:universe-41c23483-negative`, `verify:universe-48f98d4e-expected`, `verify:universe-48f98d4e-negative`, `verify:universe-4cd77b0a-expected`, `verify:universe-4cd77b0a-negative`, `verify:universe-4ea05a71-expected`, `verify:universe-4ea05a71-negative`, `verify:universe-610c7460-expected`, `verify:universe-610c7460-negative`, `verify:universe-66ba9a71-expected`, `verify:universe-66ba9a71-negative`, `verify:universe-68b60ab3-expected`, `verify:universe-68b60ab3-negative`, `verify:universe-6a0a12c4-expected`, `verify:universe-6a0a12c4-negative`, `verify:universe-6a3c13eb-expected`, `verify:universe-6a3c13eb-negative`, `verify:universe-6f5a5aa3-expected`, `verify:universe-6f5a5aa3-negative`, `verify:universe-72c3bacf-expected`, `verify:universe-72c3bacf-negative`, `verify:universe-7bea42b3-expected`, `verify:universe-7bea42b3-negative`, `verify:universe-7e9a2282-expected`, `verify:universe-7e9a2282-negative`, `verify:universe-8331c5ae-expected`, `verify:universe-8331c5ae-negative`, `verify:universe-868d4b91-expected`, `verify:universe-868d4b91-negative`, `verify:universe-88185f96-expected`, `verify:universe-88185f96-negative`, `verify:universe-8dca8d52-expected`, `verify:universe-8dca8d52-negative`, `verify:universe-909edc85-expected`, `verify:universe-909edc85-negative`, `verify:universe-94a115a4-expected`, `verify:universe-94a115a4-negative`, `verify:universe-95d747e1-expected`, `verify:universe-95d747e1-negative`, `verify:universe-9a1bf08b-expected`, `verify:universe-9a1bf08b-negative`, `verify:universe-9a3804d1-expected`, `verify:universe-9a3804d1-negative`, `verify:universe-9f9fa3e5-expected`, `verify:universe-9f9fa3e5-negative`, `verify:universe-a0707b63-expected`, `verify:universe-a0707b63-negative`, `verify:universe-a238de93-expected`, `verify:universe-a238de93-negative`, `verify:universe-a4833a0b-expected`, `verify:universe-a4833a0b-negative`, `verify:universe-aa4f5177-expected`, `verify:universe-aa4f5177-negative`, `verify:universe-ab243239-expected`, `verify:universe-ab243239-negative`, `verify:universe-bb4f1e0b-expected`, `verify:universe-bb4f1e0b-negative`, `verify:universe-ca9f9831-expected`, `verify:universe-ca9f9831-negative`, `verify:universe-ce319ca9-expected`, `verify:universe-ce319ca9-negative`, `verify:universe-d36e2a76-expected`, `verify:universe-d36e2a76-negative`, `verify:universe-d5cda5ec-expected`, `verify:universe-d5cda5ec-negative`, `verify:universe-d6fb92e1-expected`, `verify:universe-d6fb92e1-negative`, `verify:universe-dfbddc4b-expected`, `verify:universe-dfbddc4b-negative`, `verify:universe-e710bac0-expected`, `verify:universe-e710bac0-negative`, `verify:universe-eafe80a3-expected`, `verify:universe-eafe80a3-negative`, `verify:universe-f7ab67ee-expected`, `verify:universe-f7ab67ee-negative`, `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af`, `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-runtime-behavior` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:f7e9d924d6f29b6bfb13bd6c8d70705d901dde75591f730900ac0699e3ebc064` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `evidence:runtime-observed-proof-3fc5aaa23e066c8e1994` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-01b5deae-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/task-obligation-hardcut.test.mjs :: 1.113 Work Queue takeover ignores fixtures and accepts one governed current task in a dirty worktree; source line 4. |
| `evidence:runtime-observed-proof-5cadef2a00608847e7cf` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-01b5deae-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/task-obligation-hardcut.test.mjs :: 1.113 Work Queue takeover ignores fixtures and accepts one governed current task in a dirty worktree; source line 5. |
| `evidence:runtime-observed-proof-05a05bd682cdbb448f30` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-370c5a1e-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 6. |
| `evidence:runtime-observed-proof-2acf82484cc9ddcb09fd` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-370c5a1e-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 7. |
| `evidence:runtime-observed-proof-92576132a820c1eb89d1` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9f9fa3e5-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 8. |
| `evidence:runtime-observed-proof-6881eef83c5192f30c02` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9f9fa3e5-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 9. |
| `evidence:runtime-observed-proof-12e660a0b2bab437d98d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d5cda5ec-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 10. |
| `evidence:runtime-observed-proof-b0b3be4334321fb59aba` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d5cda5ec-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 11. |
| `evidence:runtime-observed-proof-8bffc55a3dbbf4a12941` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-909edc85-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 12. |
| `evidence:runtime-observed-proof-b48ecc980cbb7fafa9b7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-909edc85-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 13. |
| `evidence:runtime-observed-proof-306eb71a036de03dd2c9` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-868d4b91-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 14. |
| `evidence:runtime-observed-proof-25d0e2045daf4978aebd` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-868d4b91-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 15. |
| `evidence:runtime-observed-proof-542e9b57fa5f83ed987a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-133bfd71-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 16. |
| `evidence:runtime-observed-proof-88d9738aaaa5bee8451a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-133bfd71-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 17. |
| `evidence:runtime-observed-proof-eed60b399a77f4dc2fd6` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a238de93-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 18. |
| `evidence:runtime-observed-proof-680df53c1fa1b4221490` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a238de93-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 19. |
| `evidence:runtime-observed-proof-4acd6f564173acb0c2a3` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-230f46e1-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 20. |
| `evidence:runtime-observed-proof-2f2a3d79c71dba26fddf` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-230f46e1-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 21. |
| `evidence:runtime-observed-proof-c51d43018edec5988125` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:data-model-data-model-check-data-model-historical-records-migrat` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/typed-consumer-contract.test.mjs :: 1.113 historical completion evidence is readable but cannot satisfy current readiness; source line 22. |
| `evidence:runtime-observed-proof-f9ac703f7411cabbf383` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/typed-consumer-contract.test.mjs :: 1.113 evidence authority binds an exact item inside a file-backed artifact; source line 23. |
| `evidence:runtime-observed-proof-a8a10a53e69bc3d9e7cf` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6a3c13eb-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound local authority accepts an exact reversible existing-project adoption graph; source line 26. |
| `evidence:runtime-observed-proof-34592ddbee403227ffb4` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6a3c13eb-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound local authority accepts an exact reversible existing-project adoption graph; source line 27. |
| `evidence:runtime-observed-proof-763f9f83a993fb4eb691` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-bb4f1e0b-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a target lock prevents two controlled applies from starting concurrently; source line 28. |
| `evidence:runtime-observed-proof-cdcf814424a18a82a904` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-bb4f1e0b-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a target lock prevents two controlled applies from starting concurrently; source line 29. |
| `evidence:runtime-observed-proof-5085073f22b34e656152` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-f7ab67ee-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 30. |
| `evidence:runtime-observed-proof-5612726a00a27a139bc0` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-f7ab67ee-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 31. |
| `evidence:runtime-observed-proof-9ab47b1f296ebff96f87` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-dfbddc4b-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 32. |
| `evidence:runtime-observed-proof-f35ad10d58e78f706472` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-dfbddc4b-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 33. |
| `evidence:runtime-observed-proof-8334f266872888104b99` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ca9f9831-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: APPLY_VERIFIED closeout validation failure immediately rolls back and verifies preimages; source line 34. |
| `evidence:runtime-observed-proof-2f1ef66de8193e76b0d7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ca9f9831-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: APPLY_VERIFIED closeout validation failure immediately rolls back and verifies preimages; source line 35. |
| `evidence:runtime-observed-proof-ccdd3973f99579ce0871` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-8dca8d52-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 36. |
| `evidence:runtime-observed-proof-fe13b0776a5072041518` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-8dca8d52-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 37. |
| `evidence:runtime-observed-proof-edb603d611fd2c24111a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0ad03c62-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 38. |
| `evidence:runtime-observed-proof-9224923404b1e9c419da` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0ad03c62-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 39. |
| `evidence:runtime-observed-proof-f1c4f3cace43d0369237` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-88185f96-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 40. |
| `evidence:runtime-observed-proof-f3e9165afcf29eeaf746` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-88185f96-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 41. |
| `evidence:runtime-observed-proof-4860f1de8b53fa03d53d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ab243239-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 42. |
| `evidence:runtime-observed-proof-35fbc3257d301eb08bc5` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ab243239-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 43. |
| `evidence:runtime-observed-proof-b148ef3434b436cfe39d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 44. |
| `evidence:runtime-observed-proof-f96ffbad9fe5a3b2ab18` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-eafe80a3-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 47. |
| `evidence:runtime-observed-proof-e30b2551f6e62bfbed96` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-eafe80a3-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 48. |
| `evidence:runtime-observed-proof-0b63b9889b2ef6fd5c0a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7bea42b3-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 adoption autopilot consumes one strict same-run chain for a light existing project; source line 49. |
| `evidence:runtime-observed-proof-f5599eedf4040fca1960` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7bea42b3-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 adoption autopilot consumes one strict same-run chain for a light existing project; source line 50. |
| `evidence:runtime-observed-proof-f975ce305d61772c6eec` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4cd77b0a-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 51. |
| `evidence:runtime-observed-proof-4b0c50ee113d27288791` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4cd77b0a-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 52. |
| `evidence:runtime-observed-proof-2173785350a6f0b314f1` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6f5a5aa3-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 53. |
| `evidence:runtime-observed-proof-a5760fef9ab5c045422a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6f5a5aa3-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 54. |
| `evidence:runtime-observed-proof-b6b5826c5fdd8f2c931a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-94a115a4-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 55. |
| `evidence:runtime-observed-proof-2b2b3e1c5f3edeb4f946` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-94a115a4-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 56. |
| `evidence:runtime-observed-proof-d42b506439b4d4899357` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4087f54e-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 57. |
| `evidence:runtime-observed-proof-95ff1721f8624293005c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4087f54e-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 58. |
| `evidence:runtime-observed-proof-92c5e5da6178a5e7afbd` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3ad67323-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: Work Queue and adoption assurance reject directory and .gitkeep presence as behavioral proof; source line 59. |
| `evidence:runtime-observed-proof-3f9345c1bcd57307f3fb` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3ad67323-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: Work Queue and adoption assurance reject directory and .gitkeep presence as behavioral proof; source line 60. |
| `evidence:runtime-observed-proof-d010745db5d8d545913c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-95d747e1-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 61. |
| `evidence:runtime-observed-proof-99d37b0b1286bc3c4d09` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-95d747e1-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 62. |
| `evidence:runtime-observed-proof-8980188c02eb14d474a7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-00218482-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 current-work discovery covers root TODO, sessions, plans, and conflicting current items; source line 63. |
| `evidence:runtime-observed-proof-ddaa21660beb0a3fbd3a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-00218482-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 current-work discovery covers root TODO, sessions, plans, and conflicting current items; source line 64. |
| `evidence:runtime-observed-proof-15f0e695656112a6709b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: generated project cold-starts from its own cwd and exercises the strict operating route; source line 65. |
| `evidence:runtime-observed-proof-d26e334b606f401e6998` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: generated project cold-starts from its own cwd and exercises the strict operating route; source line 66. |
| `evidence:runtime-observed-proof-5cd32e40ab23febb8808` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:permission-risk-permission-boundary-test-role-tenant-visibility-` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound authority rejects business code and a fabricated legacy-agent bridge; source line 67. |
| `evidence:runtime-observed-proof-71e9478b1857421f706c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-72c3bacf-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 70. |
| `evidence:runtime-observed-proof-28b19645238bb12d890c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-72c3bacf-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 71. |
| `evidence:runtime-observed-proof-d0cc5c9944cc7d2c807a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a0707b63-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 72. |
| `evidence:runtime-observed-proof-af8fd0a42b819b80bfec` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a0707b63-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 73. |
| `evidence:runtime-observed-proof-8c09e4a32a51b35b459a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a4833a0b-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: baseline planning augments explicit packs to complete environment and profile coverage; source line 74. |
| `evidence:runtime-observed-proof-6eb9dd28445c0326431e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a4833a0b-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: baseline planning augments explicit packs to complete environment and profile coverage; source line 75. |
| `evidence:runtime-observed-proof-e802dcc289e132e40e12` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-8331c5ae-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: every supported starter reaches verified project-entry activation; source line 76. |
| `evidence:runtime-observed-proof-3c30a2985a8d93e0bcab` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-8331c5ae-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: every supported starter reaches verified project-entry activation; source line 77. |
| `evidence:runtime-observed-proof-92ba013345d8040dca61` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-aa4f5177-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 78. |
| `evidence:runtime-observed-proof-59cdbddf283fd5b630f8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-aa4f5177-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 79. |
| `evidence:runtime-observed-proof-c823cdea88fa4af40566` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d36e2a76-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 80. |
| `evidence:runtime-observed-proof-8c574af00e0f954ec50e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d36e2a76-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 81. |
| `evidence:runtime-observed-proof-87d2206f5f2600607b75` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-610c7460-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: project evidence failures and truncation are visible and block baseline selection; source line 82. |
| `evidence:runtime-observed-proof-bb25e4dc2ea9320c7697` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-610c7460-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: project evidence failures and truncation are visible and block baseline selection; source line 83. |
| `evidence:runtime-observed-proof-8df41319df67914204df` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9a3804d1-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 84. |
| `evidence:runtime-observed-proof-53d29a4d628a76271718` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9a3804d1-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 85. |
| `evidence:runtime-observed-proof-eac072ac8b9eae2ec23d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-48f98d4e-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: installed and source-side baseline checks resolve the same target authority; source line 86. |
| `evidence:runtime-observed-proof-70ef617455bcfae0a28d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-48f98d4e-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: installed and source-side baseline checks resolve the same target authority; source line 87. |
| `evidence:runtime-observed-proof-7f0c5c6bb085a65f111d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9a1bf08b-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 90. |
| `evidence:runtime-observed-proof-bb50c4ecb5f7e25c0ef5` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-9a1bf08b-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 91. |
| `evidence:runtime-observed-proof-58148528bd5f19acbec5` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-e710bac0-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 92. |
| `evidence:runtime-observed-proof-6907d4866fd55251d774` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-e710bac0-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 93. |
| `evidence:runtime-observed-proof-aac2aa9e64d8e7f7cb2b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-66ba9a71-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 94. |
| `evidence:runtime-observed-proof-39136aaeda352ca3b735` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-66ba9a71-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 95. |
| `evidence:runtime-observed-proof-810b48dce7d8633a9b07` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-211b9347-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 96. |
| `evidence:runtime-observed-proof-c4ca0ab07e57c7d22845` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-211b9347-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 97. |
| `evidence:runtime-observed-proof-d47aad523ecd783d6d21` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3e9d296e-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 98. |
| `evidence:runtime-observed-proof-656451ddc299516dce8e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3e9d296e-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 99. |
| `evidence:runtime-observed-proof-9fa616c6cec460911de9` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4ea05a71-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 100. |
| `evidence:runtime-observed-proof-cc05756610bf1db467d9` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4ea05a71-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 101. |
| `evidence:runtime-observed-proof-ab91d0618b13ef6a3370` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0a935c21-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 102. |
| `evidence:runtime-observed-proof-e2fb371649c718d36724` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0a935c21-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 103. |
| `evidence:runtime-observed-proof-c4eb0decb3641804e9ad` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ce319ca9-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 104. |
| `evidence:runtime-observed-proof-e60350b8fd876b797e41` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-ce319ca9-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 105. |
| `evidence:runtime-observed-proof-d5c1d68a1303d18779cc` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-010135e0-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 106. |
| `evidence:runtime-observed-proof-5c8a124f22acff53d6db` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-010135e0-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 107. |
| `evidence:runtime-observed-proof-c3d6ca0e45c758feb6c2` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:external-integration-integration-contract-check-external-integra` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 108. |
| `evidence:runtime-observed-proof-48ed1b17112a3b16f411` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 109. |
| `evidence:runtime-observed-proof-4cc879bdc03a4a0806f7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: workflow package scripts recursively expose provider deploys and explicit source_only stays blocked; source line 110. |
| `evidence:runtime-observed-proof-9187f4789c9ae85093c3` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7e9a2282-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 113. |
| `evidence:runtime-observed-proof-4a2a2eee3e24c74c9f07` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7e9a2282-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 114. |
| `evidence:runtime-observed-proof-d0acc800a043a82395f6` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-1a4fabb1-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 115. |
| `evidence:runtime-observed-proof-17a191a8897e431fcd40` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-1a4fabb1-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 116. |
| `evidence:runtime-observed-proof-d2aed395a5cab3ece861` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-68b60ab3-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 117. |
| `evidence:runtime-observed-proof-e0e03bd6ac210bc0e12b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-68b60ab3-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 118. |
| `evidence:runtime-observed-proof-8822f7d64673f93f3357` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6a0a12c4-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 119. |
| `evidence:runtime-observed-proof-5b09c598e2a84ae68c48` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6a0a12c4-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 120. |
| `evidence:runtime-observed-proof-f550d81ebbadc70d8c6e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3b1e8f43-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 121. |
| `evidence:runtime-observed-proof-5377ce7f954f4786e87f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3b1e8f43-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 122. |
| `evidence:runtime-observed-proof-0048a78db380a6e88507` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0adf81f2-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 123. |
| `evidence:runtime-observed-proof-9f7e78fa79b47d65c7e8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-0adf81f2-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 124. |
| `evidence:runtime-observed-proof-bf52e5684f98f0212b66` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-41c23483-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 125. |
| `evidence:runtime-observed-proof-c42b5bebc275c18c1b2f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-41c23483-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 126. |
| `evidence:runtime-observed-proof-17deaa486d338f89b68c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-06b86b13-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 127. |
| `evidence:runtime-observed-proof-45c5591317c87eaa9900` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-06b86b13-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 128. |
| `evidence:runtime-observed-proof-d88badb4a0d7fab4b4b8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d6fb92e1-expected` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 129. |
| `evidence:runtime-observed-proof-2e0b531b98eadbe88697` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d6fb92e1-negative` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 130. |
| `evidence:runtime-observed-proof-b3ac17bccd58b9edbed4` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2` | N/A | Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 131. |
| `evidence:runtime-observed-proof-fbf2cf85ce469dcbf04a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:f7e9d924d6f29b6bfb13bd6c8d70705d901dde75591f730900ac0699e3ebc064` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1. |
| `evidence:runtime-observed-proof-685454e4e714c7e21d88` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:f7e9d924d6f29b6bfb13bd6c8d70705d901dde75591f730900ac0699e3ebc064` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2. |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:universe-01b5deae-expected` | `COVERED` | `evidence:runtime-observed-proof-3fc5aaa23e066c8e1994` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-01b5deae-negative` | `COVERED` | `evidence:runtime-observed-proof-5cadef2a00608847e7cf` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-370c5a1e-expected` | `COVERED` | `evidence:runtime-observed-proof-05a05bd682cdbb448f30` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-370c5a1e-negative` | `COVERED` | `evidence:runtime-observed-proof-2acf82484cc9ddcb09fd` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9f9fa3e5-expected` | `COVERED` | `evidence:runtime-observed-proof-92576132a820c1eb89d1` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9f9fa3e5-negative` | `COVERED` | `evidence:runtime-observed-proof-6881eef83c5192f30c02` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d5cda5ec-expected` | `COVERED` | `evidence:runtime-observed-proof-12e660a0b2bab437d98d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d5cda5ec-negative` | `COVERED` | `evidence:runtime-observed-proof-b0b3be4334321fb59aba` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-909edc85-expected` | `COVERED` | `evidence:runtime-observed-proof-8bffc55a3dbbf4a12941` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-909edc85-negative` | `COVERED` | `evidence:runtime-observed-proof-b48ecc980cbb7fafa9b7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-868d4b91-expected` | `COVERED` | `evidence:runtime-observed-proof-306eb71a036de03dd2c9` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-868d4b91-negative` | `COVERED` | `evidence:runtime-observed-proof-25d0e2045daf4978aebd` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-133bfd71-expected` | `COVERED` | `evidence:runtime-observed-proof-542e9b57fa5f83ed987a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-133bfd71-negative` | `COVERED` | `evidence:runtime-observed-proof-88d9738aaaa5bee8451a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a238de93-expected` | `COVERED` | `evidence:runtime-observed-proof-eed60b399a77f4dc2fd6` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a238de93-negative` | `COVERED` | `evidence:runtime-observed-proof-680df53c1fa1b4221490` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-230f46e1-expected` | `COVERED` | `evidence:runtime-observed-proof-4acd6f564173acb0c2a3` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-230f46e1-negative` | `COVERED` | `evidence:runtime-observed-proof-2f2a3d79c71dba26fddf` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6a3c13eb-expected` | `COVERED` | `evidence:runtime-observed-proof-a8a10a53e69bc3d9e7cf` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6a3c13eb-negative` | `COVERED` | `evidence:runtime-observed-proof-34592ddbee403227ffb4` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-bb4f1e0b-expected` | `COVERED` | `evidence:runtime-observed-proof-763f9f83a993fb4eb691` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-bb4f1e0b-negative` | `COVERED` | `evidence:runtime-observed-proof-cdcf814424a18a82a904` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f7ab67ee-expected` | `COVERED` | `evidence:runtime-observed-proof-5085073f22b34e656152` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f7ab67ee-negative` | `COVERED` | `evidence:runtime-observed-proof-5612726a00a27a139bc0` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-dfbddc4b-expected` | `COVERED` | `evidence:runtime-observed-proof-9ab47b1f296ebff96f87` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-dfbddc4b-negative` | `COVERED` | `evidence:runtime-observed-proof-f35ad10d58e78f706472` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ca9f9831-expected` | `COVERED` | `evidence:runtime-observed-proof-8334f266872888104b99` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ca9f9831-negative` | `COVERED` | `evidence:runtime-observed-proof-2f1ef66de8193e76b0d7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-8dca8d52-expected` | `COVERED` | `evidence:runtime-observed-proof-ccdd3973f99579ce0871` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-8dca8d52-negative` | `COVERED` | `evidence:runtime-observed-proof-fe13b0776a5072041518` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0ad03c62-expected` | `COVERED` | `evidence:runtime-observed-proof-edb603d611fd2c24111a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0ad03c62-negative` | `COVERED` | `evidence:runtime-observed-proof-9224923404b1e9c419da` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-88185f96-expected` | `COVERED` | `evidence:runtime-observed-proof-f1c4f3cace43d0369237` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-88185f96-negative` | `COVERED` | `evidence:runtime-observed-proof-f3e9165afcf29eeaf746` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ab243239-expected` | `COVERED` | `evidence:runtime-observed-proof-4860f1de8b53fa03d53d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ab243239-negative` | `COVERED` | `evidence:runtime-observed-proof-35fbc3257d301eb08bc5` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-eafe80a3-expected` | `COVERED` | `evidence:runtime-observed-proof-f96ffbad9fe5a3b2ab18` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-eafe80a3-negative` | `COVERED` | `evidence:runtime-observed-proof-e30b2551f6e62bfbed96` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7bea42b3-expected` | `COVERED` | `evidence:runtime-observed-proof-0b63b9889b2ef6fd5c0a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7bea42b3-negative` | `COVERED` | `evidence:runtime-observed-proof-f5599eedf4040fca1960` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4cd77b0a-expected` | `COVERED` | `evidence:runtime-observed-proof-f975ce305d61772c6eec` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4cd77b0a-negative` | `COVERED` | `evidence:runtime-observed-proof-4b0c50ee113d27288791` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6f5a5aa3-expected` | `COVERED` | `evidence:runtime-observed-proof-2173785350a6f0b314f1` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6f5a5aa3-negative` | `COVERED` | `evidence:runtime-observed-proof-a5760fef9ab5c045422a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-94a115a4-expected` | `COVERED` | `evidence:runtime-observed-proof-b6b5826c5fdd8f2c931a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-94a115a4-negative` | `COVERED` | `evidence:runtime-observed-proof-2b2b3e1c5f3edeb4f946` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4087f54e-expected` | `COVERED` | `evidence:runtime-observed-proof-d42b506439b4d4899357` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4087f54e-negative` | `COVERED` | `evidence:runtime-observed-proof-95ff1721f8624293005c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3ad67323-expected` | `COVERED` | `evidence:runtime-observed-proof-92c5e5da6178a5e7afbd` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3ad67323-negative` | `COVERED` | `evidence:runtime-observed-proof-3f9345c1bcd57307f3fb` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-95d747e1-expected` | `COVERED` | `evidence:runtime-observed-proof-d010745db5d8d545913c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-95d747e1-negative` | `COVERED` | `evidence:runtime-observed-proof-99d37b0b1286bc3c4d09` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-00218482-expected` | `COVERED` | `evidence:runtime-observed-proof-8980188c02eb14d474a7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-00218482-negative` | `COVERED` | `evidence:runtime-observed-proof-ddaa21660beb0a3fbd3a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-72c3bacf-expected` | `COVERED` | `evidence:runtime-observed-proof-71e9478b1857421f706c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-72c3bacf-negative` | `COVERED` | `evidence:runtime-observed-proof-28b19645238bb12d890c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a0707b63-expected` | `COVERED` | `evidence:runtime-observed-proof-d0cc5c9944cc7d2c807a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a0707b63-negative` | `COVERED` | `evidence:runtime-observed-proof-af8fd0a42b819b80bfec` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a4833a0b-expected` | `COVERED` | `evidence:runtime-observed-proof-8c09e4a32a51b35b459a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a4833a0b-negative` | `COVERED` | `evidence:runtime-observed-proof-6eb9dd28445c0326431e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-8331c5ae-expected` | `COVERED` | `evidence:runtime-observed-proof-e802dcc289e132e40e12` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-8331c5ae-negative` | `COVERED` | `evidence:runtime-observed-proof-3c30a2985a8d93e0bcab` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-aa4f5177-expected` | `COVERED` | `evidence:runtime-observed-proof-92ba013345d8040dca61` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-aa4f5177-negative` | `COVERED` | `evidence:runtime-observed-proof-59cdbddf283fd5b630f8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d36e2a76-expected` | `COVERED` | `evidence:runtime-observed-proof-c823cdea88fa4af40566` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d36e2a76-negative` | `COVERED` | `evidence:runtime-observed-proof-8c574af00e0f954ec50e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-610c7460-expected` | `COVERED` | `evidence:runtime-observed-proof-87d2206f5f2600607b75` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-610c7460-negative` | `COVERED` | `evidence:runtime-observed-proof-bb25e4dc2ea9320c7697` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9a3804d1-expected` | `COVERED` | `evidence:runtime-observed-proof-8df41319df67914204df` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9a3804d1-negative` | `COVERED` | `evidence:runtime-observed-proof-53d29a4d628a76271718` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-48f98d4e-expected` | `COVERED` | `evidence:runtime-observed-proof-eac072ac8b9eae2ec23d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-48f98d4e-negative` | `COVERED` | `evidence:runtime-observed-proof-70ef617455bcfae0a28d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9a1bf08b-expected` | `COVERED` | `evidence:runtime-observed-proof-7f0c5c6bb085a65f111d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-9a1bf08b-negative` | `COVERED` | `evidence:runtime-observed-proof-bb50c4ecb5f7e25c0ef5` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-e710bac0-expected` | `COVERED` | `evidence:runtime-observed-proof-58148528bd5f19acbec5` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-e710bac0-negative` | `COVERED` | `evidence:runtime-observed-proof-6907d4866fd55251d774` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-66ba9a71-expected` | `COVERED` | `evidence:runtime-observed-proof-aac2aa9e64d8e7f7cb2b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-66ba9a71-negative` | `COVERED` | `evidence:runtime-observed-proof-39136aaeda352ca3b735` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-211b9347-expected` | `COVERED` | `evidence:runtime-observed-proof-810b48dce7d8633a9b07` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-211b9347-negative` | `COVERED` | `evidence:runtime-observed-proof-c4ca0ab07e57c7d22845` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3e9d296e-expected` | `COVERED` | `evidence:runtime-observed-proof-d47aad523ecd783d6d21` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3e9d296e-negative` | `COVERED` | `evidence:runtime-observed-proof-656451ddc299516dce8e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4ea05a71-expected` | `COVERED` | `evidence:runtime-observed-proof-9fa616c6cec460911de9` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4ea05a71-negative` | `COVERED` | `evidence:runtime-observed-proof-cc05756610bf1db467d9` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0a935c21-expected` | `COVERED` | `evidence:runtime-observed-proof-ab91d0618b13ef6a3370` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0a935c21-negative` | `COVERED` | `evidence:runtime-observed-proof-e2fb371649c718d36724` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ce319ca9-expected` | `COVERED` | `evidence:runtime-observed-proof-c4eb0decb3641804e9ad` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ce319ca9-negative` | `COVERED` | `evidence:runtime-observed-proof-e60350b8fd876b797e41` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-010135e0-expected` | `COVERED` | `evidence:runtime-observed-proof-d5c1d68a1303d18779cc` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-010135e0-negative` | `COVERED` | `evidence:runtime-observed-proof-5c8a124f22acff53d6db` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7e9a2282-expected` | `COVERED` | `evidence:runtime-observed-proof-9187f4789c9ae85093c3` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7e9a2282-negative` | `COVERED` | `evidence:runtime-observed-proof-4a2a2eee3e24c74c9f07` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-1a4fabb1-expected` | `COVERED` | `evidence:runtime-observed-proof-d0acc800a043a82395f6` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-1a4fabb1-negative` | `COVERED` | `evidence:runtime-observed-proof-17a191a8897e431fcd40` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-68b60ab3-expected` | `COVERED` | `evidence:runtime-observed-proof-d2aed395a5cab3ece861` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-68b60ab3-negative` | `COVERED` | `evidence:runtime-observed-proof-e0e03bd6ac210bc0e12b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6a0a12c4-expected` | `COVERED` | `evidence:runtime-observed-proof-8822f7d64673f93f3357` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6a0a12c4-negative` | `COVERED` | `evidence:runtime-observed-proof-5b09c598e2a84ae68c48` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3b1e8f43-expected` | `COVERED` | `evidence:runtime-observed-proof-f550d81ebbadc70d8c6e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3b1e8f43-negative` | `COVERED` | `evidence:runtime-observed-proof-5377ce7f954f4786e87f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0adf81f2-expected` | `COVERED` | `evidence:runtime-observed-proof-0048a78db380a6e88507` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-0adf81f2-negative` | `COVERED` | `evidence:runtime-observed-proof-9f7e78fa79b47d65c7e8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-41c23483-expected` | `COVERED` | `evidence:runtime-observed-proof-bf52e5684f98f0212b66` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-41c23483-negative` | `COVERED` | `evidence:runtime-observed-proof-c42b5bebc275c18c1b2f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-06b86b13-expected` | `COVERED` | `evidence:runtime-observed-proof-17deaa486d338f89b68c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-06b86b13-negative` | `COVERED` | `evidence:runtime-observed-proof-45c5591317c87eaa9900` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d6fb92e1-expected` | `COVERED` | `evidence:runtime-observed-proof-d88badb4a0d7fab4b4b8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d6fb92e1-negative` | `COVERED` | `evidence:runtime-observed-proof-2e0b531b98eadbe88697` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `COVERED` | `evidence:runtime-observed-proof-15f0e695656112a6709b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `COVERED` | `evidence:runtime-observed-proof-d26e334b606f401e6998` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:data-model-data-model-check-data-model-historical-records-migrat` | `COVERED` | `evidence:runtime-observed-proof-c51d43018edec5988125` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:permission-risk-permission-boundary-test-role-tenant-visibility-` | `COVERED` | `evidence:runtime-observed-proof-5cd32e40ab23febb8808` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `COVERED` | `evidence:runtime-observed-proof-48ed1b17112a3b16f411` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:background-work-integration-contract-check-scheduled-queued-retr` | `COVERED` | `evidence:runtime-observed-proof-4cc879bdc03a4a0806f7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:external-integration-integration-contract-check-external-integra` | `COVERED` | `evidence:runtime-observed-proof-c3d6ca0e45c758feb6c2` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `COVERED` | `evidence:runtime-observed-proof-fbf2cf85ce469dcbf04a`, `evidence:runtime-observed-proof-685454e4e714c7e21d88` | A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation. |
| `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `COVERED` | `evidence:runtime-observed-proof-b148ef3434b436cfe39d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `COVERED` | `evidence:runtime-observed-proof-b3ac17bccd58b9edbed4` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `COVERED` | `evidence:runtime-observed-proof-f9ac703f7411cabbf383` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:generated-test-review-required` | `TEST_COVERAGE` | `SATISFIED` | `runtime:self-current-obligation-evidence`, `evidence:runtime-observed-proof-f9ac703f7411cabbf383` | Evidence is mapped to related Verification Plan obligations. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:runtime-observed-proof-f9ac703f7411cabbf383` | Evidence is mapped to related Verification Plan obligations. |

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
  "test_evidence_digest": "sha256:a3de78e96245ca581cbc8e4dc2f34e2786de0eb44b3c2c7d8232a379ac5139e9",
  "verification_plan_ref": "artifact:verification-plans/113-cross-domain-trust-closure.md",
  "verification_plan_digest": "sha256:f31bb1fef6875d0dc81614d4cc9a407bd3ebc902f6449b48ef8d3c0aec8c748c",
  "verification_plan_state": "VERIFICATION_PLAN_READY",
  "source_systems": [
    {
      "name": "verification_plan",
      "status": "RECORDED",
      "ref": "artifact:verification-plans/113-cross-domain-trust-closure.md",
      "source_outcome": "VERIFICATION_PLAN_READY",
      "digest": "sha256:f31bb1fef6875d0dc81614d4cc9a407bd3ebc902f6449b48ef8d3c0aec8c748c"
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
      "digest": "sha256:72c8b436fa6fff5ab18875cd7eb640d50b5377e5d00fd1ef2fa111e8b6f35057"
    },
    {
      "name": "verification_run_manifest",
      "status": "RECORDED",
      "ref": "artifact:verification-run-manifests/113-cross-domain-trust-closure.md",
      "source_outcome": "RUNTIME_TRUST_COMPLETE",
      "digest": "sha256:fa1c7969e781349a55da46041c1d52db22e981efcd2b6f835fe31a3829514b1e"
    }
  ],
  "runtime_trust_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "run_manifest_ref": "artifact:verification-run-manifests/113-cross-domain-trust-closure.md",
    "run_manifest_digest": "sha256:fa1c7969e781349a55da46041c1d52db22e981efcd2b6f835fe31a3829514b1e",
    "run_id": "vrun-113-cross-domain-trust-r46",
    "task_ref": "task:17bb774d904e7e5418668f77f40440ad80a50edf32bc43c9a71860a2a8503b98",
    "intent_digest": "sha256:ffe295876d2af0c000da0c80666b673afdbbd82ecd18dd77919641947306594d",
    "runtime_trust_level": "ISOLATED_RUNTIME",
    "runtime_plan_ref": "artifact:verification-runtime-plans/113-cross-domain-trust-closure.md",
    "runtime_plan_digest": "sha256:f538ed1c0a8c46257b3dbb579a0835a2cdc1ab690b494920b31a87cfeba13ad6",
    "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/113-cross-domain-trust-closure.md",
    "lifecycle_plan_digest": "sha256:2594b8cfa01c3e4083a0c044b1e05f6c865522342fd5574afe030b27188b0e52",
    "verification_plan_ref": "artifact:verification-plans/113-cross-domain-trust-closure.md",
    "verification_plan_digest": "sha256:f31bb1fef6875d0dc81614d4cc9a407bd3ebc902f6449b48ef8d3c0aec8c748c",
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
    "report_digest": "sha256:72c8b436fa6fff5ab18875cd7eb640d50b5377e5d00fd1ef2fa111e8b6f35057",
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
        "raw_file_digest": "sha256:5a45bba416cdb856d442e112095c694b48f4c5da0433ead74a07a256c8b0555a"
      },
      {
        "ref": "artifact:business-rule-closures/113-cross-domain-trust-closure.md",
        "relative_path": "business-rule-closures/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:851bbfdfe58ac98d2063d3e86527683697c5e060137de21dc10055c47959a472"
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
        "raw_file_digest": "sha256:b278df498daa961b0b76f209dcfd33cc632b33ddd8df964dca30c08f8cc0ee63"
      },
      {
        "ref": "artifact:verification-run-manifests/113-cross-domain-trust-closure.md",
        "relative_path": "verification-run-manifests/113-cross-domain-trust-closure.md",
        "raw_file_digest": "sha256:7ca974b7011573adae4a3dcc4023408db50deda9cfe2266fd939f29a3cda8b46"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:db00ba10b86b4fd4d8818661ded684e4577dd51ecc46b76f371a17805b8efca1"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:8337923abcf7495a8304d1642a158a91a0b79ec8804eb278d7c993525e2baf33"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:5095a04d9e0843b29f37d03187f8d9e957b49dfeaef89d414c17d2144e462f3a"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:f7e9d924d6f29b6bfb13bd6c8d70705d901dde75591f730900ac0699e3ebc064"
      }
    ]
  },
  "test_evidence_state": "TEST_EVIDENCE_COMPLETE",
  "evidence_items": [
    {
      "id": "runtime:self-runtime-negative",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-negative.log",
      "command": "node scripts/verification-runtime-self-service.mjs negative",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T04:45:52.718Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:db00ba10b86b4fd4d8818661ded684e4577dd51ecc46b76f371a17805b8efca1",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-runtime-positive",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-runtime-positive.log",
      "command": "node scripts/verification-runtime-self-service.mjs positive",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T04:45:52.756Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:8337923abcf7495a8304d1642a158a91a0b79ec8804eb278d7c993525e2baf33",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-candidate-verification",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-candidate-verification.log",
      "command": "npm run verify:pre-runtime",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:03:41.393Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:5095a04d9e0843b29f37d03187f8d9e957b49dfeaef89d414c17d2144e462f3a",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-obligation-evidence",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
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
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-runtime-behavior",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.727Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:f7e9d924d6f29b6bfb13bd6c8d70705d901dde75591f730900ac0699e3ebc064",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "evidence:runtime-observed-proof-3fc5aaa23e066c8e1994",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-01b5deae-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/task-obligation-hardcut.test.mjs :: 1.113 Work Queue takeover ignores fixtures and accepts one governed current task in a dirty worktree; source line 4."
    },
    {
      "id": "evidence:runtime-observed-proof-5cadef2a00608847e7cf",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-01b5deae-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/task-obligation-hardcut.test.mjs :: 1.113 Work Queue takeover ignores fixtures and accepts one governed current task in a dirty worktree; source line 5."
    },
    {
      "id": "evidence:runtime-observed-proof-05a05bd682cdbb448f30",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-370c5a1e-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 6."
    },
    {
      "id": "evidence:runtime-observed-proof-2acf82484cc9ddcb09fd",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-370c5a1e-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 7."
    },
    {
      "id": "evidence:runtime-observed-proof-92576132a820c1eb89d1",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9f9fa3e5-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 8."
    },
    {
      "id": "evidence:runtime-observed-proof-6881eef83c5192f30c02",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9f9fa3e5-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 9."
    },
    {
      "id": "evidence:runtime-observed-proof-12e660a0b2bab437d98d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d5cda5ec-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 10."
    },
    {
      "id": "evidence:runtime-observed-proof-b0b3be4334321fb59aba",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d5cda5ec-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: actual diff authority rejects empty feature, omitted untracked, and forged file sets; source line 11."
    },
    {
      "id": "evidence:runtime-observed-proof-8bffc55a3dbbf4a12941",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-909edc85-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 12."
    },
    {
      "id": "evidence:runtime-observed-proof-b48ecc980cbb7fafa9b7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-909edc85-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 13."
    },
    {
      "id": "evidence:runtime-observed-proof-306eb71a036de03dd2c9",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-868d4b91-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 14."
    },
    {
      "id": "evidence:runtime-observed-proof-25d0e2045daf4978aebd",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-868d4b91-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 15."
    },
    {
      "id": "evidence:runtime-observed-proof-542e9b57fa5f83ed987a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-133bfd71-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 16."
    },
    {
      "id": "evidence:runtime-observed-proof-88d9738aaaa5bee8451a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-133bfd71-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: 1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims; source line 17."
    },
    {
      "id": "evidence:runtime-observed-proof-eed60b399a77f4dc2fd6",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a238de93-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 18."
    },
    {
      "id": "evidence:runtime-observed-proof-680df53c1fa1b4221490",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a238de93-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 19."
    },
    {
      "id": "evidence:runtime-observed-proof-4acd6f564173acb0c2a3",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-230f46e1-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 20."
    },
    {
      "id": "evidence:runtime-observed-proof-2f2a3d79c71dba26fddf",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-230f46e1-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/current-trust-fixture.test.mjs :: current strict trust fixture reaches Completion only through current task evidence; source line 21."
    },
    {
      "id": "evidence:runtime-observed-proof-c51d43018edec5988125",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:data-model-data-model-check-data-model-historical-records-migrat"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/typed-consumer-contract.test.mjs :: 1.113 historical completion evidence is readable but cannot satisfy current readiness; source line 22."
    },
    {
      "id": "evidence:runtime-observed-proof-f9ac703f7411cabbf383",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/typed-consumer-contract.test.mjs :: 1.113 evidence authority binds an exact item inside a file-backed artifact; source line 23."
    },
    {
      "id": "evidence:runtime-observed-proof-a8a10a53e69bc3d9e7cf",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6a3c13eb-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound local authority accepts an exact reversible existing-project adoption graph; source line 26."
    },
    {
      "id": "evidence:runtime-observed-proof-34592ddbee403227ffb4",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6a3c13eb-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound local authority accepts an exact reversible existing-project adoption graph; source line 27."
    },
    {
      "id": "evidence:runtime-observed-proof-763f9f83a993fb4eb691",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-bb4f1e0b-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a target lock prevents two controlled applies from starting concurrently; source line 28."
    },
    {
      "id": "evidence:runtime-observed-proof-cdcf814424a18a82a904",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-bb4f1e0b-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a target lock prevents two controlled applies from starting concurrently; source line 29."
    },
    {
      "id": "evidence:runtime-observed-proof-5085073f22b34e656152",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f7ab67ee-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 30."
    },
    {
      "id": "evidence:runtime-observed-proof-5612726a00a27a139bc0",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f7ab67ee-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 31."
    },
    {
      "id": "evidence:runtime-observed-proof-9ab47b1f296ebff96f87",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-dfbddc4b-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 32."
    },
    {
      "id": "evidence:runtime-observed-proof-f35ad10d58e78f706472",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-dfbddc4b-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: a predeclared action graph safely recovers a partially attempted batch; source line 33."
    },
    {
      "id": "evidence:runtime-observed-proof-8334f266872888104b99",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ca9f9831-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: APPLY_VERIFIED closeout validation failure immediately rolls back and verifies preimages; source line 34."
    },
    {
      "id": "evidence:runtime-observed-proof-2f1ef66de8193e76b0d7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ca9f9831-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: APPLY_VERIFIED closeout validation failure immediately rolls back and verifies preimages; source line 35."
    },
    {
      "id": "evidence:runtime-observed-proof-ccdd3973f99579ce0871",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-8dca8d52-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 36."
    },
    {
      "id": "evidence:runtime-observed-proof-fe13b0776a5072041518",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-8dca8d52-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 37."
    },
    {
      "id": "evidence:runtime-observed-proof-edb603d611fd2c24111a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0ad03c62-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 38."
    },
    {
      "id": "evidence:runtime-observed-proof-9224923404b1e9c419da",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0ad03c62-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 39."
    },
    {
      "id": "evidence:runtime-observed-proof-f1c4f3cace43d0369237",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-88185f96-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 40."
    },
    {
      "id": "evidence:runtime-observed-proof-f3e9165afcf29eeaf746",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-88185f96-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 41."
    },
    {
      "id": "evidence:runtime-observed-proof-4860f1de8b53fa03d53d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ab243239-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 42."
    },
    {
      "id": "evidence:runtime-observed-proof-35fbc3257d301eb08bc5",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ab243239-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: receipt writing refuses to overwrite an external change made after transaction start; source line 43."
    },
    {
      "id": "evidence:runtime-observed-proof-b148ef3434b436cfe39d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/controlled-apply-transaction.test.mjs :: hard process interruption restores every journaled target and the prior receipt; source line 44."
    },
    {
      "id": "evidence:runtime-observed-proof-f96ffbad9fe5a3b2ab18",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-eafe80a3-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 47."
    },
    {
      "id": "evidence:runtime-observed-proof-e30b2551f6e62bfbed96",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-eafe80a3-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 48."
    },
    {
      "id": "evidence:runtime-observed-proof-0b63b9889b2ef6fd5c0a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7bea42b3-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 adoption autopilot consumes one strict same-run chain for a light existing project; source line 49."
    },
    {
      "id": "evidence:runtime-observed-proof-f5599eedf4040fca1960",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7bea42b3-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 adoption autopilot consumes one strict same-run chain for a light existing project; source line 50."
    },
    {
      "id": "evidence:runtime-observed-proof-f975ce305d61772c6eec",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4cd77b0a-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 51."
    },
    {
      "id": "evidence:runtime-observed-proof-4b0c50ee113d27288791",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4cd77b0a-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 52."
    },
    {
      "id": "evidence:runtime-observed-proof-2173785350a6f0b314f1",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6f5a5aa3-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 53."
    },
    {
      "id": "evidence:runtime-observed-proof-a5760fef9ab5c045422a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6f5a5aa3-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 54."
    },
    {
      "id": "evidence:runtime-observed-proof-b6b5826c5fdd8f2c931a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-94a115a4-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 55."
    },
    {
      "id": "evidence:runtime-observed-proof-2b2b3e1c5f3edeb4f946",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-94a115a4-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: a governed Work Queue takeover requires one durable CURRENT and survives a fresh process; source line 56."
    },
    {
      "id": "evidence:runtime-observed-proof-d42b506439b4d4899357",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4087f54e-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 57."
    },
    {
      "id": "evidence:runtime-observed-proof-95ff1721f8624293005c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4087f54e-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 58."
    },
    {
      "id": "evidence:runtime-observed-proof-92c5e5da6178a5e7afbd",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3ad67323-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: Work Queue and adoption assurance reject directory and .gitkeep presence as behavioral proof; source line 59."
    },
    {
      "id": "evidence:runtime-observed-proof-3f9345c1bcd57307f3fb",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3ad67323-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: Work Queue and adoption assurance reject directory and .gitkeep presence as behavioral proof; source line 60."
    },
    {
      "id": "evidence:runtime-observed-proof-d010745db5d8d545913c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-95d747e1-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 61."
    },
    {
      "id": "evidence:runtime-observed-proof-99d37b0b1286bc3c4d09",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-95d747e1-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/existing-adoption-activation-hardening.test.mjs :: all root and nested agent authorities participate in identity and semantic conflict checks; source line 62."
    },
    {
      "id": "evidence:runtime-observed-proof-8980188c02eb14d474a7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-00218482-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 current-work discovery covers root TODO, sessions, plans, and conflicting current items; source line 63."
    },
    {
      "id": "evidence:runtime-observed-proof-ddaa21660beb0a3fbd3a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-00218482-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-adoption-consumer-chain.test.mjs :: 1.109 current-work discovery covers root TODO, sessions, plans, and conflicting current items; source line 64."
    },
    {
      "id": "evidence:runtime-observed-proof-15f0e695656112a6709b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: generated project cold-starts from its own cwd and exercises the strict operating route; source line 65."
    },
    {
      "id": "evidence:runtime-observed-proof-d26e334b606f401e6998",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: generated project cold-starts from its own cwd and exercises the strict operating route; source line 66."
    },
    {
      "id": "evidence:runtime-observed-proof-5cd32e40ab23febb8808",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:permission-risk-permission-boundary-test-role-tenant-visibility-"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/request-bound-apply-authority.test.mjs :: request-bound authority rejects business code and a fabricated legacy-agent bridge; source line 67."
    },
    {
      "id": "evidence:runtime-observed-proof-71e9478b1857421f706c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-72c3bacf-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 70."
    },
    {
      "id": "evidence:runtime-observed-proof-28b19645238bb12d890c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-72c3bacf-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 71."
    },
    {
      "id": "evidence:runtime-observed-proof-d0cc5c9944cc7d2c807a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a0707b63-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 72."
    },
    {
      "id": "evidence:runtime-observed-proof-af8fd0a42b819b80bfec",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a0707b63-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 73."
    },
    {
      "id": "evidence:runtime-observed-proof-8c09e4a32a51b35b459a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a4833a0b-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: baseline planning augments explicit packs to complete environment and profile coverage; source line 74."
    },
    {
      "id": "evidence:runtime-observed-proof-6eb9dd28445c0326431e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a4833a0b-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: baseline planning augments explicit packs to complete environment and profile coverage; source line 75."
    },
    {
      "id": "evidence:runtime-observed-proof-e802dcc289e132e40e12",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-8331c5ae-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: every supported starter reaches verified project-entry activation; source line 76."
    },
    {
      "id": "evidence:runtime-observed-proof-3c30a2985a8d93e0bcab",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-8331c5ae-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: every supported starter reaches verified project-entry activation; source line 77."
    },
    {
      "id": "evidence:runtime-observed-proof-92ba013345d8040dca61",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-aa4f5177-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 78."
    },
    {
      "id": "evidence:runtime-observed-proof-59cdbddf283fd5b630f8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-aa4f5177-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 79."
    },
    {
      "id": "evidence:runtime-observed-proof-c823cdea88fa4af40566",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d36e2a76-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 80."
    },
    {
      "id": "evidence:runtime-observed-proof-8c574af00e0f954ec50e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d36e2a76-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/project-entry-generated-parity.test.mjs :: an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption; source line 81."
    },
    {
      "id": "evidence:runtime-observed-proof-87d2206f5f2600607b75",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-610c7460-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: project evidence failures and truncation are visible and block baseline selection; source line 82."
    },
    {
      "id": "evidence:runtime-observed-proof-bb25e4dc2ea9320c7697",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-610c7460-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: project evidence failures and truncation are visible and block baseline selection; source line 83."
    },
    {
      "id": "evidence:runtime-observed-proof-8df41319df67914204df",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9a3804d1-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 84."
    },
    {
      "id": "evidence:runtime-observed-proof-53d29a4d628a76271718",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9a3804d1-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 85."
    },
    {
      "id": "evidence:runtime-observed-proof-eac072ac8b9eae2ec23d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-48f98d4e-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: installed and source-side baseline checks resolve the same target authority; source line 86."
    },
    {
      "id": "evidence:runtime-observed-proof-70ef617455bcfae0a28d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-48f98d4e-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: installed and source-side baseline checks resolve the same target authority; source line 87."
    },
    {
      "id": "evidence:runtime-observed-proof-7f0c5c6bb085a65f111d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9a1bf08b-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 90."
    },
    {
      "id": "evidence:runtime-observed-proof-bb50c4ecb5f7e25c0ef5",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-9a1bf08b-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 91."
    },
    {
      "id": "evidence:runtime-observed-proof-58148528bd5f19acbec5",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-e710bac0-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 92."
    },
    {
      "id": "evidence:runtime-observed-proof-6907d4866fd55251d774",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-e710bac0-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 93."
    },
    {
      "id": "evidence:runtime-observed-proof-aac2aa9e64d8e7f7cb2b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-66ba9a71-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 94."
    },
    {
      "id": "evidence:runtime-observed-proof-39136aaeda352ca3b735",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-66ba9a71-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 95."
    },
    {
      "id": "evidence:runtime-observed-proof-810b48dce7d8633a9b07",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-211b9347-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 96."
    },
    {
      "id": "evidence:runtime-observed-proof-c4ca0ab07e57c7d22845",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-211b9347-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 97."
    },
    {
      "id": "evidence:runtime-observed-proof-d47aad523ecd783d6d21",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3e9d296e-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 98."
    },
    {
      "id": "evidence:runtime-observed-proof-656451ddc299516dce8e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3e9d296e-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 99."
    },
    {
      "id": "evidence:runtime-observed-proof-9fa616c6cec460911de9",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4ea05a71-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 100."
    },
    {
      "id": "evidence:runtime-observed-proof-cc05756610bf1db467d9",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4ea05a71-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 101."
    },
    {
      "id": "evidence:runtime-observed-proof-ab91d0618b13ef6a3370",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0a935c21-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 102."
    },
    {
      "id": "evidence:runtime-observed-proof-e2fb371649c718d36724",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0a935c21-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 103."
    },
    {
      "id": "evidence:runtime-observed-proof-c4eb0decb3641804e9ad",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ce319ca9-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 104."
    },
    {
      "id": "evidence:runtime-observed-proof-e60350b8fd876b797e41",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ce319ca9-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 105."
    },
    {
      "id": "evidence:runtime-observed-proof-d5c1d68a1303d18779cc",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-010135e0-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 106."
    },
    {
      "id": "evidence:runtime-observed-proof-5c8a124f22acff53d6db",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-010135e0-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: strict topology source accepts current evidence and rejects copied evidence; source line 107."
    },
    {
      "id": "evidence:runtime-observed-proof-c3d6ca0e45c758feb6c2",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:external-integration-integration-contract-check-external-integra"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 108."
    },
    {
      "id": "evidence:runtime-observed-proof-48ed1b17112a3b16f411",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-trust-boundary.test.mjs :: structured release acceptance binds a candidate and rejects prose-only acceptance; source line 109."
    },
    {
      "id": "evidence:runtime-observed-proof-4cc879bdc03a4a0806f7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/release-topology-consumer.test.mjs :: workflow package scripts recursively expose provider deploys and explicit source_only stays blocked; source line 110."
    },
    {
      "id": "evidence:runtime-observed-proof-9187f4789c9ae85093c3",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7e9a2282-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 113."
    },
    {
      "id": "evidence:runtime-observed-proof-4a2a2eee3e24c74c9f07",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7e9a2282-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 114."
    },
    {
      "id": "evidence:runtime-observed-proof-d0acc800a043a82395f6",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-1a4fabb1-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 115."
    },
    {
      "id": "evidence:runtime-observed-proof-17a191a8897e431fcd40",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-1a4fabb1-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 116."
    },
    {
      "id": "evidence:runtime-observed-proof-d2aed395a5cab3ece861",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-68b60ab3-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 117."
    },
    {
      "id": "evidence:runtime-observed-proof-e0e03bd6ac210bc0e12b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-68b60ab3-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 118."
    },
    {
      "id": "evidence:runtime-observed-proof-8822f7d64673f93f3357",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6a0a12c4-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 119."
    },
    {
      "id": "evidence:runtime-observed-proof-5b09c598e2a84ae68c48",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6a0a12c4-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 120."
    },
    {
      "id": "evidence:runtime-observed-proof-f550d81ebbadc70d8c6e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3b1e8f43-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 121."
    },
    {
      "id": "evidence:runtime-observed-proof-5377ce7f954f4786e87f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3b1e8f43-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 122."
    },
    {
      "id": "evidence:runtime-observed-proof-0048a78db380a6e88507",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0adf81f2-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 123."
    },
    {
      "id": "evidence:runtime-observed-proof-9f7e78fa79b47d65c7e8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-0adf81f2-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/manifest-authority.test.mjs :: 1.113 manifest closes imported and runtime-script distribution dependencies; source line 124."
    },
    {
      "id": "evidence:runtime-observed-proof-bf52e5684f98f0212b66",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-41c23483-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 125."
    },
    {
      "id": "evidence:runtime-observed-proof-c42b5bebc275c18c1b2f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-41c23483-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 126."
    },
    {
      "id": "evidence:runtime-observed-proof-17deaa486d338f89b68c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-06b86b13-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 127."
    },
    {
      "id": "evidence:runtime-observed-proof-45c5591317c87eaa9900",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-06b86b13-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 128."
    },
    {
      "id": "evidence:runtime-observed-proof-d88badb4a0d7fab4b4b8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d6fb92e1-expected"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 129."
    },
    {
      "id": "evidence:runtime-observed-proof-2e0b531b98eadbe88697",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d6fb92e1-negative"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/active-guidance-distribution-closeout.test.mjs :: 1.107.1 generated Codex project passes the effective guidance authority scan; source line 130."
    },
    {
      "id": "evidence:runtime-observed-proof-b3ac17bccd58b9edbed4",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/113-task-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.445Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders"
      ],
      "output_digest": "sha256:6da8d4074059183dd7fa8bcbff8d2765cc63b7d7ba81b7bede4a99c9bdea4dc2",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-task-obligation-evidence.test.mjs; test name tests/execution-distribution-trust.test.mjs :: workflow entry consumes strict platform and industrial baseline states; source line 131."
    },
    {
      "id": "evidence:runtime-observed-proof-fbf2cf85ce469dcbf04a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.727Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:f7e9d924d6f29b6bfb13bd6c8d70705d901dde75591f730900ac0699e3ebc064",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-685454e4e714c7e21d88",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-113-cross-domain-trust-r46/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-21T05:10:40.727Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:f7e9d924d6f29b6bfb13bd6c8d70705d901dde75591f730900ac0699e3ebc064",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2."
    }
  ],
  "coverage_map": [
    {
      "obligation_id": "verify:universe-01b5deae-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-3fc5aaa23e066c8e1994"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-01b5deae-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5cadef2a00608847e7cf"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-370c5a1e-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-05a05bd682cdbb448f30"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-370c5a1e-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-2acf82484cc9ddcb09fd"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9f9fa3e5-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-92576132a820c1eb89d1"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9f9fa3e5-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6881eef83c5192f30c02"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d5cda5ec-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-12e660a0b2bab437d98d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d5cda5ec-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b0b3be4334321fb59aba"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-909edc85-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8bffc55a3dbbf4a12941"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-909edc85-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b48ecc980cbb7fafa9b7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-868d4b91-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-306eb71a036de03dd2c9"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-868d4b91-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-25d0e2045daf4978aebd"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-133bfd71-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-542e9b57fa5f83ed987a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-133bfd71-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-88d9738aaaa5bee8451a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a238de93-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-eed60b399a77f4dc2fd6"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a238de93-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-680df53c1fa1b4221490"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-230f46e1-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4acd6f564173acb0c2a3"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-230f46e1-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-2f2a3d79c71dba26fddf"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6a3c13eb-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a8a10a53e69bc3d9e7cf"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6a3c13eb-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-34592ddbee403227ffb4"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-bb4f1e0b-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-763f9f83a993fb4eb691"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-bb4f1e0b-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-cdcf814424a18a82a904"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f7ab67ee-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5085073f22b34e656152"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f7ab67ee-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5612726a00a27a139bc0"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-dfbddc4b-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9ab47b1f296ebff96f87"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-dfbddc4b-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f35ad10d58e78f706472"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ca9f9831-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8334f266872888104b99"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ca9f9831-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-2f1ef66de8193e76b0d7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-8dca8d52-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ccdd3973f99579ce0871"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-8dca8d52-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-fe13b0776a5072041518"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0ad03c62-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-edb603d611fd2c24111a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0ad03c62-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9224923404b1e9c419da"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-88185f96-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f1c4f3cace43d0369237"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-88185f96-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f3e9165afcf29eeaf746"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ab243239-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4860f1de8b53fa03d53d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ab243239-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-35fbc3257d301eb08bc5"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-eafe80a3-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f96ffbad9fe5a3b2ab18"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-eafe80a3-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e30b2551f6e62bfbed96"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7bea42b3-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0b63b9889b2ef6fd5c0a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7bea42b3-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f5599eedf4040fca1960"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4cd77b0a-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f975ce305d61772c6eec"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4cd77b0a-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4b0c50ee113d27288791"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6f5a5aa3-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-2173785350a6f0b314f1"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6f5a5aa3-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a5760fef9ab5c045422a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-94a115a4-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b6b5826c5fdd8f2c931a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-94a115a4-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-2b2b3e1c5f3edeb4f946"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4087f54e-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d42b506439b4d4899357"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4087f54e-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-95ff1721f8624293005c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3ad67323-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-92c5e5da6178a5e7afbd"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3ad67323-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-3f9345c1bcd57307f3fb"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-95d747e1-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d010745db5d8d545913c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-95d747e1-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-99d37b0b1286bc3c4d09"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-00218482-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8980188c02eb14d474a7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-00218482-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ddaa21660beb0a3fbd3a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-72c3bacf-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-71e9478b1857421f706c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-72c3bacf-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-28b19645238bb12d890c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a0707b63-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d0cc5c9944cc7d2c807a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a0707b63-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-af8fd0a42b819b80bfec"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a4833a0b-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8c09e4a32a51b35b459a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a4833a0b-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6eb9dd28445c0326431e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-8331c5ae-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e802dcc289e132e40e12"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-8331c5ae-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-3c30a2985a8d93e0bcab"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-aa4f5177-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-92ba013345d8040dca61"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-aa4f5177-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-59cdbddf283fd5b630f8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d36e2a76-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c823cdea88fa4af40566"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d36e2a76-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8c574af00e0f954ec50e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-610c7460-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-87d2206f5f2600607b75"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-610c7460-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-bb25e4dc2ea9320c7697"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9a3804d1-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8df41319df67914204df"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9a3804d1-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-53d29a4d628a76271718"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-48f98d4e-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-eac072ac8b9eae2ec23d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-48f98d4e-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-70ef617455bcfae0a28d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9a1bf08b-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7f0c5c6bb085a65f111d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-9a1bf08b-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-bb50c4ecb5f7e25c0ef5"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-e710bac0-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-58148528bd5f19acbec5"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-e710bac0-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6907d4866fd55251d774"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-66ba9a71-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-aac2aa9e64d8e7f7cb2b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-66ba9a71-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-39136aaeda352ca3b735"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-211b9347-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-810b48dce7d8633a9b07"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-211b9347-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c4ca0ab07e57c7d22845"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3e9d296e-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d47aad523ecd783d6d21"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3e9d296e-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-656451ddc299516dce8e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4ea05a71-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9fa616c6cec460911de9"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4ea05a71-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-cc05756610bf1db467d9"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0a935c21-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ab91d0618b13ef6a3370"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0a935c21-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e2fb371649c718d36724"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ce319ca9-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c4eb0decb3641804e9ad"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ce319ca9-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e60350b8fd876b797e41"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-010135e0-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d5c1d68a1303d18779cc"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-010135e0-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5c8a124f22acff53d6db"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7e9a2282-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9187f4789c9ae85093c3"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7e9a2282-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4a2a2eee3e24c74c9f07"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-1a4fabb1-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d0acc800a043a82395f6"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-1a4fabb1-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-17a191a8897e431fcd40"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-68b60ab3-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d2aed395a5cab3ece861"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-68b60ab3-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e0e03bd6ac210bc0e12b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6a0a12c4-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8822f7d64673f93f3357"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6a0a12c4-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5b09c598e2a84ae68c48"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3b1e8f43-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f550d81ebbadc70d8c6e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3b1e8f43-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5377ce7f954f4786e87f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0adf81f2-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0048a78db380a6e88507"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-0adf81f2-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9f7e78fa79b47d65c7e8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-41c23483-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-bf52e5684f98f0212b66"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-41c23483-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c42b5bebc275c18c1b2f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-06b86b13-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-17deaa486d338f89b68c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-06b86b13-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-45c5591317c87eaa9900"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d6fb92e1-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d88badb4a0d7fab4b4b8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d6fb92e1-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-2e0b531b98eadbe88697"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-15f0e695656112a6709b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d26e334b606f401e6998"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:data-model-data-model-check-data-model-historical-records-migrat",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c51d43018edec5988125"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:permission-risk-permission-boundary-test-role-tenant-visibility-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5cd32e40ab23febb8808"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-48ed1b17112a3b16f411"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:background-work-integration-contract-check-scheduled-queued-retr",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4cc879bdc03a4a0806f7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:external-integration-integration-contract-check-external-integra",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c3d6ca0e45c758feb6c2"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-fbf2cf85ce469dcbf04a",
        "evidence:runtime-observed-proof-685454e4e714c7e21d88"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation."
    },
    {
      "obligation_id": "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b148ef3434b436cfe39d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b3ac17bccd58b9edbed4"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f9ac703f7411cabbf383"
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
        "evidence:runtime-observed-proof-3fc5aaa23e066c8e1994",
        "evidence:runtime-observed-proof-5cadef2a00608847e7cf"
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
        "evidence:runtime-observed-proof-05a05bd682cdbb448f30",
        "evidence:runtime-observed-proof-2acf82484cc9ddcb09fd"
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
        "evidence:runtime-observed-proof-92576132a820c1eb89d1",
        "evidence:runtime-observed-proof-6881eef83c5192f30c02"
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
        "evidence:runtime-observed-proof-12e660a0b2bab437d98d",
        "evidence:runtime-observed-proof-b0b3be4334321fb59aba"
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
        "evidence:runtime-observed-proof-8bffc55a3dbbf4a12941",
        "evidence:runtime-observed-proof-b48ecc980cbb7fafa9b7"
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
        "evidence:runtime-observed-proof-306eb71a036de03dd2c9",
        "evidence:runtime-observed-proof-25d0e2045daf4978aebd"
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
        "evidence:runtime-observed-proof-542e9b57fa5f83ed987a",
        "evidence:runtime-observed-proof-88d9738aaaa5bee8451a"
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
        "evidence:runtime-observed-proof-eed60b399a77f4dc2fd6",
        "evidence:runtime-observed-proof-680df53c1fa1b4221490"
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
        "evidence:runtime-observed-proof-4acd6f564173acb0c2a3",
        "evidence:runtime-observed-proof-2f2a3d79c71dba26fddf"
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
        "evidence:runtime-observed-proof-a8a10a53e69bc3d9e7cf",
        "evidence:runtime-observed-proof-34592ddbee403227ffb4"
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
        "evidence:runtime-observed-proof-763f9f83a993fb4eb691",
        "evidence:runtime-observed-proof-cdcf814424a18a82a904"
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
        "evidence:runtime-observed-proof-5085073f22b34e656152",
        "evidence:runtime-observed-proof-5612726a00a27a139bc0"
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
        "evidence:runtime-observed-proof-9ab47b1f296ebff96f87",
        "evidence:runtime-observed-proof-f35ad10d58e78f706472"
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
        "evidence:runtime-observed-proof-8334f266872888104b99",
        "evidence:runtime-observed-proof-2f1ef66de8193e76b0d7"
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
        "evidence:runtime-observed-proof-ccdd3973f99579ce0871",
        "evidence:runtime-observed-proof-fe13b0776a5072041518"
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
        "evidence:runtime-observed-proof-edb603d611fd2c24111a",
        "evidence:runtime-observed-proof-9224923404b1e9c419da"
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
        "evidence:runtime-observed-proof-f1c4f3cace43d0369237",
        "evidence:runtime-observed-proof-f3e9165afcf29eeaf746"
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
        "evidence:runtime-observed-proof-4860f1de8b53fa03d53d",
        "evidence:runtime-observed-proof-35fbc3257d301eb08bc5"
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
        "evidence:runtime-observed-proof-f96ffbad9fe5a3b2ab18",
        "evidence:runtime-observed-proof-e30b2551f6e62bfbed96"
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
        "evidence:runtime-observed-proof-0b63b9889b2ef6fd5c0a",
        "evidence:runtime-observed-proof-f5599eedf4040fca1960"
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
        "evidence:runtime-observed-proof-f975ce305d61772c6eec",
        "evidence:runtime-observed-proof-4b0c50ee113d27288791"
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
        "evidence:runtime-observed-proof-2173785350a6f0b314f1",
        "evidence:runtime-observed-proof-a5760fef9ab5c045422a"
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
        "evidence:runtime-observed-proof-b6b5826c5fdd8f2c931a",
        "evidence:runtime-observed-proof-2b2b3e1c5f3edeb4f946"
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
        "evidence:runtime-observed-proof-d42b506439b4d4899357",
        "evidence:runtime-observed-proof-95ff1721f8624293005c"
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
        "evidence:runtime-observed-proof-92c5e5da6178a5e7afbd",
        "evidence:runtime-observed-proof-3f9345c1bcd57307f3fb"
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
        "evidence:runtime-observed-proof-d010745db5d8d545913c",
        "evidence:runtime-observed-proof-99d37b0b1286bc3c4d09"
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
        "evidence:runtime-observed-proof-8980188c02eb14d474a7",
        "evidence:runtime-observed-proof-ddaa21660beb0a3fbd3a"
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
        "evidence:runtime-observed-proof-71e9478b1857421f706c",
        "evidence:runtime-observed-proof-28b19645238bb12d890c"
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
        "evidence:runtime-observed-proof-d0cc5c9944cc7d2c807a",
        "evidence:runtime-observed-proof-af8fd0a42b819b80bfec"
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
        "evidence:runtime-observed-proof-8c09e4a32a51b35b459a",
        "evidence:runtime-observed-proof-6eb9dd28445c0326431e"
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
        "evidence:runtime-observed-proof-e802dcc289e132e40e12",
        "evidence:runtime-observed-proof-3c30a2985a8d93e0bcab"
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
        "evidence:runtime-observed-proof-92ba013345d8040dca61",
        "evidence:runtime-observed-proof-59cdbddf283fd5b630f8"
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
        "evidence:runtime-observed-proof-c823cdea88fa4af40566",
        "evidence:runtime-observed-proof-8c574af00e0f954ec50e"
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
        "evidence:runtime-observed-proof-87d2206f5f2600607b75",
        "evidence:runtime-observed-proof-bb25e4dc2ea9320c7697"
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
        "evidence:runtime-observed-proof-8df41319df67914204df",
        "evidence:runtime-observed-proof-53d29a4d628a76271718"
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
        "evidence:runtime-observed-proof-eac072ac8b9eae2ec23d",
        "evidence:runtime-observed-proof-70ef617455bcfae0a28d"
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
        "evidence:runtime-observed-proof-7f0c5c6bb085a65f111d",
        "evidence:runtime-observed-proof-bb50c4ecb5f7e25c0ef5"
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
        "evidence:runtime-observed-proof-58148528bd5f19acbec5",
        "evidence:runtime-observed-proof-6907d4866fd55251d774"
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
        "evidence:runtime-observed-proof-aac2aa9e64d8e7f7cb2b",
        "evidence:runtime-observed-proof-39136aaeda352ca3b735"
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
        "evidence:runtime-observed-proof-810b48dce7d8633a9b07",
        "evidence:runtime-observed-proof-c4ca0ab07e57c7d22845"
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
        "evidence:runtime-observed-proof-d47aad523ecd783d6d21",
        "evidence:runtime-observed-proof-656451ddc299516dce8e"
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
        "evidence:runtime-observed-proof-9fa616c6cec460911de9",
        "evidence:runtime-observed-proof-cc05756610bf1db467d9"
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
        "evidence:runtime-observed-proof-ab91d0618b13ef6a3370",
        "evidence:runtime-observed-proof-e2fb371649c718d36724"
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
        "evidence:runtime-observed-proof-c4eb0decb3641804e9ad",
        "evidence:runtime-observed-proof-e60350b8fd876b797e41"
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
        "evidence:runtime-observed-proof-d5c1d68a1303d18779cc",
        "evidence:runtime-observed-proof-5c8a124f22acff53d6db"
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
        "evidence:runtime-observed-proof-9187f4789c9ae85093c3",
        "evidence:runtime-observed-proof-4a2a2eee3e24c74c9f07"
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
        "evidence:runtime-observed-proof-d0acc800a043a82395f6",
        "evidence:runtime-observed-proof-17a191a8897e431fcd40"
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
        "evidence:runtime-observed-proof-d2aed395a5cab3ece861",
        "evidence:runtime-observed-proof-e0e03bd6ac210bc0e12b"
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
        "evidence:runtime-observed-proof-8822f7d64673f93f3357",
        "evidence:runtime-observed-proof-5b09c598e2a84ae68c48"
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
        "evidence:runtime-observed-proof-f550d81ebbadc70d8c6e",
        "evidence:runtime-observed-proof-5377ce7f954f4786e87f"
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
        "evidence:runtime-observed-proof-0048a78db380a6e88507",
        "evidence:runtime-observed-proof-9f7e78fa79b47d65c7e8"
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
        "evidence:runtime-observed-proof-bf52e5684f98f0212b66",
        "evidence:runtime-observed-proof-c42b5bebc275c18c1b2f"
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
        "evidence:runtime-observed-proof-17deaa486d338f89b68c",
        "evidence:runtime-observed-proof-45c5591317c87eaa9900"
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
        "evidence:runtime-observed-proof-d88badb4a0d7fab4b4b8",
        "evidence:runtime-observed-proof-2e0b531b98eadbe88697"
      ]
    }
  ],
  "test_quality_controls": [
    {
      "id": "control:generated-test-review-required",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "runtime:self-current-obligation-evidence",
        "evidence:runtime-observed-proof-f9ac703f7411cabbf383"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f9ac703f7411cabbf383"
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
