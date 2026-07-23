# Work Queue Takeover Report

This report reviews old project task sources and recommends whether IntentOS Work Queue should become the future task entry.

It does not authorize implementation.

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | 我检查到项目已有可用的任务体系。我会把它映射到 IntentOS Work Queue，不重复建立一套新队列。 |
| Task system class | `RELIABLE_EXISTING_TASK_SYSTEM` |
| Recommended action | `MAP_EXISTING_TASK_SYSTEM` |
| Future task authority | `PROJECT_NATIVE_MAPPED` |
| Current task intent | modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes |
| Current task intent digest | `sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e` |
| Can Codex write now | `No` |
| Can Codex execute tasks from old TODO directly | `No` |

## Source Inventory

| Source | Digest | Type | Status | Summary |
| --- | --- | --- | --- | --- |
| ai-logs/2026-06-27-baseline-guided-setup.md | sha256:fa32d6f1e9414032499f5c9130b988a9fceb8313e5f6698e63a662c29c3c1965 | ai_log | UNKNOWN | AI Log: 2026-06-27 Baseline Guided Setup |
| ai-logs/2026-06-27-docs-ia-migration-command.md | sha256:821a646e19b46d4c12494ac997eaba02c86c9ede281ef80671ab91429dfa616b | ai_log | STALE | AI Task Log: 2026-06-27-docs-ia-migration-command |
| ai-logs/2026-06-27-guided-adoption-entry.md | sha256:969f90882b7da693bcd857db2bf03c7e33331134e632dcdffa7e7b5c670deec3 | ai_log | UNKNOWN | AI Log: Guided Adoption Entry |
| ai-logs/2026-06-27-guided-delivery-baseline.md | sha256:bda2e1b01349e3abcc0c17037a5b0d3812a6a5bef9d6cb5d6460770aad55fd98 | ai_log | UNKNOWN | AI Log: Guided Delivery Baseline |
| ai-logs/2026-06-27-industrial-maturity-license-boundary.md | sha256:a2832fb21db0568cfa8cdc4576f0f331296edac33ed15cdaca7f8b49d262efb3 | ai_log | STALE | AI Task Log: 2026-06-27-industrial-maturity-license-boundary |
| ai-logs/2026-06-27-project-memory-context-governance.md | sha256:b261f943d3b869dd61a71abf4d26c3390a99797eec4a90781c7dd23e2d954ebd | ai_log | UNKNOWN | AI Log: Project Memory & Context Governance |
| ai-logs/2026-06-27-release-evidence-adoption-entry.md | sha256:4dc0089e3ff804855a5f34982e3ff576f9dde25631527c6b9f7192305a079768 | ai_log | STALE | AI Task Log: 2026-06-27-release-evidence-adoption-entry |
| checklists/debt-knowledge-handoff-review.md | sha256:52101b7cc93dc7d7bbe6ff1105aff911678a5188ca5fb37c5f61cb944804cf8d | handoff | UNKNOWN | Debt & Knowledge Handoff Review Checklist |
| checklists/release-handoff-pack-review.md | sha256:0032429f64e674b6d70a437ea54418e02fc94874f621797fed71bdf217aebe31 | handoff | UNKNOWN | Release Handoff Pack Review |
| core/debt-knowledge-handoff.md | sha256:1014516a6c13ade44293557d22d59b279edf6f2f29077319a1110ab89fbac09d | handoff | STALE | Debt & Knowledge Handoff |
| core/release-handoff-packs.md | sha256:2689c54def5a2d0bba2a14f2136e8d00d0e42eef20b241134b4775ec5715cdce | handoff | UNKNOWN | Release Handoff Packs |
| debt-handoff-reports/114-work-queue-state-transition-governance.md | sha256:9e731c8de087a738dde05610600976289f9839d7b82426c44294a2d8cecf5609 | handoff | STALE | Debt & Knowledge Handoff Report: 114-work-queue-state-transition-governance |
| decision-briefs/035-readonly-manifest.md | sha256:8f71c14028f3fbd99f2bb825aeb2ba2780281387facec8b55e2c8f4b5f848cb4 | other | UNKNOWN | Decision Brief: Read-only IntentOS Manifest |
| decision-briefs/036-cli-front-door.md | sha256:c3694d83c604f04ae43eff84b53833c1d84ca09beedcfca37bb7ad8bd67d1e42 | other | UNKNOWN | Decision Brief: CLI Front Door Distribution Boundary |
| decision-briefs/037-manifest-authoritative.md | sha256:84154140f44613b6ef0f0f933ef025f2d261fe80afc202f55d80309765decaf2 | other | UNKNOWN | Decision Brief: Manifest Authority Boundary |
| decision-briefs/038-init-update-safety.md | sha256:9f4a4c574811eb68c2b7e244bcd65f45994c03bb877fb71160c06cfcde0eeba6 | other | STALE | Decision Brief: Init/Update Safety Boundary |
| decision-briefs/039-artifact-frontmatter-schema.md | sha256:04cc801aaabd1ba61ca12425dd6e41d5aa7ef1d153833dd316189a3fc7e15307 | other | UNKNOWN | Decision Brief: Artifact Frontmatter Compatibility |
| decision-briefs/040-checker-library-refactor.md | sha256:1cb3efbaec00453362cef7d44208806448e62624c29bac5ac91a54b21037c400 | other | UNKNOWN | Decision Brief: Checker Library Refactor |
| decision-briefs/040-fixture-matrix-expansion.md | sha256:6f0bd9c22a786b484c278442d4c1a8786db3a580517ead61bda4b89b2069a675 | other | UNKNOWN | Decision Brief: Fixture Matrix Boundary |
| decision-briefs/041-industrial-maturity-license-boundary.md | sha256:505ed23674ac8548ae2aa4a8393bcbd756aca18246cd7437ce00f83f4a85e442 | other | UNKNOWN | Decision Brief: 041-industrial-maturity-license-boundary |
| decision-briefs/120-baseline-guided-setup-boundary.md | sha256:958eae8be5dab9f2a29c894dd6bb168093d37265c954904d0f9b8ee26680ad9b | other | UNKNOWN | Decision Brief 120: Baseline Guided Setup Boundary |
| decision-briefs/130-guided-delivery-baseline-boundary.md | sha256:b35add5efe3aaeae5de6d1e24a2935e7f2bbab37f20eb485a6c8048866305a42 | other | UNKNOWN | Decision Brief 130: Guided Delivery Baseline Boundary |
| decision-briefs/140-context-source-of-truth-boundary.md | sha256:e1c0a491e4036ba445cf2f26ec0d1214b51521df673c65e9db2f5bc52fe5708e | other | STALE | Decision Brief 140: Context Source-of-Truth Boundary |
| docs/debt-knowledge-handoff.md | sha256:525f37111ec536c95060bfb25ffaf8da84b0047f082fdc55068a88b930f90d21 | handoff | STALE | Debt & Knowledge Handoff |
| docs/release-handoff-packs.md | sha256:e763c1f088802800e80e314a8cea1e4690e86b6f8262ed2cb71c8d4ce9fef264 | handoff | UNKNOWN | Release Handoff Packs |
| docs/roadmaps/controlled-apply-execution-roadmap-1.40-1.42.md | sha256:5285c6d309489e04210b26f8c341ad5c812d12f63009d1e53c4bb2713cda9503 | roadmap | UNKNOWN | Controlled Apply Execution Roadmap: 1.40-1.42 |
| docs/roadmaps/delivery-governance-roadmap-1.26-1.29.md | sha256:194cc1f93c4155ee2a0323b10b5c5362b4d12caad058c4d2dc78f88cde29cf88 | roadmap | STALE | Delivery Governance Roadmap 1.26-1.29 |
| docs/roadmaps/delivery-readiness-and-drift-roadmap-1.4.1-1.6.md | sha256:85b505d34a0703893a5a4b260bdb2d89d1e754a33773b4932f2b459ec4bfc01e | roadmap | STALE | Delivery Readiness And Drift Roadmap 1.4.1 To 1.6 |
| docs/roadmaps/governance-hardening-roadmap.md | sha256:0593994f39ce013119bb0b1ec14e48bfcde6a05aa492cfaa3a477397f4ed3a3c | roadmap | STALE | Governance Hardening And Goal-Oriented Orchestration Roadmap |
| final-reports/034-baseline-freeze-self-ci.md | sha256:37ac260ed5972fb3d0f7f5910328f7a7cd614bb6113b1f30e1a6843f85d81b16 | other | STALE | Final Report: Baseline Freeze And Self CI |
| final-reports/035-readonly-manifest.md | sha256:2736085116613400664cb866fdc8e366498b215236120485e3fbff5055dac223 | other | STALE | Final Report: Read-only IntentOS Manifest |
| final-reports/036-cli-front-door.md | sha256:f5def07692c80e214fd56f91e782a3c19ce1f50ad80307bb5e43e1a1665ae0e5 | other | STALE | Final Report: CLI Front Door |
| final-reports/037-manifest-authoritative.md | sha256:4ea74a174f6e55870abb766840e7cb6491a317798d36cf1f31374da159aed505 | other | STALE | Final Report: Manifest Authoritative Asset Source |
| final-reports/038-init-update-safety.md | sha256:e42bbe574a8cb3602426aeb9c06390a7c06063894c89cbf2f2c18b1acda4ee2c | other | STALE | Final Report: Init/Update Safety |
| final-reports/039-artifact-frontmatter-schema.md | sha256:0bec2eaa72639c661aea349699dea2521ff4571567aafea4ec4c891f2360f629 | other | STALE | Final Report: Artifact Frontmatter + Schema |
| final-reports/040-checker-library-refactor.md | sha256:9358b5f672bd18d2a97fb929be265f95e3303ebab49c7495685b36b8090e0a61 | other | STALE | Final Report: Checker Library Refactor |
| final-reports/040-fixture-matrix-expansion.md | sha256:e7648d65dcc96a94e208e1b1667e1e4ea9fea0d7d5926678c3e6506322cc3727 | other | STALE | Final Report: Fixture Matrix Expansion |
| final-reports/041-industrial-maturity-license-boundary.md | sha256:e0f2bca4253d9a187b1b7a6fd68c93a6b3777cd0aa1b6aa5a0b2d28e3e4709bc | other | STALE | Final Report: 041-industrial-maturity-license-boundary |
| final-reports/042-docs-ia-migration-command.md | sha256:7b33f2a7dfa28dced2b0549dd88911f3abdfc0aba49ee9120bd7dafb18184886 | other | STALE | Final Report: 042-docs-ia-migration-command |
| final-reports/100-release-evidence-adoption-entry.md | sha256:ef9d2d9b6ee54e2ad228e126d3a939726d2f6b93565398479ddeefa1d840c55f | other | STALE | Final Report: 100-release-evidence-adoption-entry |
| final-reports/110-guided-adoption-entry.md | sha256:71a035aa568aa2085dbd95400f7ffbb9f02a93c2277a013d14e9f87cf4eb6d37 | other | STALE | Final Report: Guided Adoption Entry |
| final-reports/120-baseline-guided-setup.md | sha256:af270054ac4488ece25cd8a5a7c2a9e42b3bdfff390e0ba2ea7f1f32c3ffe4a6 | other | STALE | Final Report 120: Baseline Guided Setup |
| final-reports/130-guided-delivery-baseline.md | sha256:7a1a0acc03a24b60dfdf439da657c9b57eee8bdf0a91edb5b483793928658acb | other | STALE | Final Report 130: Guided Delivery Baseline |
| final-reports/140-project-memory-context-governance.md | sha256:a12a04a38719fcbaac4f9788afbcfec8e4453010e6a860623b5d194d5ebf68f3 | other | STALE | Final Report 140: Project Memory & Context Governance |
| final-reports/141-160-delivery-readiness-drift.md | sha256:e4095e1cd685cfd9b00b0c131d1edde14eccea440fbc3969e2344a3084be401a | other | STALE | Final Report: 1.4.1 To 1.6 Delivery Readiness And Drift |
| final-reports/170-first-delivery-walkthrough.md | sha256:cc4d09281975a50f45b0fca2ff207d82ff5e5927135ecdedf980a31f0629dc9e | other | STALE | Final Report: 1.7 First Delivery Walkthrough |
| final-reports/180-real-project-adoption-trial.md | sha256:9f6ec83f56f8202e1aafdce1c37e96891871753e98939ad109d9b75ad0a43651 | other | STALE | Final Report: 1.8 Real Project Read-only Adoption Trial |
| final-reports/181-real-adoption-calibration.md | sha256:75cfe503370f7374ed568dc2c0ff62b1640a0a36730470a44caf41d765d90110 | other | STALE | Final Report: 1.8.1 Real Adoption Calibration |
| final-reports/190-human-decision-summary.md | sha256:33d9827a8de06ba6e4a59f93a0fed8ca3c3c7a99eb4112f6a728839ca12f4d35 | other | STALE | Final Report: 1.9.0 Human Decision Summary |
| final-reports/200-guided-decision-delivery-loop.md | sha256:b7c824d15ddad310edcb7134be54cda59e400f0264b26112b22c2129125b3c15 | other | STALE | Final Report: 200-guided-decision-delivery-loop |
| final-reports/210-governance-hardening-drift-guard.md | sha256:2c7453eb4bb16e4590c01a3651d427414dd8860a7a6efd821c8c4ebdf2b47f2f | other | STALE | Final Report: 210-governance-hardening-drift-guard |
| final-reports/220-change-boundary-baseline-state.md | sha256:605cb47affc514642a4a2b6742f7a9ae5821341bebeee349c8c873008ff83b9c | other | STALE | Final Report: 220-change-boundary-baseline-state |
| final-reports/221-manifest-readme-fallback-sync.md | sha256:12f8304cc57ea014cbab9d7811cd5a1a7388ab55b5ab51bf251e745d350a8282 | other | STALE | Final Report: 221-manifest-readme-fallback-sync |
| final-reports/230-baseline-pack-system.md | sha256:c2086d27be86759be6c89d4325c0608d96ab26e774da4b1bbb905daac631e742 | other | STALE | Final Report: 230-baseline-pack-system |
| final-reports/240-standard-baseline-pack-registry.md | sha256:97110665d6b89993df6b53a6d9d8101f43226e00d60492851004f0d6b3c995da | other | STALE | Final Report: 240-standard-baseline-pack-registry |
| prompts/debt-handoff-agent.md | sha256:587a1d2116ecf1f8ae40f432cefcf72bcb05ea11581e547dab917ee8a3fca020 | handoff | UNKNOWN | Debt & Knowledge Handoff Agent Prompt |
| prompts/release-handoff-pack-agent.md | sha256:7efecb38d37278c63bc51f65822c592eab822e279045ece6f76ec7e4d4abfee3 | handoff | UNKNOWN | Release Handoff Pack Agent Prompt |
| release-recipes/backend-api-handoff.md | sha256:ac9873f3e362984c8cd83616e5b0d04ec225d81aba5c5751e5485bb6206b1c9c | handoff | UNKNOWN | Backend API Handoff Release Recipe |
| release-recipes/mini-program-review-handoff.md | sha256:ba7e56093ede50b1a2543125e952ff5028b2763a80417a7dd9a2988a6540a23e | handoff | UNKNOWN | Mini Program Review Handoff Release Recipe |
| tasks/034-baseline-freeze-self-ci.md | sha256:51fe650f6de0c78553526ed44a5ba15c077fdead9074195c3ad1b0dd52173006 | other | UNKNOWN | Task: Baseline Freeze And Self CI |
| tasks/035-readonly-manifest.md | sha256:9d5de748e0cd5a7524030dde45e7d25daad195bae82dc4bd0f2a2f262c763a0b | other | UNKNOWN | Task: Read-only IntentOS Manifest |
| tasks/036-cli-front-door.md | sha256:06f22ed9829d38b519be3c6b58e29777fd155239dfa8212f0849ca6741531046 | other | UNKNOWN | Task: CLI Front Door |
| tasks/037-manifest-authoritative.md | sha256:fcd91c254660c1af8e1d333798b02b70d5ddd79faaf79aff9fa4884519ae65b4 | other | UNKNOWN | Task: Manifest Authoritative Asset Source |
| tasks/038-init-update-safety.md | sha256:5290f117d7e28e93f9e8e676f721a29b83f9d7723a0dce6cecdd7c93aa82bc00 | other | STALE | Task: Init/Update Safety |
| tasks/039-artifact-frontmatter-schema.md | sha256:dc7a6b735ff25c24da6936d0013fae5fa44867d3b76977d96714611ae5b106aa | other | UNKNOWN | Task: Artifact Frontmatter + Schema |
| tasks/040-checker-library-refactor.md | sha256:fbbb39667f61da82cb17c2e5064aa77d02c14cc651d427d570be375af4bfbe6b | other | UNKNOWN | Task 040: Checker Library Refactor |
| tasks/040-fixture-matrix-expansion.md | sha256:c164426e026ed2b944a3ffe19bbf52c391d07b145446b70a2cb60cfd8cab06c2 | other | UNKNOWN | Task: Fixture Matrix Expansion |
| tasks/041-industrial-maturity-license-boundary.md | sha256:b9e21575079e00f0b87d6b0ce475b372850d52639be833e100c04ee358e28cc8 | other | STALE | Task 041: industrial maturity license boundary |
| tasks/042-docs-ia-migration-command.md | sha256:520ea498e6e100b85cb51c8dab23469ae58977c0b0fe249daa6b31831828b194 | other | STALE | Task 042: docs ia migration command |
| tasks/100-release-evidence-adoption-entry.md | sha256:232d2d204339da222d1b6f3edc0ecc625b50d6ded25184b0f7f05b5495078816 | other | STALE | Task 100: release evidence adoption entry |
| tasks/109-project-entry-adoption-trust-hardcut.md | sha256:61a2127adb6990f97f88674f046e70be70f22fec89bc750747b5fdbdc6844841 | other | UNKNOWN | Task 109: Project Entry And Behavior-Complete Adoption Trust Hardcut |
| tasks/110-guided-adoption-entry.md | sha256:012cf6061f12012fc4592b77b57dfaa5685e02c256a78a7da0d98da5afa01f42 | other | UNKNOWN | Task: Guided Adoption Entry |
| tasks/120-baseline-guided-setup.md | sha256:ad968c43ef3df459dac0df4000b2d679f6edfc79e78bf8d3dc54828527e9a1ba | other | UNKNOWN | Task 120: Baseline Guided Setup |
| tasks/130-guided-delivery-baseline.md | sha256:1ab559aeec0ca63a3b5e945c2c846d99cfcac76b5465e9a15c640abefb268827 | other | UNKNOWN | Task 130: Guided Delivery Baseline |
| tasks/140-project-memory-context-governance.md | sha256:c72dd242a8bf02cafe083383588f4c7aa5ff3fb1cfedee76bc8666ee13547c1a | other | UNKNOWN | Task 140: Project Memory & Context Governance |
| tasks/170-first-delivery-walkthrough.md | sha256:b582b199ff8707a9298f814b45d175736f779188c4a901648bca90900f403a0a | other | STALE | Task 170: First Delivery Walkthrough |
| tasks/180-real-project-adoption-trial.md | sha256:072dd0177f37ce87ca5f0cd87340f963474e76c0d205ada5edbb3d393d1b1c7b | other | STALE | Task 180: Real Project Read-only Adoption Trial |
| tasks/181-real-adoption-calibration.md | sha256:bd5a94056fafa1b2a0803998d2f75b046e2580851bc37aa627575b5a42c6973c | other | STALE | Task 181: Real Adoption Calibration |
| tasks/190-human-decision-summary.md | sha256:f50858d084a0b3afd0ef9bb38d466dd7a6a6050e19df599df8280bfd25676a0f | other | STALE | Task 190: Human Decision Summary |
| tasks/200-guided-decision-delivery-loop.md | sha256:050300194811189027cdb7915405a6ec9071790f702ad61fbf30b3f691761745 | other | UNKNOWN | Task 200: Guided Decision & Delivery Loop |
| tasks/210-governance-hardening-drift-guard.md | sha256:33cd4864a64137b06ec284620b254d4a994dd0f1cc97ebc68f6bae8e94755208 | other | UNKNOWN | Task: 210-governance-hardening-drift-guard |
| tasks/220-change-boundary-baseline-state.md | sha256:295e04a9b77975ae5b55eb179009351dc998030361d4c0005739f756724fb721 | other | UNKNOWN | Task: 220-change-boundary-baseline-state |
| tasks/221-manifest-readme-fallback-sync.md | sha256:4b577efa4adabf86c2890d6913db26c01ffaa1fe0a057b4c88e2bcb5bf9a2902 | other | UNKNOWN | Task: 221-manifest-readme-fallback-sync |
| tasks/230-baseline-pack-system.md | sha256:cc5756bc3c7c470dc5f83a79a15e664c58003e5865e56058385c816b09845112 | other | UNKNOWN | Task: 230-baseline-pack-system |
| tasks/240-standard-baseline-pack-registry.md | sha256:504f5d35768dffd91563c63b7d7d2a7e6f50d23e271c5dc48346fc322b3a4136 | other | UNKNOWN | Task 240: Standard Baseline Pack Registry |
| templates/customer-handoff.md | sha256:efa137e38e29eb229cf083bff7342b2efedcbcc044d3377445f94ba54179b1a3 | handoff | UNKNOWN | Customer Handoff Summary: <name> |
| templates/debt-knowledge-handoff-report.md | sha256:288a7cae7f933bf4044f1d1c49f05e3c1581e0a7921d881719d96892b0696905 | handoff | UNKNOWN | Debt & Knowledge Handoff Report |
| templates/follow-up-proposal.md | sha256:9623e52427c2c64ce3addcb607b9b97b014d19c44eb73e9a4f5c7cc602ab5768 | other | UNKNOWN | Follow-up Proposal: <name> |
| templates/release-handoff-pack.md | sha256:bf85e933ec72746a293564443d46c6d42534175b9b3f430ed11f421cf236aa4b | handoff | UNKNOWN | Release Handoff Pack: <pack-id> |
| work-queue/109-project-entry-adoption-trust-hardcut.md#109 | sha256:962fe2e0a1289357a7efb259ed0336bde2b392f120dbb12ad0b05e09ba5bf3df | work_queue | STALE | Project Entry And Behavior-Complete Adoption Trust Hardcut |
| work-queue/109-project-entry-adoption-trust-hardcut.md#110 | sha256:8a35387abd2b05399e5e5c1edc6841a2bc556732cd7c010bca2db140ee8cefd7 | work_queue | STALE | Control Effectiveness |
| work-queue/113-cross-domain-trust-closure.md#WQ-001 | sha256:bc8218d395b58978959361ba5cee250467a6fb0fb6dfedf99137c896cbfb11f2 | work_queue | STALE | IntentOS 1.113 cross-domain trust closure |
| work-queue/114-check-intentos-modularity.md#WQ-114-CHECK-INTENTOS-MODULARITY | sha256:ae5c508032628da46bec46969e6659031e2acd55d74e7e4c28e186150a84d6ee | work_queue | STALE | Modularize the IntentOS self-check entry |
| work-queue/114-work-queue-state-transition-governance.md#WQ-114-TRANSITION | sha256:d6834044edd188e410dee930dcfc80452f0a9cd634e414af332234f0cf149664 | work_queue | STALE | Append-only Work Queue state transition governance |
| work-queue/115-init-project-modularity.md#WQ-115-INIT-PROJECT-MODULARITY | sha256:919821214dfb87553da0f87caff47f421c8362c16e4faedd7522885b115d8009 | work_queue | STALE | Modularize the IntentOS project initialization entry |
| work-queue/116-new-workflow-item-modularity.md#WQ-116-NEW-WORKFLOW-ITEM-MODULARITY | sha256:ce303366fdf103c5b35da1bf675e0d300447dec27294f416b05bb05c2c00b244 | work_queue | CURRENT | Modularize the IntentOS workflow-item generator |

## Reliability Assessment

| Criterion | Result | Reason |
| --- | --- | --- |
| One current task | Yes | Existing queue source found. |
| Stable task ids | Yes | Work Queue source can provide task ids. |
| Task states | Yes | Queue states are available. |
| Owners or source owners | Yes | Owner evidence must be preserved or added during migration. |
| Resume checkpoints | Yes | Paused work needs resume review before execution. |
| Verification or close-out evidence | Yes | Completion evidence must be checked before done claims. |
| No uncontrolled duplication | Unknown | Messy sources may contain duplicates; takeover must classify each item. |

## Migration Dispositions

| Source Item | Source Digest | Disposition | Target Queue State | Reason |
| --- | --- | --- | --- | --- |
| ai-logs/2026-06-27-baseline-guided-setup.md | sha256:fa32d6f1e9414032499f5c9130b988a9fceb8313e5f6698e63a662c29c3c1965 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| ai-logs/2026-06-27-docs-ia-migration-command.md | sha256:821a646e19b46d4c12494ac997eaba02c86c9ede281ef80671ab91429dfa616b | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| ai-logs/2026-06-27-guided-adoption-entry.md | sha256:969f90882b7da693bcd857db2bf03c7e33331134e632dcdffa7e7b5c670deec3 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| ai-logs/2026-06-27-guided-delivery-baseline.md | sha256:bda2e1b01349e3abcc0c17037a5b0d3812a6a5bef9d6cb5d6460770aad55fd98 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| ai-logs/2026-06-27-industrial-maturity-license-boundary.md | sha256:a2832fb21db0568cfa8cdc4576f0f331296edac33ed15cdaca7f8b49d262efb3 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| ai-logs/2026-06-27-project-memory-context-governance.md | sha256:b261f943d3b869dd61a71abf4d26c3390a99797eec4a90781c7dd23e2d954ebd | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| ai-logs/2026-06-27-release-evidence-adoption-entry.md | sha256:4dc0089e3ff804855a5f34982e3ff576f9dde25631527c6b9f7192305a079768 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| checklists/debt-knowledge-handoff-review.md | sha256:52101b7cc93dc7d7bbe6ff1105aff911678a5188ca5fb37c5f61cb944804cf8d | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| checklists/release-handoff-pack-review.md | sha256:0032429f64e674b6d70a437ea54418e02fc94874f621797fed71bdf217aebe31 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| core/debt-knowledge-handoff.md | sha256:1014516a6c13ade44293557d22d59b279edf6f2f29077319a1110ab89fbac09d | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| core/release-handoff-packs.md | sha256:2689c54def5a2d0bba2a14f2136e8d00d0e42eef20b241134b4775ec5715cdce | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| debt-handoff-reports/114-work-queue-state-transition-governance.md | sha256:9e731c8de087a738dde05610600976289f9839d7b82426c44294a2d8cecf5609 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| decision-briefs/035-readonly-manifest.md | sha256:8f71c14028f3fbd99f2bb825aeb2ba2780281387facec8b55e2c8f4b5f848cb4 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| decision-briefs/036-cli-front-door.md | sha256:c3694d83c604f04ae43eff84b53833c1d84ca09beedcfca37bb7ad8bd67d1e42 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| decision-briefs/037-manifest-authoritative.md | sha256:84154140f44613b6ef0f0f933ef025f2d261fe80afc202f55d80309765decaf2 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| decision-briefs/038-init-update-safety.md | sha256:9f4a4c574811eb68c2b7e244bcd65f45994c03bb877fb71160c06cfcde0eeba6 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| decision-briefs/039-artifact-frontmatter-schema.md | sha256:04cc801aaabd1ba61ca12425dd6e41d5aa7ef1d153833dd316189a3fc7e15307 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| decision-briefs/040-checker-library-refactor.md | sha256:1cb3efbaec00453362cef7d44208806448e62624c29bac5ac91a54b21037c400 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| decision-briefs/040-fixture-matrix-expansion.md | sha256:6f0bd9c22a786b484c278442d4c1a8786db3a580517ead61bda4b89b2069a675 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| decision-briefs/041-industrial-maturity-license-boundary.md | sha256:505ed23674ac8548ae2aa4a8393bcbd756aca18246cd7437ce00f83f4a85e442 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| decision-briefs/120-baseline-guided-setup-boundary.md | sha256:958eae8be5dab9f2a29c894dd6bb168093d37265c954904d0f9b8ee26680ad9b | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| decision-briefs/130-guided-delivery-baseline-boundary.md | sha256:b35add5efe3aaeae5de6d1e24a2935e7f2bbab37f20eb485a6c8048866305a42 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| decision-briefs/140-context-source-of-truth-boundary.md | sha256:e1c0a491e4036ba445cf2f26ec0d1214b51521df673c65e9db2f5bc52fe5708e | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| docs/debt-knowledge-handoff.md | sha256:525f37111ec536c95060bfb25ffaf8da84b0047f082fdc55068a88b930f90d21 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| docs/release-handoff-packs.md | sha256:e763c1f088802800e80e314a8cea1e4690e86b6f8262ed2cb71c8d4ce9fef264 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| docs/roadmaps/controlled-apply-execution-roadmap-1.40-1.42.md | sha256:5285c6d309489e04210b26f8c341ad5c812d12f63009d1e53c4bb2713cda9503 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| docs/roadmaps/delivery-governance-roadmap-1.26-1.29.md | sha256:194cc1f93c4155ee2a0323b10b5c5362b4d12caad058c4d2dc78f88cde29cf88 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| docs/roadmaps/delivery-readiness-and-drift-roadmap-1.4.1-1.6.md | sha256:85b505d34a0703893a5a4b260bdb2d89d1e754a33773b4932f2b459ec4bfc01e | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| docs/roadmaps/governance-hardening-roadmap.md | sha256:0593994f39ce013119bb0b1ec14e48bfcde6a05aa492cfaa3a477397f4ed3a3c | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/034-baseline-freeze-self-ci.md | sha256:37ac260ed5972fb3d0f7f5910328f7a7cd614bb6113b1f30e1a6843f85d81b16 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/035-readonly-manifest.md | sha256:2736085116613400664cb866fdc8e366498b215236120485e3fbff5055dac223 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/036-cli-front-door.md | sha256:f5def07692c80e214fd56f91e782a3c19ce1f50ad80307bb5e43e1a1665ae0e5 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/037-manifest-authoritative.md | sha256:4ea74a174f6e55870abb766840e7cb6491a317798d36cf1f31374da159aed505 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/038-init-update-safety.md | sha256:e42bbe574a8cb3602426aeb9c06390a7c06063894c89cbf2f2c18b1acda4ee2c | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/039-artifact-frontmatter-schema.md | sha256:0bec2eaa72639c661aea349699dea2521ff4571567aafea4ec4c891f2360f629 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/040-checker-library-refactor.md | sha256:9358b5f672bd18d2a97fb929be265f95e3303ebab49c7495685b36b8090e0a61 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/040-fixture-matrix-expansion.md | sha256:e7648d65dcc96a94e208e1b1667e1e4ea9fea0d7d5926678c3e6506322cc3727 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/041-industrial-maturity-license-boundary.md | sha256:e0f2bca4253d9a187b1b7a6fd68c93a6b3777cd0aa1b6aa5a0b2d28e3e4709bc | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/042-docs-ia-migration-command.md | sha256:7b33f2a7dfa28dced2b0549dd88911f3abdfc0aba49ee9120bd7dafb18184886 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/100-release-evidence-adoption-entry.md | sha256:ef9d2d9b6ee54e2ad228e126d3a939726d2f6b93565398479ddeefa1d840c55f | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/110-guided-adoption-entry.md | sha256:71a035aa568aa2085dbd95400f7ffbb9f02a93c2277a013d14e9f87cf4eb6d37 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/120-baseline-guided-setup.md | sha256:af270054ac4488ece25cd8a5a7c2a9e42b3bdfff390e0ba2ea7f1f32c3ffe4a6 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/130-guided-delivery-baseline.md | sha256:7a1a0acc03a24b60dfdf439da657c9b57eee8bdf0a91edb5b483793928658acb | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/140-project-memory-context-governance.md | sha256:a12a04a38719fcbaac4f9788afbcfec8e4453010e6a860623b5d194d5ebf68f3 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/141-160-delivery-readiness-drift.md | sha256:e4095e1cd685cfd9b00b0c131d1edde14eccea440fbc3969e2344a3084be401a | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/170-first-delivery-walkthrough.md | sha256:cc4d09281975a50f45b0fca2ff207d82ff5e5927135ecdedf980a31f0629dc9e | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/180-real-project-adoption-trial.md | sha256:9f6ec83f56f8202e1aafdce1c37e96891871753e98939ad109d9b75ad0a43651 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/181-real-adoption-calibration.md | sha256:75cfe503370f7374ed568dc2c0ff62b1640a0a36730470a44caf41d765d90110 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/190-human-decision-summary.md | sha256:33d9827a8de06ba6e4a59f93a0fed8ca3c3c7a99eb4112f6a728839ca12f4d35 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/200-guided-decision-delivery-loop.md | sha256:b7c824d15ddad310edcb7134be54cda59e400f0264b26112b22c2129125b3c15 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/210-governance-hardening-drift-guard.md | sha256:2c7453eb4bb16e4590c01a3651d427414dd8860a7a6efd821c8c4ebdf2b47f2f | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/220-change-boundary-baseline-state.md | sha256:605cb47affc514642a4a2b6742f7a9ae5821341bebeee349c8c873008ff83b9c | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/221-manifest-readme-fallback-sync.md | sha256:12f8304cc57ea014cbab9d7811cd5a1a7388ab55b5ab51bf251e745d350a8282 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/230-baseline-pack-system.md | sha256:c2086d27be86759be6c89d4325c0608d96ab26e774da4b1bbb905daac631e742 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| final-reports/240-standard-baseline-pack-registry.md | sha256:97110665d6b89993df6b53a6d9d8101f43226e00d60492851004f0d6b3c995da | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| prompts/debt-handoff-agent.md | sha256:587a1d2116ecf1f8ae40f432cefcf72bcb05ea11581e547dab917ee8a3fca020 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| prompts/release-handoff-pack-agent.md | sha256:7efecb38d37278c63bc51f65822c592eab822e279045ece6f76ec7e4d4abfee3 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| release-recipes/backend-api-handoff.md | sha256:ac9873f3e362984c8cd83616e5b0d04ec225d81aba5c5751e5485bb6206b1c9c | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| release-recipes/mini-program-review-handoff.md | sha256:ba7e56093ede50b1a2543125e952ff5028b2763a80417a7dd9a2988a6540a23e | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/034-baseline-freeze-self-ci.md | sha256:51fe650f6de0c78553526ed44a5ba15c077fdead9074195c3ad1b0dd52173006 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/035-readonly-manifest.md | sha256:9d5de748e0cd5a7524030dde45e7d25daad195bae82dc4bd0f2a2f262c763a0b | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/036-cli-front-door.md | sha256:06f22ed9829d38b519be3c6b58e29777fd155239dfa8212f0849ca6741531046 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/037-manifest-authoritative.md | sha256:fcd91c254660c1af8e1d333798b02b70d5ddd79faaf79aff9fa4884519ae65b4 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/038-init-update-safety.md | sha256:5290f117d7e28e93f9e8e676f721a29b83f9d7723a0dce6cecdd7c93aa82bc00 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/039-artifact-frontmatter-schema.md | sha256:dc7a6b735ff25c24da6936d0013fae5fa44867d3b76977d96714611ae5b106aa | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/040-checker-library-refactor.md | sha256:fbbb39667f61da82cb17c2e5064aa77d02c14cc651d427d570be375af4bfbe6b | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/040-fixture-matrix-expansion.md | sha256:c164426e026ed2b944a3ffe19bbf52c391d07b145446b70a2cb60cfd8cab06c2 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/041-industrial-maturity-license-boundary.md | sha256:b9e21575079e00f0b87d6b0ce475b372850d52639be833e100c04ee358e28cc8 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/042-docs-ia-migration-command.md | sha256:520ea498e6e100b85cb51c8dab23469ae58977c0b0fe249daa6b31831828b194 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/100-release-evidence-adoption-entry.md | sha256:232d2d204339da222d1b6f3edc0ecc625b50d6ded25184b0f7f05b5495078816 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/109-project-entry-adoption-trust-hardcut.md | sha256:61a2127adb6990f97f88674f046e70be70f22fec89bc750747b5fdbdc6844841 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/110-guided-adoption-entry.md | sha256:012cf6061f12012fc4592b77b57dfaa5685e02c256a78a7da0d98da5afa01f42 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/120-baseline-guided-setup.md | sha256:ad968c43ef3df459dac0df4000b2d679f6edfc79e78bf8d3dc54828527e9a1ba | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/130-guided-delivery-baseline.md | sha256:1ab559aeec0ca63a3b5e945c2c846d99cfcac76b5465e9a15c640abefb268827 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/140-project-memory-context-governance.md | sha256:c72dd242a8bf02cafe083383588f4c7aa5ff3fb1cfedee76bc8666ee13547c1a | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/170-first-delivery-walkthrough.md | sha256:b582b199ff8707a9298f814b45d175736f779188c4a901648bca90900f403a0a | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/180-real-project-adoption-trial.md | sha256:072dd0177f37ce87ca5f0cd87340f963474e76c0d205ada5edbb3d393d1b1c7b | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/181-real-adoption-calibration.md | sha256:bd5a94056fafa1b2a0803998d2f75b046e2580851bc37aa627575b5a42c6973c | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/190-human-decision-summary.md | sha256:f50858d084a0b3afd0ef9bb38d466dd7a6a6050e19df599df8280bfd25676a0f | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/200-guided-decision-delivery-loop.md | sha256:050300194811189027cdb7915405a6ec9071790f702ad61fbf30b3f691761745 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/210-governance-hardening-drift-guard.md | sha256:33cd4864a64137b06ec284620b254d4a994dd0f1cc97ebc68f6bae8e94755208 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/220-change-boundary-baseline-state.md | sha256:295e04a9b77975ae5b55eb179009351dc998030361d4c0005739f756724fb721 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/221-manifest-readme-fallback-sync.md | sha256:4b577efa4adabf86c2890d6913db26c01ffaa1fe0a057b4c88e2bcb5bf9a2902 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/230-baseline-pack-system.md | sha256:cc5756bc3c7c470dc5f83a79a15e664c58003e5865e56058385c816b09845112 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| tasks/240-standard-baseline-pack-registry.md | sha256:504f5d35768dffd91563c63b7d7d2a7e6f50d23e271c5dc48346fc322b3a4136 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| templates/customer-handoff.md | sha256:efa137e38e29eb229cf083bff7342b2efedcbcc044d3377445f94ba54179b1a3 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| templates/debt-knowledge-handoff-report.md | sha256:288a7cae7f933bf4044f1d1c49f05e3c1581e0a7921d881719d96892b0696905 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| templates/follow-up-proposal.md | sha256:9623e52427c2c64ce3addcb607b9b97b014d19c44eb73e9a4f5c7cc602ab5768 | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| templates/release-handoff-pack.md | sha256:bf85e933ec72746a293564443d46c6d42534175b9b3f430ed11f421cf236aa4b | ARCHIVE_SOURCE_ONLY | N/A | A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task. |
| work-queue/109-project-entry-adoption-trust-hardcut.md#109 | sha256:962fe2e0a1289357a7efb259ed0336bde2b392f120dbb12ad0b05e09ba5bf3df | MARK_DONE_WITH_EVIDENCE | DONE | Preserve the exact completed task as non-executable history. |
| work-queue/109-project-entry-adoption-trust-hardcut.md#110 | sha256:8a35387abd2b05399e5e5c1edc6841a2bc556732cd7c010bca2db140ee8cefd7 | MARK_DONE_WITH_EVIDENCE | DONE | Preserve the exact completed task as non-executable history. |
| work-queue/113-cross-domain-trust-closure.md#WQ-001 | sha256:bc8218d395b58978959361ba5cee250467a6fb0fb6dfedf99137c896cbfb11f2 | MARK_DONE_WITH_EVIDENCE | DONE | Preserve the exact completed task as non-executable history. |
| work-queue/114-check-intentos-modularity.md#WQ-114-CHECK-INTENTOS-MODULARITY | sha256:ae5c508032628da46bec46969e6659031e2acd55d74e7e4c28e186150a84d6ee | MARK_DONE_WITH_EVIDENCE | DONE | Preserve the exact completed task as non-executable history. |
| work-queue/114-work-queue-state-transition-governance.md#WQ-114-TRANSITION | sha256:d6834044edd188e410dee930dcfc80452f0a9cd634e414af332234f0cf149664 | MARK_DONE_WITH_EVIDENCE | DONE | Preserve the exact completed task as non-executable history. |
| work-queue/115-init-project-modularity.md#WQ-115-INIT-PROJECT-MODULARITY | sha256:919821214dfb87553da0f87caff47f421c8362c16e4faedd7522885b115d8009 | MARK_DONE_WITH_EVIDENCE | DONE | Preserve the exact completed task as non-executable history. |
| work-queue/116-new-workflow-item-modularity.md#WQ-116-NEW-WORKFLOW-ITEM-MODULARITY | sha256:ce303366fdf103c5b35da1bf675e0d300447dec27294f416b05bb05c2c00b244 | MIGRATE_CURRENT | CURRENT | Map the exact current task into the governed queue projection without replacing project task authority. |

## Queue Items

| Item ID | State | Title | Task Ref | Intent | Intent Digest | Work Queue Item Digest | Source Item | Source Digest | Task Governance Ref | Task Governance Digest | Binding Status | Execution Review Eligible After Task Governance | Execution Eligible | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WQ-001 | DONE | Project Entry And Behavior-Complete Adoption Trust Hardcut | task:2e4da1627705d0bfd11a05b8b76ff87efbe218667d21bc6bfde9f46371a73e39 | modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes | sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e | sha256:2e4da1627705d0bfd11a05b8b76ff87efbe218667d21bc6bfde9f46371a73e39 | work-queue/109-project-entry-adoption-trust-hardcut.md#109 | sha256:962fe2e0a1289357a7efb259ed0336bde2b392f120dbb12ad0b05e09ba5bf3df | N/A | N/A | N/A | No | No | Not execution permission until promoted and governed. |
| WQ-002 | DONE | Control Effectiveness | task:27ea6e001950e19e097c261eeac4d1af23d5c4962e83a90169f84d859f1fe9ed | modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes | sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e | sha256:27ea6e001950e19e097c261eeac4d1af23d5c4962e83a90169f84d859f1fe9ed | work-queue/109-project-entry-adoption-trust-hardcut.md#110 | sha256:8a35387abd2b05399e5e5c1edc6841a2bc556732cd7c010bca2db140ee8cefd7 | N/A | N/A | N/A | No | No | Not execution permission until promoted and governed. |
| WQ-003 | DONE | IntentOS 1.113 cross-domain trust closure | task:608df78abc557d292fc634432af665b48e8940a00e244edbd4be038a1201c0cd | modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes | sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e | sha256:608df78abc557d292fc634432af665b48e8940a00e244edbd4be038a1201c0cd | work-queue/113-cross-domain-trust-closure.md#WQ-001 | sha256:bc8218d395b58978959361ba5cee250467a6fb0fb6dfedf99137c896cbfb11f2 | N/A | N/A | N/A | No | No | Not execution permission until promoted and governed. |
| WQ-004 | DONE | Modularize the IntentOS self-check entry | task:75daa2d63be2cc9c88b70864df105fc944ed78bf37db59ab697fd14330caadba | modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes | sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e | sha256:75daa2d63be2cc9c88b70864df105fc944ed78bf37db59ab697fd14330caadba | work-queue/114-check-intentos-modularity.md#WQ-114-CHECK-INTENTOS-MODULARITY | sha256:ae5c508032628da46bec46969e6659031e2acd55d74e7e4c28e186150a84d6ee | N/A | N/A | N/A | No | No | Not execution permission until promoted and governed. |
| WQ-005 | DONE | Append-only Work Queue state transition governance | task:ce493f904cfc186ad363beaa260ae04a3c2aa460a62e5e375fa8a9e702ff7cac | modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes | sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e | sha256:ce493f904cfc186ad363beaa260ae04a3c2aa460a62e5e375fa8a9e702ff7cac | work-queue/114-work-queue-state-transition-governance.md#WQ-114-TRANSITION | sha256:d6834044edd188e410dee930dcfc80452f0a9cd634e414af332234f0cf149664 | N/A | N/A | N/A | No | No | Not execution permission until promoted and governed. |
| WQ-006 | DONE | Modularize the IntentOS project initialization entry | task:151fb12b47c6a99895d249444c64b9c2ccac28f93ab77fd019d6cbbb6c8fc65b | modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes | sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e | sha256:151fb12b47c6a99895d249444c64b9c2ccac28f93ab77fd019d6cbbb6c8fc65b | work-queue/115-init-project-modularity.md#WQ-115-INIT-PROJECT-MODULARITY | sha256:919821214dfb87553da0f87caff47f421c8362c16e4faedd7522885b115d8009 | N/A | N/A | N/A | No | No | Not execution permission until promoted and governed. |
| WQ-007 | CURRENT | Modularize the IntentOS workflow-item generator | task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf | modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes | sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e | sha256:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf | work-queue/116-new-workflow-item-modularity.md#WQ-116-NEW-WORKFLOW-ITEM-MODULARITY | sha256:ce303366fdf103c5b35da1bf675e0d300447dec27294f416b05bb05c2c00b244 | task-governance-reports/116-new-workflow-item-modularity.md | sha256:35c031b840c9c248aede17f2150235e174c0038a1f0d4a0b81ea8c451a07df73 | VERIFIED | Yes | Yes | The exact current Task Governance report and intent digest were verified by the public takeover resolver. |

## Boundaries

- This report writes target files: No
- This report deletes old task sources: No
- This report approves implementation: No
- This report approves completion: No
- This report approves commit or push: No
- This report approves release or production: No
- This report claims full adoption: No
- This report installs native assets: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.84.1",
  "artifact_type": "work_queue_takeover",
  "work_queue_takeover_ref": "work-queue-takeover-reports/116-new-workflow-item-modularity.md",
  "work_queue_takeover_digest": "sha256:1e8f8e5224a0de0784a8f2ca81378c43f9b0c3d16c0b23e263b7eda1963e79cd",
  "intent": "modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes",
  "intent_digest": "sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e",
  "project_task_system_class": "RELIABLE_EXISTING_TASK_SYSTEM",
  "recommended_action": "MAP_EXISTING_TASK_SYSTEM",
  "future_task_authority": "PROJECT_NATIVE_MAPPED",
  "plain_user_summary": "我检查到项目已有可用的任务体系。我会把它映射到 IntentOS Work Queue，不重复建立一套新队列。",
  "source_inventory": [
    {
      "source_ref": "ai-logs/2026-06-27-baseline-guided-setup.md",
      "source_digest": "sha256:fa32d6f1e9414032499f5c9130b988a9fceb8313e5f6698e63a662c29c3c1965",
      "source_type": "ai_log",
      "status": "UNKNOWN",
      "summary": "AI Log: 2026-06-27 Baseline Guided Setup"
    },
    {
      "source_ref": "ai-logs/2026-06-27-docs-ia-migration-command.md",
      "source_digest": "sha256:821a646e19b46d4c12494ac997eaba02c86c9ede281ef80671ab91429dfa616b",
      "source_type": "ai_log",
      "status": "STALE",
      "summary": "AI Task Log: 2026-06-27-docs-ia-migration-command"
    },
    {
      "source_ref": "ai-logs/2026-06-27-guided-adoption-entry.md",
      "source_digest": "sha256:969f90882b7da693bcd857db2bf03c7e33331134e632dcdffa7e7b5c670deec3",
      "source_type": "ai_log",
      "status": "UNKNOWN",
      "summary": "AI Log: Guided Adoption Entry"
    },
    {
      "source_ref": "ai-logs/2026-06-27-guided-delivery-baseline.md",
      "source_digest": "sha256:bda2e1b01349e3abcc0c17037a5b0d3812a6a5bef9d6cb5d6460770aad55fd98",
      "source_type": "ai_log",
      "status": "UNKNOWN",
      "summary": "AI Log: Guided Delivery Baseline"
    },
    {
      "source_ref": "ai-logs/2026-06-27-industrial-maturity-license-boundary.md",
      "source_digest": "sha256:a2832fb21db0568cfa8cdc4576f0f331296edac33ed15cdaca7f8b49d262efb3",
      "source_type": "ai_log",
      "status": "STALE",
      "summary": "AI Task Log: 2026-06-27-industrial-maturity-license-boundary"
    },
    {
      "source_ref": "ai-logs/2026-06-27-project-memory-context-governance.md",
      "source_digest": "sha256:b261f943d3b869dd61a71abf4d26c3390a99797eec4a90781c7dd23e2d954ebd",
      "source_type": "ai_log",
      "status": "UNKNOWN",
      "summary": "AI Log: Project Memory & Context Governance"
    },
    {
      "source_ref": "ai-logs/2026-06-27-release-evidence-adoption-entry.md",
      "source_digest": "sha256:4dc0089e3ff804855a5f34982e3ff576f9dde25631527c6b9f7192305a079768",
      "source_type": "ai_log",
      "status": "STALE",
      "summary": "AI Task Log: 2026-06-27-release-evidence-adoption-entry"
    },
    {
      "source_ref": "checklists/debt-knowledge-handoff-review.md",
      "source_digest": "sha256:52101b7cc93dc7d7bbe6ff1105aff911678a5188ca5fb37c5f61cb944804cf8d",
      "source_type": "handoff",
      "status": "UNKNOWN",
      "summary": "Debt & Knowledge Handoff Review Checklist"
    },
    {
      "source_ref": "checklists/release-handoff-pack-review.md",
      "source_digest": "sha256:0032429f64e674b6d70a437ea54418e02fc94874f621797fed71bdf217aebe31",
      "source_type": "handoff",
      "status": "UNKNOWN",
      "summary": "Release Handoff Pack Review"
    },
    {
      "source_ref": "core/debt-knowledge-handoff.md",
      "source_digest": "sha256:1014516a6c13ade44293557d22d59b279edf6f2f29077319a1110ab89fbac09d",
      "source_type": "handoff",
      "status": "STALE",
      "summary": "Debt & Knowledge Handoff"
    },
    {
      "source_ref": "core/release-handoff-packs.md",
      "source_digest": "sha256:2689c54def5a2d0bba2a14f2136e8d00d0e42eef20b241134b4775ec5715cdce",
      "source_type": "handoff",
      "status": "UNKNOWN",
      "summary": "Release Handoff Packs"
    },
    {
      "source_ref": "debt-handoff-reports/114-work-queue-state-transition-governance.md",
      "source_digest": "sha256:9e731c8de087a738dde05610600976289f9839d7b82426c44294a2d8cecf5609",
      "source_type": "handoff",
      "status": "STALE",
      "summary": "Debt & Knowledge Handoff Report: 114-work-queue-state-transition-governance"
    },
    {
      "source_ref": "decision-briefs/035-readonly-manifest.md",
      "source_digest": "sha256:8f71c14028f3fbd99f2bb825aeb2ba2780281387facec8b55e2c8f4b5f848cb4",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Decision Brief: Read-only IntentOS Manifest"
    },
    {
      "source_ref": "decision-briefs/036-cli-front-door.md",
      "source_digest": "sha256:c3694d83c604f04ae43eff84b53833c1d84ca09beedcfca37bb7ad8bd67d1e42",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Decision Brief: CLI Front Door Distribution Boundary"
    },
    {
      "source_ref": "decision-briefs/037-manifest-authoritative.md",
      "source_digest": "sha256:84154140f44613b6ef0f0f933ef025f2d261fe80afc202f55d80309765decaf2",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Decision Brief: Manifest Authority Boundary"
    },
    {
      "source_ref": "decision-briefs/038-init-update-safety.md",
      "source_digest": "sha256:9f4a4c574811eb68c2b7e244bcd65f45994c03bb877fb71160c06cfcde0eeba6",
      "source_type": "other",
      "status": "STALE",
      "summary": "Decision Brief: Init/Update Safety Boundary"
    },
    {
      "source_ref": "decision-briefs/039-artifact-frontmatter-schema.md",
      "source_digest": "sha256:04cc801aaabd1ba61ca12425dd6e41d5aa7ef1d153833dd316189a3fc7e15307",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Decision Brief: Artifact Frontmatter Compatibility"
    },
    {
      "source_ref": "decision-briefs/040-checker-library-refactor.md",
      "source_digest": "sha256:1cb3efbaec00453362cef7d44208806448e62624c29bac5ac91a54b21037c400",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Decision Brief: Checker Library Refactor"
    },
    {
      "source_ref": "decision-briefs/040-fixture-matrix-expansion.md",
      "source_digest": "sha256:6f0bd9c22a786b484c278442d4c1a8786db3a580517ead61bda4b89b2069a675",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Decision Brief: Fixture Matrix Boundary"
    },
    {
      "source_ref": "decision-briefs/041-industrial-maturity-license-boundary.md",
      "source_digest": "sha256:505ed23674ac8548ae2aa4a8393bcbd756aca18246cd7437ce00f83f4a85e442",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Decision Brief: 041-industrial-maturity-license-boundary"
    },
    {
      "source_ref": "decision-briefs/120-baseline-guided-setup-boundary.md",
      "source_digest": "sha256:958eae8be5dab9f2a29c894dd6bb168093d37265c954904d0f9b8ee26680ad9b",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Decision Brief 120: Baseline Guided Setup Boundary"
    },
    {
      "source_ref": "decision-briefs/130-guided-delivery-baseline-boundary.md",
      "source_digest": "sha256:b35add5efe3aaeae5de6d1e24a2935e7f2bbab37f20eb485a6c8048866305a42",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Decision Brief 130: Guided Delivery Baseline Boundary"
    },
    {
      "source_ref": "decision-briefs/140-context-source-of-truth-boundary.md",
      "source_digest": "sha256:e1c0a491e4036ba445cf2f26ec0d1214b51521df673c65e9db2f5bc52fe5708e",
      "source_type": "other",
      "status": "STALE",
      "summary": "Decision Brief 140: Context Source-of-Truth Boundary"
    },
    {
      "source_ref": "docs/debt-knowledge-handoff.md",
      "source_digest": "sha256:525f37111ec536c95060bfb25ffaf8da84b0047f082fdc55068a88b930f90d21",
      "source_type": "handoff",
      "status": "STALE",
      "summary": "Debt & Knowledge Handoff"
    },
    {
      "source_ref": "docs/release-handoff-packs.md",
      "source_digest": "sha256:e763c1f088802800e80e314a8cea1e4690e86b6f8262ed2cb71c8d4ce9fef264",
      "source_type": "handoff",
      "status": "UNKNOWN",
      "summary": "Release Handoff Packs"
    },
    {
      "source_ref": "docs/roadmaps/controlled-apply-execution-roadmap-1.40-1.42.md",
      "source_digest": "sha256:5285c6d309489e04210b26f8c341ad5c812d12f63009d1e53c4bb2713cda9503",
      "source_type": "roadmap",
      "status": "UNKNOWN",
      "summary": "Controlled Apply Execution Roadmap: 1.40-1.42"
    },
    {
      "source_ref": "docs/roadmaps/delivery-governance-roadmap-1.26-1.29.md",
      "source_digest": "sha256:194cc1f93c4155ee2a0323b10b5c5362b4d12caad058c4d2dc78f88cde29cf88",
      "source_type": "roadmap",
      "status": "STALE",
      "summary": "Delivery Governance Roadmap 1.26-1.29"
    },
    {
      "source_ref": "docs/roadmaps/delivery-readiness-and-drift-roadmap-1.4.1-1.6.md",
      "source_digest": "sha256:85b505d34a0703893a5a4b260bdb2d89d1e754a33773b4932f2b459ec4bfc01e",
      "source_type": "roadmap",
      "status": "STALE",
      "summary": "Delivery Readiness And Drift Roadmap 1.4.1 To 1.6"
    },
    {
      "source_ref": "docs/roadmaps/governance-hardening-roadmap.md",
      "source_digest": "sha256:0593994f39ce013119bb0b1ec14e48bfcde6a05aa492cfaa3a477397f4ed3a3c",
      "source_type": "roadmap",
      "status": "STALE",
      "summary": "Governance Hardening And Goal-Oriented Orchestration Roadmap"
    },
    {
      "source_ref": "final-reports/034-baseline-freeze-self-ci.md",
      "source_digest": "sha256:37ac260ed5972fb3d0f7f5910328f7a7cd614bb6113b1f30e1a6843f85d81b16",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: Baseline Freeze And Self CI"
    },
    {
      "source_ref": "final-reports/035-readonly-manifest.md",
      "source_digest": "sha256:2736085116613400664cb866fdc8e366498b215236120485e3fbff5055dac223",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: Read-only IntentOS Manifest"
    },
    {
      "source_ref": "final-reports/036-cli-front-door.md",
      "source_digest": "sha256:f5def07692c80e214fd56f91e782a3c19ce1f50ad80307bb5e43e1a1665ae0e5",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: CLI Front Door"
    },
    {
      "source_ref": "final-reports/037-manifest-authoritative.md",
      "source_digest": "sha256:4ea74a174f6e55870abb766840e7cb6491a317798d36cf1f31374da159aed505",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: Manifest Authoritative Asset Source"
    },
    {
      "source_ref": "final-reports/038-init-update-safety.md",
      "source_digest": "sha256:e42bbe574a8cb3602426aeb9c06390a7c06063894c89cbf2f2c18b1acda4ee2c",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: Init/Update Safety"
    },
    {
      "source_ref": "final-reports/039-artifact-frontmatter-schema.md",
      "source_digest": "sha256:0bec2eaa72639c661aea349699dea2521ff4571567aafea4ec4c891f2360f629",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: Artifact Frontmatter + Schema"
    },
    {
      "source_ref": "final-reports/040-checker-library-refactor.md",
      "source_digest": "sha256:9358b5f672bd18d2a97fb929be265f95e3303ebab49c7495685b36b8090e0a61",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: Checker Library Refactor"
    },
    {
      "source_ref": "final-reports/040-fixture-matrix-expansion.md",
      "source_digest": "sha256:e7648d65dcc96a94e208e1b1667e1e4ea9fea0d7d5926678c3e6506322cc3727",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: Fixture Matrix Expansion"
    },
    {
      "source_ref": "final-reports/041-industrial-maturity-license-boundary.md",
      "source_digest": "sha256:e0f2bca4253d9a187b1b7a6fd68c93a6b3777cd0aa1b6aa5a0b2d28e3e4709bc",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 041-industrial-maturity-license-boundary"
    },
    {
      "source_ref": "final-reports/042-docs-ia-migration-command.md",
      "source_digest": "sha256:7b33f2a7dfa28dced2b0549dd88911f3abdfc0aba49ee9120bd7dafb18184886",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 042-docs-ia-migration-command"
    },
    {
      "source_ref": "final-reports/100-release-evidence-adoption-entry.md",
      "source_digest": "sha256:ef9d2d9b6ee54e2ad228e126d3a939726d2f6b93565398479ddeefa1d840c55f",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 100-release-evidence-adoption-entry"
    },
    {
      "source_ref": "final-reports/110-guided-adoption-entry.md",
      "source_digest": "sha256:71a035aa568aa2085dbd95400f7ffbb9f02a93c2277a013d14e9f87cf4eb6d37",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: Guided Adoption Entry"
    },
    {
      "source_ref": "final-reports/120-baseline-guided-setup.md",
      "source_digest": "sha256:af270054ac4488ece25cd8a5a7c2a9e42b3bdfff390e0ba2ea7f1f32c3ffe4a6",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report 120: Baseline Guided Setup"
    },
    {
      "source_ref": "final-reports/130-guided-delivery-baseline.md",
      "source_digest": "sha256:7a1a0acc03a24b60dfdf439da657c9b57eee8bdf0a91edb5b483793928658acb",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report 130: Guided Delivery Baseline"
    },
    {
      "source_ref": "final-reports/140-project-memory-context-governance.md",
      "source_digest": "sha256:a12a04a38719fcbaac4f9788afbcfec8e4453010e6a860623b5d194d5ebf68f3",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report 140: Project Memory & Context Governance"
    },
    {
      "source_ref": "final-reports/141-160-delivery-readiness-drift.md",
      "source_digest": "sha256:e4095e1cd685cfd9b00b0c131d1edde14eccea440fbc3969e2344a3084be401a",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 1.4.1 To 1.6 Delivery Readiness And Drift"
    },
    {
      "source_ref": "final-reports/170-first-delivery-walkthrough.md",
      "source_digest": "sha256:cc4d09281975a50f45b0fca2ff207d82ff5e5927135ecdedf980a31f0629dc9e",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 1.7 First Delivery Walkthrough"
    },
    {
      "source_ref": "final-reports/180-real-project-adoption-trial.md",
      "source_digest": "sha256:9f6ec83f56f8202e1aafdce1c37e96891871753e98939ad109d9b75ad0a43651",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 1.8 Real Project Read-only Adoption Trial"
    },
    {
      "source_ref": "final-reports/181-real-adoption-calibration.md",
      "source_digest": "sha256:75cfe503370f7374ed568dc2c0ff62b1640a0a36730470a44caf41d765d90110",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 1.8.1 Real Adoption Calibration"
    },
    {
      "source_ref": "final-reports/190-human-decision-summary.md",
      "source_digest": "sha256:33d9827a8de06ba6e4a59f93a0fed8ca3c3c7a99eb4112f6a728839ca12f4d35",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 1.9.0 Human Decision Summary"
    },
    {
      "source_ref": "final-reports/200-guided-decision-delivery-loop.md",
      "source_digest": "sha256:b7c824d15ddad310edcb7134be54cda59e400f0264b26112b22c2129125b3c15",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 200-guided-decision-delivery-loop"
    },
    {
      "source_ref": "final-reports/210-governance-hardening-drift-guard.md",
      "source_digest": "sha256:2c7453eb4bb16e4590c01a3651d427414dd8860a7a6efd821c8c4ebdf2b47f2f",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 210-governance-hardening-drift-guard"
    },
    {
      "source_ref": "final-reports/220-change-boundary-baseline-state.md",
      "source_digest": "sha256:605cb47affc514642a4a2b6742f7a9ae5821341bebeee349c8c873008ff83b9c",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 220-change-boundary-baseline-state"
    },
    {
      "source_ref": "final-reports/221-manifest-readme-fallback-sync.md",
      "source_digest": "sha256:12f8304cc57ea014cbab9d7811cd5a1a7388ab55b5ab51bf251e745d350a8282",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 221-manifest-readme-fallback-sync"
    },
    {
      "source_ref": "final-reports/230-baseline-pack-system.md",
      "source_digest": "sha256:c2086d27be86759be6c89d4325c0608d96ab26e774da4b1bbb905daac631e742",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 230-baseline-pack-system"
    },
    {
      "source_ref": "final-reports/240-standard-baseline-pack-registry.md",
      "source_digest": "sha256:97110665d6b89993df6b53a6d9d8101f43226e00d60492851004f0d6b3c995da",
      "source_type": "other",
      "status": "STALE",
      "summary": "Final Report: 240-standard-baseline-pack-registry"
    },
    {
      "source_ref": "prompts/debt-handoff-agent.md",
      "source_digest": "sha256:587a1d2116ecf1f8ae40f432cefcf72bcb05ea11581e547dab917ee8a3fca020",
      "source_type": "handoff",
      "status": "UNKNOWN",
      "summary": "Debt & Knowledge Handoff Agent Prompt"
    },
    {
      "source_ref": "prompts/release-handoff-pack-agent.md",
      "source_digest": "sha256:7efecb38d37278c63bc51f65822c592eab822e279045ece6f76ec7e4d4abfee3",
      "source_type": "handoff",
      "status": "UNKNOWN",
      "summary": "Release Handoff Pack Agent Prompt"
    },
    {
      "source_ref": "release-recipes/backend-api-handoff.md",
      "source_digest": "sha256:ac9873f3e362984c8cd83616e5b0d04ec225d81aba5c5751e5485bb6206b1c9c",
      "source_type": "handoff",
      "status": "UNKNOWN",
      "summary": "Backend API Handoff Release Recipe"
    },
    {
      "source_ref": "release-recipes/mini-program-review-handoff.md",
      "source_digest": "sha256:ba7e56093ede50b1a2543125e952ff5028b2763a80417a7dd9a2988a6540a23e",
      "source_type": "handoff",
      "status": "UNKNOWN",
      "summary": "Mini Program Review Handoff Release Recipe"
    },
    {
      "source_ref": "tasks/034-baseline-freeze-self-ci.md",
      "source_digest": "sha256:51fe650f6de0c78553526ed44a5ba15c077fdead9074195c3ad1b0dd52173006",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task: Baseline Freeze And Self CI"
    },
    {
      "source_ref": "tasks/035-readonly-manifest.md",
      "source_digest": "sha256:9d5de748e0cd5a7524030dde45e7d25daad195bae82dc4bd0f2a2f262c763a0b",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task: Read-only IntentOS Manifest"
    },
    {
      "source_ref": "tasks/036-cli-front-door.md",
      "source_digest": "sha256:06f22ed9829d38b519be3c6b58e29777fd155239dfa8212f0849ca6741531046",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task: CLI Front Door"
    },
    {
      "source_ref": "tasks/037-manifest-authoritative.md",
      "source_digest": "sha256:fcd91c254660c1af8e1d333798b02b70d5ddd79faaf79aff9fa4884519ae65b4",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task: Manifest Authoritative Asset Source"
    },
    {
      "source_ref": "tasks/038-init-update-safety.md",
      "source_digest": "sha256:5290f117d7e28e93f9e8e676f721a29b83f9d7723a0dce6cecdd7c93aa82bc00",
      "source_type": "other",
      "status": "STALE",
      "summary": "Task: Init/Update Safety"
    },
    {
      "source_ref": "tasks/039-artifact-frontmatter-schema.md",
      "source_digest": "sha256:dc7a6b735ff25c24da6936d0013fae5fa44867d3b76977d96714611ae5b106aa",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task: Artifact Frontmatter + Schema"
    },
    {
      "source_ref": "tasks/040-checker-library-refactor.md",
      "source_digest": "sha256:fbbb39667f61da82cb17c2e5064aa77d02c14cc651d427d570be375af4bfbe6b",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task 040: Checker Library Refactor"
    },
    {
      "source_ref": "tasks/040-fixture-matrix-expansion.md",
      "source_digest": "sha256:c164426e026ed2b944a3ffe19bbf52c391d07b145446b70a2cb60cfd8cab06c2",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task: Fixture Matrix Expansion"
    },
    {
      "source_ref": "tasks/041-industrial-maturity-license-boundary.md",
      "source_digest": "sha256:b9e21575079e00f0b87d6b0ce475b372850d52639be833e100c04ee358e28cc8",
      "source_type": "other",
      "status": "STALE",
      "summary": "Task 041: industrial maturity license boundary"
    },
    {
      "source_ref": "tasks/042-docs-ia-migration-command.md",
      "source_digest": "sha256:520ea498e6e100b85cb51c8dab23469ae58977c0b0fe249daa6b31831828b194",
      "source_type": "other",
      "status": "STALE",
      "summary": "Task 042: docs ia migration command"
    },
    {
      "source_ref": "tasks/100-release-evidence-adoption-entry.md",
      "source_digest": "sha256:232d2d204339da222d1b6f3edc0ecc625b50d6ded25184b0f7f05b5495078816",
      "source_type": "other",
      "status": "STALE",
      "summary": "Task 100: release evidence adoption entry"
    },
    {
      "source_ref": "tasks/109-project-entry-adoption-trust-hardcut.md",
      "source_digest": "sha256:61a2127adb6990f97f88674f046e70be70f22fec89bc750747b5fdbdc6844841",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task 109: Project Entry And Behavior-Complete Adoption Trust Hardcut"
    },
    {
      "source_ref": "tasks/110-guided-adoption-entry.md",
      "source_digest": "sha256:012cf6061f12012fc4592b77b57dfaa5685e02c256a78a7da0d98da5afa01f42",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task: Guided Adoption Entry"
    },
    {
      "source_ref": "tasks/120-baseline-guided-setup.md",
      "source_digest": "sha256:ad968c43ef3df459dac0df4000b2d679f6edfc79e78bf8d3dc54828527e9a1ba",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task 120: Baseline Guided Setup"
    },
    {
      "source_ref": "tasks/130-guided-delivery-baseline.md",
      "source_digest": "sha256:1ab559aeec0ca63a3b5e945c2c846d99cfcac76b5465e9a15c640abefb268827",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task 130: Guided Delivery Baseline"
    },
    {
      "source_ref": "tasks/140-project-memory-context-governance.md",
      "source_digest": "sha256:c72dd242a8bf02cafe083383588f4c7aa5ff3fb1cfedee76bc8666ee13547c1a",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task 140: Project Memory & Context Governance"
    },
    {
      "source_ref": "tasks/170-first-delivery-walkthrough.md",
      "source_digest": "sha256:b582b199ff8707a9298f814b45d175736f779188c4a901648bca90900f403a0a",
      "source_type": "other",
      "status": "STALE",
      "summary": "Task 170: First Delivery Walkthrough"
    },
    {
      "source_ref": "tasks/180-real-project-adoption-trial.md",
      "source_digest": "sha256:072dd0177f37ce87ca5f0cd87340f963474e76c0d205ada5edbb3d393d1b1c7b",
      "source_type": "other",
      "status": "STALE",
      "summary": "Task 180: Real Project Read-only Adoption Trial"
    },
    {
      "source_ref": "tasks/181-real-adoption-calibration.md",
      "source_digest": "sha256:bd5a94056fafa1b2a0803998d2f75b046e2580851bc37aa627575b5a42c6973c",
      "source_type": "other",
      "status": "STALE",
      "summary": "Task 181: Real Adoption Calibration"
    },
    {
      "source_ref": "tasks/190-human-decision-summary.md",
      "source_digest": "sha256:f50858d084a0b3afd0ef9bb38d466dd7a6a6050e19df599df8280bfd25676a0f",
      "source_type": "other",
      "status": "STALE",
      "summary": "Task 190: Human Decision Summary"
    },
    {
      "source_ref": "tasks/200-guided-decision-delivery-loop.md",
      "source_digest": "sha256:050300194811189027cdb7915405a6ec9071790f702ad61fbf30b3f691761745",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task 200: Guided Decision & Delivery Loop"
    },
    {
      "source_ref": "tasks/210-governance-hardening-drift-guard.md",
      "source_digest": "sha256:33cd4864a64137b06ec284620b254d4a994dd0f1cc97ebc68f6bae8e94755208",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task: 210-governance-hardening-drift-guard"
    },
    {
      "source_ref": "tasks/220-change-boundary-baseline-state.md",
      "source_digest": "sha256:295e04a9b77975ae5b55eb179009351dc998030361d4c0005739f756724fb721",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task: 220-change-boundary-baseline-state"
    },
    {
      "source_ref": "tasks/221-manifest-readme-fallback-sync.md",
      "source_digest": "sha256:4b577efa4adabf86c2890d6913db26c01ffaa1fe0a057b4c88e2bcb5bf9a2902",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task: 221-manifest-readme-fallback-sync"
    },
    {
      "source_ref": "tasks/230-baseline-pack-system.md",
      "source_digest": "sha256:cc5756bc3c7c470dc5f83a79a15e664c58003e5865e56058385c816b09845112",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task: 230-baseline-pack-system"
    },
    {
      "source_ref": "tasks/240-standard-baseline-pack-registry.md",
      "source_digest": "sha256:504f5d35768dffd91563c63b7d7d2a7e6f50d23e271c5dc48346fc322b3a4136",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Task 240: Standard Baseline Pack Registry"
    },
    {
      "source_ref": "templates/customer-handoff.md",
      "source_digest": "sha256:efa137e38e29eb229cf083bff7342b2efedcbcc044d3377445f94ba54179b1a3",
      "source_type": "handoff",
      "status": "UNKNOWN",
      "summary": "Customer Handoff Summary: <name>"
    },
    {
      "source_ref": "templates/debt-knowledge-handoff-report.md",
      "source_digest": "sha256:288a7cae7f933bf4044f1d1c49f05e3c1581e0a7921d881719d96892b0696905",
      "source_type": "handoff",
      "status": "UNKNOWN",
      "summary": "Debt & Knowledge Handoff Report"
    },
    {
      "source_ref": "templates/follow-up-proposal.md",
      "source_digest": "sha256:9623e52427c2c64ce3addcb607b9b97b014d19c44eb73e9a4f5c7cc602ab5768",
      "source_type": "other",
      "status": "UNKNOWN",
      "summary": "Follow-up Proposal: <name>"
    },
    {
      "source_ref": "templates/release-handoff-pack.md",
      "source_digest": "sha256:bf85e933ec72746a293564443d46c6d42534175b9b3f430ed11f421cf236aa4b",
      "source_type": "handoff",
      "status": "UNKNOWN",
      "summary": "Release Handoff Pack: <pack-id>"
    },
    {
      "source_ref": "work-queue/109-project-entry-adoption-trust-hardcut.md#109",
      "source_digest": "sha256:962fe2e0a1289357a7efb259ed0336bde2b392f120dbb12ad0b05e09ba5bf3df",
      "source_type": "work_queue",
      "status": "STALE",
      "summary": "Project Entry And Behavior-Complete Adoption Trust Hardcut"
    },
    {
      "source_ref": "work-queue/109-project-entry-adoption-trust-hardcut.md#110",
      "source_digest": "sha256:8a35387abd2b05399e5e5c1edc6841a2bc556732cd7c010bca2db140ee8cefd7",
      "source_type": "work_queue",
      "status": "STALE",
      "summary": "Control Effectiveness"
    },
    {
      "source_ref": "work-queue/113-cross-domain-trust-closure.md#WQ-001",
      "source_digest": "sha256:bc8218d395b58978959361ba5cee250467a6fb0fb6dfedf99137c896cbfb11f2",
      "source_type": "work_queue",
      "status": "STALE",
      "summary": "IntentOS 1.113 cross-domain trust closure"
    },
    {
      "source_ref": "work-queue/114-check-intentos-modularity.md#WQ-114-CHECK-INTENTOS-MODULARITY",
      "source_digest": "sha256:ae5c508032628da46bec46969e6659031e2acd55d74e7e4c28e186150a84d6ee",
      "source_type": "work_queue",
      "status": "STALE",
      "summary": "Modularize the IntentOS self-check entry"
    },
    {
      "source_ref": "work-queue/114-work-queue-state-transition-governance.md#WQ-114-TRANSITION",
      "source_digest": "sha256:d6834044edd188e410dee930dcfc80452f0a9cd634e414af332234f0cf149664",
      "source_type": "work_queue",
      "status": "STALE",
      "summary": "Append-only Work Queue state transition governance"
    },
    {
      "source_ref": "work-queue/115-init-project-modularity.md#WQ-115-INIT-PROJECT-MODULARITY",
      "source_digest": "sha256:919821214dfb87553da0f87caff47f421c8362c16e4faedd7522885b115d8009",
      "source_type": "work_queue",
      "status": "STALE",
      "summary": "Modularize the IntentOS project initialization entry"
    },
    {
      "source_ref": "work-queue/116-new-workflow-item-modularity.md#WQ-116-NEW-WORKFLOW-ITEM-MODULARITY",
      "source_digest": "sha256:ce303366fdf103c5b35da1bf675e0d300447dec27294f416b05bb05c2c00b244",
      "source_type": "work_queue",
      "status": "CURRENT",
      "summary": "Modularize the IntentOS workflow-item generator"
    }
  ],
  "reliability_assessment": [
    {
      "criterion": "One current task",
      "result": "Yes",
      "reason": "Existing queue source found."
    },
    {
      "criterion": "Stable task ids",
      "result": "Yes",
      "reason": "Work Queue source can provide task ids."
    },
    {
      "criterion": "Task states",
      "result": "Yes",
      "reason": "Queue states are available."
    },
    {
      "criterion": "Owners or source owners",
      "result": "Yes",
      "reason": "Owner evidence must be preserved or added during migration."
    },
    {
      "criterion": "Resume checkpoints",
      "result": "Yes",
      "reason": "Paused work needs resume review before execution."
    },
    {
      "criterion": "Verification or close-out evidence",
      "result": "Yes",
      "reason": "Completion evidence must be checked before done claims."
    },
    {
      "criterion": "No uncontrolled duplication",
      "result": "Unknown",
      "reason": "Messy sources may contain duplicates; takeover must classify each item."
    }
  ],
  "migration_dispositions": [
    {
      "source_item": "ai-logs/2026-06-27-baseline-guided-setup.md",
      "source_digest": "sha256:fa32d6f1e9414032499f5c9130b988a9fceb8313e5f6698e63a662c29c3c1965",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "ai-logs/2026-06-27-docs-ia-migration-command.md",
      "source_digest": "sha256:821a646e19b46d4c12494ac997eaba02c86c9ede281ef80671ab91429dfa616b",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "ai-logs/2026-06-27-guided-adoption-entry.md",
      "source_digest": "sha256:969f90882b7da693bcd857db2bf03c7e33331134e632dcdffa7e7b5c670deec3",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "ai-logs/2026-06-27-guided-delivery-baseline.md",
      "source_digest": "sha256:bda2e1b01349e3abcc0c17037a5b0d3812a6a5bef9d6cb5d6460770aad55fd98",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "ai-logs/2026-06-27-industrial-maturity-license-boundary.md",
      "source_digest": "sha256:a2832fb21db0568cfa8cdc4576f0f331296edac33ed15cdaca7f8b49d262efb3",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "ai-logs/2026-06-27-project-memory-context-governance.md",
      "source_digest": "sha256:b261f943d3b869dd61a71abf4d26c3390a99797eec4a90781c7dd23e2d954ebd",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "ai-logs/2026-06-27-release-evidence-adoption-entry.md",
      "source_digest": "sha256:4dc0089e3ff804855a5f34982e3ff576f9dde25631527c6b9f7192305a079768",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "checklists/debt-knowledge-handoff-review.md",
      "source_digest": "sha256:52101b7cc93dc7d7bbe6ff1105aff911678a5188ca5fb37c5f61cb944804cf8d",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "checklists/release-handoff-pack-review.md",
      "source_digest": "sha256:0032429f64e674b6d70a437ea54418e02fc94874f621797fed71bdf217aebe31",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "core/debt-knowledge-handoff.md",
      "source_digest": "sha256:1014516a6c13ade44293557d22d59b279edf6f2f29077319a1110ab89fbac09d",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "core/release-handoff-packs.md",
      "source_digest": "sha256:2689c54def5a2d0bba2a14f2136e8d00d0e42eef20b241134b4775ec5715cdce",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "debt-handoff-reports/114-work-queue-state-transition-governance.md",
      "source_digest": "sha256:9e731c8de087a738dde05610600976289f9839d7b82426c44294a2d8cecf5609",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "decision-briefs/035-readonly-manifest.md",
      "source_digest": "sha256:8f71c14028f3fbd99f2bb825aeb2ba2780281387facec8b55e2c8f4b5f848cb4",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "decision-briefs/036-cli-front-door.md",
      "source_digest": "sha256:c3694d83c604f04ae43eff84b53833c1d84ca09beedcfca37bb7ad8bd67d1e42",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "decision-briefs/037-manifest-authoritative.md",
      "source_digest": "sha256:84154140f44613b6ef0f0f933ef025f2d261fe80afc202f55d80309765decaf2",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "decision-briefs/038-init-update-safety.md",
      "source_digest": "sha256:9f4a4c574811eb68c2b7e244bcd65f45994c03bb877fb71160c06cfcde0eeba6",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "decision-briefs/039-artifact-frontmatter-schema.md",
      "source_digest": "sha256:04cc801aaabd1ba61ca12425dd6e41d5aa7ef1d153833dd316189a3fc7e15307",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "decision-briefs/040-checker-library-refactor.md",
      "source_digest": "sha256:1cb3efbaec00453362cef7d44208806448e62624c29bac5ac91a54b21037c400",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "decision-briefs/040-fixture-matrix-expansion.md",
      "source_digest": "sha256:6f0bd9c22a786b484c278442d4c1a8786db3a580517ead61bda4b89b2069a675",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "decision-briefs/041-industrial-maturity-license-boundary.md",
      "source_digest": "sha256:505ed23674ac8548ae2aa4a8393bcbd756aca18246cd7437ce00f83f4a85e442",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "decision-briefs/120-baseline-guided-setup-boundary.md",
      "source_digest": "sha256:958eae8be5dab9f2a29c894dd6bb168093d37265c954904d0f9b8ee26680ad9b",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "decision-briefs/130-guided-delivery-baseline-boundary.md",
      "source_digest": "sha256:b35add5efe3aaeae5de6d1e24a2935e7f2bbab37f20eb485a6c8048866305a42",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "decision-briefs/140-context-source-of-truth-boundary.md",
      "source_digest": "sha256:e1c0a491e4036ba445cf2f26ec0d1214b51521df673c65e9db2f5bc52fe5708e",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "docs/debt-knowledge-handoff.md",
      "source_digest": "sha256:525f37111ec536c95060bfb25ffaf8da84b0047f082fdc55068a88b930f90d21",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "docs/release-handoff-packs.md",
      "source_digest": "sha256:e763c1f088802800e80e314a8cea1e4690e86b6f8262ed2cb71c8d4ce9fef264",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "docs/roadmaps/controlled-apply-execution-roadmap-1.40-1.42.md",
      "source_digest": "sha256:5285c6d309489e04210b26f8c341ad5c812d12f63009d1e53c4bb2713cda9503",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "docs/roadmaps/delivery-governance-roadmap-1.26-1.29.md",
      "source_digest": "sha256:194cc1f93c4155ee2a0323b10b5c5362b4d12caad058c4d2dc78f88cde29cf88",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "docs/roadmaps/delivery-readiness-and-drift-roadmap-1.4.1-1.6.md",
      "source_digest": "sha256:85b505d34a0703893a5a4b260bdb2d89d1e754a33773b4932f2b459ec4bfc01e",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "docs/roadmaps/governance-hardening-roadmap.md",
      "source_digest": "sha256:0593994f39ce013119bb0b1ec14e48bfcde6a05aa492cfaa3a477397f4ed3a3c",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/034-baseline-freeze-self-ci.md",
      "source_digest": "sha256:37ac260ed5972fb3d0f7f5910328f7a7cd614bb6113b1f30e1a6843f85d81b16",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/035-readonly-manifest.md",
      "source_digest": "sha256:2736085116613400664cb866fdc8e366498b215236120485e3fbff5055dac223",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/036-cli-front-door.md",
      "source_digest": "sha256:f5def07692c80e214fd56f91e782a3c19ce1f50ad80307bb5e43e1a1665ae0e5",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/037-manifest-authoritative.md",
      "source_digest": "sha256:4ea74a174f6e55870abb766840e7cb6491a317798d36cf1f31374da159aed505",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/038-init-update-safety.md",
      "source_digest": "sha256:e42bbe574a8cb3602426aeb9c06390a7c06063894c89cbf2f2c18b1acda4ee2c",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/039-artifact-frontmatter-schema.md",
      "source_digest": "sha256:0bec2eaa72639c661aea349699dea2521ff4571567aafea4ec4c891f2360f629",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/040-checker-library-refactor.md",
      "source_digest": "sha256:9358b5f672bd18d2a97fb929be265f95e3303ebab49c7495685b36b8090e0a61",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/040-fixture-matrix-expansion.md",
      "source_digest": "sha256:e7648d65dcc96a94e208e1b1667e1e4ea9fea0d7d5926678c3e6506322cc3727",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/041-industrial-maturity-license-boundary.md",
      "source_digest": "sha256:e0f2bca4253d9a187b1b7a6fd68c93a6b3777cd0aa1b6aa5a0b2d28e3e4709bc",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/042-docs-ia-migration-command.md",
      "source_digest": "sha256:7b33f2a7dfa28dced2b0549dd88911f3abdfc0aba49ee9120bd7dafb18184886",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/100-release-evidence-adoption-entry.md",
      "source_digest": "sha256:ef9d2d9b6ee54e2ad228e126d3a939726d2f6b93565398479ddeefa1d840c55f",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/110-guided-adoption-entry.md",
      "source_digest": "sha256:71a035aa568aa2085dbd95400f7ffbb9f02a93c2277a013d14e9f87cf4eb6d37",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/120-baseline-guided-setup.md",
      "source_digest": "sha256:af270054ac4488ece25cd8a5a7c2a9e42b3bdfff390e0ba2ea7f1f32c3ffe4a6",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/130-guided-delivery-baseline.md",
      "source_digest": "sha256:7a1a0acc03a24b60dfdf439da657c9b57eee8bdf0a91edb5b483793928658acb",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/140-project-memory-context-governance.md",
      "source_digest": "sha256:a12a04a38719fcbaac4f9788afbcfec8e4453010e6a860623b5d194d5ebf68f3",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/141-160-delivery-readiness-drift.md",
      "source_digest": "sha256:e4095e1cd685cfd9b00b0c131d1edde14eccea440fbc3969e2344a3084be401a",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/170-first-delivery-walkthrough.md",
      "source_digest": "sha256:cc4d09281975a50f45b0fca2ff207d82ff5e5927135ecdedf980a31f0629dc9e",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/180-real-project-adoption-trial.md",
      "source_digest": "sha256:9f6ec83f56f8202e1aafdce1c37e96891871753e98939ad109d9b75ad0a43651",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/181-real-adoption-calibration.md",
      "source_digest": "sha256:75cfe503370f7374ed568dc2c0ff62b1640a0a36730470a44caf41d765d90110",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/190-human-decision-summary.md",
      "source_digest": "sha256:33d9827a8de06ba6e4a59f93a0fed8ca3c3c7a99eb4112f6a728839ca12f4d35",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/200-guided-decision-delivery-loop.md",
      "source_digest": "sha256:b7c824d15ddad310edcb7134be54cda59e400f0264b26112b22c2129125b3c15",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/210-governance-hardening-drift-guard.md",
      "source_digest": "sha256:2c7453eb4bb16e4590c01a3651d427414dd8860a7a6efd821c8c4ebdf2b47f2f",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/220-change-boundary-baseline-state.md",
      "source_digest": "sha256:605cb47affc514642a4a2b6742f7a9ae5821341bebeee349c8c873008ff83b9c",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/221-manifest-readme-fallback-sync.md",
      "source_digest": "sha256:12f8304cc57ea014cbab9d7811cd5a1a7388ab55b5ab51bf251e745d350a8282",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/230-baseline-pack-system.md",
      "source_digest": "sha256:c2086d27be86759be6c89d4325c0608d96ab26e774da4b1bbb905daac631e742",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "final-reports/240-standard-baseline-pack-registry.md",
      "source_digest": "sha256:97110665d6b89993df6b53a6d9d8101f43226e00d60492851004f0d6b3c995da",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "prompts/debt-handoff-agent.md",
      "source_digest": "sha256:587a1d2116ecf1f8ae40f432cefcf72bcb05ea11581e547dab917ee8a3fca020",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "prompts/release-handoff-pack-agent.md",
      "source_digest": "sha256:7efecb38d37278c63bc51f65822c592eab822e279045ece6f76ec7e4d4abfee3",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "release-recipes/backend-api-handoff.md",
      "source_digest": "sha256:ac9873f3e362984c8cd83616e5b0d04ec225d81aba5c5751e5485bb6206b1c9c",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "release-recipes/mini-program-review-handoff.md",
      "source_digest": "sha256:ba7e56093ede50b1a2543125e952ff5028b2763a80417a7dd9a2988a6540a23e",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/034-baseline-freeze-self-ci.md",
      "source_digest": "sha256:51fe650f6de0c78553526ed44a5ba15c077fdead9074195c3ad1b0dd52173006",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/035-readonly-manifest.md",
      "source_digest": "sha256:9d5de748e0cd5a7524030dde45e7d25daad195bae82dc4bd0f2a2f262c763a0b",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/036-cli-front-door.md",
      "source_digest": "sha256:06f22ed9829d38b519be3c6b58e29777fd155239dfa8212f0849ca6741531046",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/037-manifest-authoritative.md",
      "source_digest": "sha256:fcd91c254660c1af8e1d333798b02b70d5ddd79faaf79aff9fa4884519ae65b4",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/038-init-update-safety.md",
      "source_digest": "sha256:5290f117d7e28e93f9e8e676f721a29b83f9d7723a0dce6cecdd7c93aa82bc00",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/039-artifact-frontmatter-schema.md",
      "source_digest": "sha256:dc7a6b735ff25c24da6936d0013fae5fa44867d3b76977d96714611ae5b106aa",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/040-checker-library-refactor.md",
      "source_digest": "sha256:fbbb39667f61da82cb17c2e5064aa77d02c14cc651d427d570be375af4bfbe6b",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/040-fixture-matrix-expansion.md",
      "source_digest": "sha256:c164426e026ed2b944a3ffe19bbf52c391d07b145446b70a2cb60cfd8cab06c2",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/041-industrial-maturity-license-boundary.md",
      "source_digest": "sha256:b9e21575079e00f0b87d6b0ce475b372850d52639be833e100c04ee358e28cc8",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/042-docs-ia-migration-command.md",
      "source_digest": "sha256:520ea498e6e100b85cb51c8dab23469ae58977c0b0fe249daa6b31831828b194",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/100-release-evidence-adoption-entry.md",
      "source_digest": "sha256:232d2d204339da222d1b6f3edc0ecc625b50d6ded25184b0f7f05b5495078816",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/109-project-entry-adoption-trust-hardcut.md",
      "source_digest": "sha256:61a2127adb6990f97f88674f046e70be70f22fec89bc750747b5fdbdc6844841",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/110-guided-adoption-entry.md",
      "source_digest": "sha256:012cf6061f12012fc4592b77b57dfaa5685e02c256a78a7da0d98da5afa01f42",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/120-baseline-guided-setup.md",
      "source_digest": "sha256:ad968c43ef3df459dac0df4000b2d679f6edfc79e78bf8d3dc54828527e9a1ba",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/130-guided-delivery-baseline.md",
      "source_digest": "sha256:1ab559aeec0ca63a3b5e945c2c846d99cfcac76b5465e9a15c640abefb268827",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/140-project-memory-context-governance.md",
      "source_digest": "sha256:c72dd242a8bf02cafe083383588f4c7aa5ff3fb1cfedee76bc8666ee13547c1a",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/170-first-delivery-walkthrough.md",
      "source_digest": "sha256:b582b199ff8707a9298f814b45d175736f779188c4a901648bca90900f403a0a",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/180-real-project-adoption-trial.md",
      "source_digest": "sha256:072dd0177f37ce87ca5f0cd87340f963474e76c0d205ada5edbb3d393d1b1c7b",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/181-real-adoption-calibration.md",
      "source_digest": "sha256:bd5a94056fafa1b2a0803998d2f75b046e2580851bc37aa627575b5a42c6973c",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/190-human-decision-summary.md",
      "source_digest": "sha256:f50858d084a0b3afd0ef9bb38d466dd7a6a6050e19df599df8280bfd25676a0f",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/200-guided-decision-delivery-loop.md",
      "source_digest": "sha256:050300194811189027cdb7915405a6ec9071790f702ad61fbf30b3f691761745",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/210-governance-hardening-drift-guard.md",
      "source_digest": "sha256:33cd4864a64137b06ec284620b254d4a994dd0f1cc97ebc68f6bae8e94755208",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/220-change-boundary-baseline-state.md",
      "source_digest": "sha256:295e04a9b77975ae5b55eb179009351dc998030361d4c0005739f756724fb721",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/221-manifest-readme-fallback-sync.md",
      "source_digest": "sha256:4b577efa4adabf86c2890d6913db26c01ffaa1fe0a057b4c88e2bcb5bf9a2902",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/230-baseline-pack-system.md",
      "source_digest": "sha256:cc5756bc3c7c470dc5f83a79a15e664c58003e5865e56058385c816b09845112",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "tasks/240-standard-baseline-pack-registry.md",
      "source_digest": "sha256:504f5d35768dffd91563c63b7d7d2a7e6f50d23e271c5dc48346fc322b3a4136",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "templates/customer-handoff.md",
      "source_digest": "sha256:efa137e38e29eb229cf083bff7342b2efedcbcc044d3377445f94ba54179b1a3",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "templates/debt-knowledge-handoff-report.md",
      "source_digest": "sha256:288a7cae7f933bf4044f1d1c49f05e3c1581e0a7921d881719d96892b0696905",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "templates/follow-up-proposal.md",
      "source_digest": "sha256:9623e52427c2c64ce3addcb607b9b97b014d19c44eb73e9a4f5c7cc602ab5768",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "templates/release-handoff-pack.md",
      "source_digest": "sha256:bf85e933ec72746a293564443d46c6d42534175b9b3f430ed11f421cf236aa4b",
      "disposition": "ARCHIVE_SOURCE_ONLY",
      "target_queue_state": "N/A",
      "reason": "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task."
    },
    {
      "source_item": "work-queue/109-project-entry-adoption-trust-hardcut.md#109",
      "source_digest": "sha256:962fe2e0a1289357a7efb259ed0336bde2b392f120dbb12ad0b05e09ba5bf3df",
      "disposition": "MARK_DONE_WITH_EVIDENCE",
      "target_queue_state": "DONE",
      "reason": "Preserve the exact completed task as non-executable history."
    },
    {
      "source_item": "work-queue/109-project-entry-adoption-trust-hardcut.md#110",
      "source_digest": "sha256:8a35387abd2b05399e5e5c1edc6841a2bc556732cd7c010bca2db140ee8cefd7",
      "disposition": "MARK_DONE_WITH_EVIDENCE",
      "target_queue_state": "DONE",
      "reason": "Preserve the exact completed task as non-executable history."
    },
    {
      "source_item": "work-queue/113-cross-domain-trust-closure.md#WQ-001",
      "source_digest": "sha256:bc8218d395b58978959361ba5cee250467a6fb0fb6dfedf99137c896cbfb11f2",
      "disposition": "MARK_DONE_WITH_EVIDENCE",
      "target_queue_state": "DONE",
      "reason": "Preserve the exact completed task as non-executable history."
    },
    {
      "source_item": "work-queue/114-check-intentos-modularity.md#WQ-114-CHECK-INTENTOS-MODULARITY",
      "source_digest": "sha256:ae5c508032628da46bec46969e6659031e2acd55d74e7e4c28e186150a84d6ee",
      "disposition": "MARK_DONE_WITH_EVIDENCE",
      "target_queue_state": "DONE",
      "reason": "Preserve the exact completed task as non-executable history."
    },
    {
      "source_item": "work-queue/114-work-queue-state-transition-governance.md#WQ-114-TRANSITION",
      "source_digest": "sha256:d6834044edd188e410dee930dcfc80452f0a9cd634e414af332234f0cf149664",
      "disposition": "MARK_DONE_WITH_EVIDENCE",
      "target_queue_state": "DONE",
      "reason": "Preserve the exact completed task as non-executable history."
    },
    {
      "source_item": "work-queue/115-init-project-modularity.md#WQ-115-INIT-PROJECT-MODULARITY",
      "source_digest": "sha256:919821214dfb87553da0f87caff47f421c8362c16e4faedd7522885b115d8009",
      "disposition": "MARK_DONE_WITH_EVIDENCE",
      "target_queue_state": "DONE",
      "reason": "Preserve the exact completed task as non-executable history."
    },
    {
      "source_item": "work-queue/116-new-workflow-item-modularity.md#WQ-116-NEW-WORKFLOW-ITEM-MODULARITY",
      "source_digest": "sha256:ce303366fdf103c5b35da1bf675e0d300447dec27294f416b05bb05c2c00b244",
      "disposition": "MIGRATE_CURRENT",
      "target_queue_state": "CURRENT",
      "reason": "Map the exact current task into the governed queue projection without replacing project task authority."
    }
  ],
  "queue_items": [
    {
      "item_id": "WQ-001",
      "state": "DONE",
      "title": "Project Entry And Behavior-Complete Adoption Trust Hardcut",
      "source_item": "work-queue/109-project-entry-adoption-trust-hardcut.md#109",
      "source_item_digest": "sha256:962fe2e0a1289357a7efb259ed0336bde2b392f120dbb12ad0b05e09ba5bf3df",
      "task_governance_ref": "N/A",
      "task_governance_digest": "N/A",
      "task_governance_binding_status": "N/A",
      "execution_review_eligible_after_task_governance": "No",
      "execution_eligible": "No",
      "reason": "Not execution permission until promoted and governed."
    },
    {
      "item_id": "WQ-002",
      "state": "DONE",
      "title": "Control Effectiveness",
      "source_item": "work-queue/109-project-entry-adoption-trust-hardcut.md#110",
      "source_item_digest": "sha256:8a35387abd2b05399e5e5c1edc6841a2bc556732cd7c010bca2db140ee8cefd7",
      "task_governance_ref": "N/A",
      "task_governance_digest": "N/A",
      "task_governance_binding_status": "N/A",
      "execution_review_eligible_after_task_governance": "No",
      "execution_eligible": "No",
      "reason": "Not execution permission until promoted and governed."
    },
    {
      "item_id": "WQ-003",
      "state": "DONE",
      "title": "IntentOS 1.113 cross-domain trust closure",
      "source_item": "work-queue/113-cross-domain-trust-closure.md#WQ-001",
      "source_item_digest": "sha256:bc8218d395b58978959361ba5cee250467a6fb0fb6dfedf99137c896cbfb11f2",
      "task_governance_ref": "N/A",
      "task_governance_digest": "N/A",
      "task_governance_binding_status": "N/A",
      "execution_review_eligible_after_task_governance": "No",
      "execution_eligible": "No",
      "reason": "Not execution permission until promoted and governed."
    },
    {
      "item_id": "WQ-004",
      "state": "DONE",
      "title": "Modularize the IntentOS self-check entry",
      "source_item": "work-queue/114-check-intentos-modularity.md#WQ-114-CHECK-INTENTOS-MODULARITY",
      "source_item_digest": "sha256:ae5c508032628da46bec46969e6659031e2acd55d74e7e4c28e186150a84d6ee",
      "task_governance_ref": "N/A",
      "task_governance_digest": "N/A",
      "task_governance_binding_status": "N/A",
      "execution_review_eligible_after_task_governance": "No",
      "execution_eligible": "No",
      "reason": "Not execution permission until promoted and governed."
    },
    {
      "item_id": "WQ-005",
      "state": "DONE",
      "title": "Append-only Work Queue state transition governance",
      "source_item": "work-queue/114-work-queue-state-transition-governance.md#WQ-114-TRANSITION",
      "source_item_digest": "sha256:d6834044edd188e410dee930dcfc80452f0a9cd634e414af332234f0cf149664",
      "task_governance_ref": "N/A",
      "task_governance_digest": "N/A",
      "task_governance_binding_status": "N/A",
      "execution_review_eligible_after_task_governance": "No",
      "execution_eligible": "No",
      "reason": "Not execution permission until promoted and governed."
    },
    {
      "item_id": "WQ-006",
      "state": "DONE",
      "title": "Modularize the IntentOS project initialization entry",
      "source_item": "work-queue/115-init-project-modularity.md#WQ-115-INIT-PROJECT-MODULARITY",
      "source_item_digest": "sha256:919821214dfb87553da0f87caff47f421c8362c16e4faedd7522885b115d8009",
      "task_governance_ref": "N/A",
      "task_governance_digest": "N/A",
      "task_governance_binding_status": "N/A",
      "execution_review_eligible_after_task_governance": "No",
      "execution_eligible": "No",
      "reason": "Not execution permission until promoted and governed."
    },
    {
      "item_id": "WQ-007",
      "state": "CURRENT",
      "title": "Modularize the IntentOS workflow-item generator",
      "source_item": "work-queue/116-new-workflow-item-modularity.md#WQ-116-NEW-WORKFLOW-ITEM-MODULARITY",
      "source_item_digest": "sha256:ce303366fdf103c5b35da1bf675e0d300447dec27294f416b05bb05c2c00b244",
      "task_governance_ref": "task-governance-reports/116-new-workflow-item-modularity.md",
      "task_governance_digest": "sha256:35c031b840c9c248aede17f2150235e174c0038a1f0d4a0b81ea8c451a07df73",
      "task_governance_binding_status": "VERIFIED",
      "execution_review_eligible_after_task_governance": "Yes",
      "execution_eligible": "Yes",
      "reason": "The exact current Task Governance report and intent digest were verified by the public takeover resolver."
    }
  ],
  "readiness": {
    "takeover_ready": "Yes",
    "takeover_review_ready": "Yes",
    "can_codex_write_now": "No",
    "can_execute_from_old_todo_directly": "No",
    "blocked_by": []
  },
  "boundaries": {
    "writes_target_files": "No",
    "deletes_old_task_sources": "No",
    "approves_implementation": "No",
    "approves_completion": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "claims_full_adoption": "No",
    "installs_native_assets": "No"
  },
  "outcome": "MAPPED_EXISTING_SYSTEM"
}
```

## Outcome

`MAPPED_EXISTING_SYSTEM`
