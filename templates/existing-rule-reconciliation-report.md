# Existing Rule Reconciliation Report

This is a recommendation report, not permission to change files.

## Human Summary

| Field | Value |
| --- | --- |
| Project State | `EXISTING_GOVERNED_PROJECT` |
| Can Codex write now | `No` |
| Reconciliation Authority | `RECOMMENDATION_ONLY` |
| Business Authority | `PROJECT_OWNED` |
| Production Authority | `HUMAN_OR_EXTERNAL_SYSTEM` |
| Approves Governance Replacement | `No` |
| Approves Implementation | `No` |
| Approves Release Or Production | `No` |
| Requires Apply Plan Before File Change | `Yes` |
| Recommended Next Step | Review recommendations, then prepare a Unified Apply Plan only if approved. |

## Input Evidence

| Evidence | Path | Status |
| --- | --- | --- |
| Native Migration Plan | `native-migration-plans/001-example.md` | Reviewed input |

## Rule Reconciliation Coverage

| Field | Value |
| --- | --- |
| Total Extracted Rules | `1` |
| Reconciled Rules | `1` |
| Omitted Rules | `0` |
| Truncation Warning | None |
| Blocks Selected Native Adoption | `No` |

## Existing Rule Set

| Rule Ref | Surface | Existing Rule Summary | Authority |
| --- | --- | --- | --- |
| `native-migration:R-001` | `ENGINEERING_BASELINE` | Project-specific rule | project baseline |

## IntentOS Reference Set

| Reference Ref | Surface | Reference Summary | Authority |
| --- | --- | --- | --- |
| `standard-baseline:web-runtime-standard` | `ENGINEERING_BASELINE` | IntentOS standard guidance | IntentOS reference only |

## Reconciliation Matrix

| Item ID | Surface | Existing Rule Ref | IntentOS Reference Ref | Outcome | Human Decision Required | Target Action |
| --- | --- | --- | --- | --- | --- | --- |
| `RR-001` | `ENGINEERING_BASELINE` | `native-migration:R-001` | `standard-baseline:web-runtime-standard` | `MERGE` | Yes | prepare apply-plan after approval |

## Engineering Baseline Recommendations

| Item ID | Recommendation | Reason |
| --- | --- | --- |
| `RR-001` | Prepare reviewed wording proposal | Existing wording is project-specific; IntentOS adds missing evidence wording. |

## Release / Production Recommendations

| Item ID | Recommendation | Reason |
| --- | --- | --- |
| `RR-002` | Keep existing SOP | Release rules remain project-owned. |

## Protected Constraint Handling

| Item ID | Protected Surface | Owner / Authority | Handling |
| --- | --- | --- | --- |
| `RR-003` | permission | project owner | keep existing or ask human |

## Conflicts And Human Decisions

| Conflict ID | Decision Needed | Owner | Status |
| --- | --- | --- | --- |
| `C-001` | Confirm wording before apply plan | human | Pending |

## IntentOS Adoption Recommendation

| Field | Value |
| --- | --- |
| Recommendation | `DOCS_BRIDGE` |
| Migration Depth | `DOCS_BRIDGE` |
| Confidence | `LOW` |
| Can Codex write now | `No` |
| Default Path | prepare apply plan after review |
| User Input | `NO_USER_ACTION` unless a missing business fact, prepared real-world consent, or external authority fact is identified. |

| Decision Part | Items |
| --- | --- |
| Preserve | existing project rules |
| Merge | project context docs |
| Replace After Approval | old AI workflow routing after approval |
| Blocked | production execution, secrets, CI/hook mutation without approval |

## False Positive / False Negative Notes

| Type | Note |
| --- | --- |
| false_positive | None recorded |
| false_negative | None recorded |

## Proposed Next Step

```text
Native Migration Plan
Existing Rule Reconciliation
Unified Apply Plan
Controlled Apply Readiness
Approval Record
approved governance-file edits only
```

## Boundaries

- This report writes target files: No
- This report authorizes target-file writes: No
- This report approves governance replacement: No
- This report approves implementation: No
- This report approves release or production: No
- This report modifies CI or hooks: No
- This report changes production config, secrets, migrations, payment, permissions, data, provider state, legal, tax, finance, HR, security, privacy, or compliance behavior: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.69.2",
  "evidence_profile": "existing-rule-reconciliation-1.69.2",
  "artifact_type": "existing_rule_reconciliation_report",
  "report_type": "EXISTING_RULE_RECONCILIATION",
  "project_state": "EXISTING_GOVERNED_PROJECT",
  "can_codex_write_now": "No",
  "can_recommend_apply_plan": "Yes",
  "can_recommend_apply_plan_now": "Yes",
  "can_recommend_apply_plan_after_human_review": "Yes",
  "reconciliation_authority": "RECOMMENDATION_ONLY",
  "business_authority": "PROJECT_OWNED",
  "production_authority": "HUMAN_OR_EXTERNAL_SYSTEM",
  "requires_human_approval_before_apply": "Yes",
  "existing_rule_source": [
    {
      "rule_ref": "native-migration:R-001",
      "surface": "ENGINEERING_BASELINE",
      "summary": "Project-specific rule",
      "authority": "project baseline"
    }
  ],
  "intentos_reference_source": [
    {
      "reference_ref": "standard-baseline:web-runtime-standard",
      "surface": "ENGINEERING_BASELINE",
      "summary": "IntentOS standard guidance",
      "authority": "IntentOS reference only"
    }
  ],
  "rule_reconciliation_coverage": {
    "total_extracted_rules": 1,
    "reconciled_rules": 1,
    "omitted_rules": 0,
    "truncation_warning": "None",
    "blocks_selected_native_adoption": "No"
  },
  "reconciliation_items": [
    {
      "item_id": "RR-001",
      "existing_rule_ref": "native-migration:R-001",
      "intentos_reference_ref": "standard-baseline:web-runtime-standard",
      "surface": "ENGINEERING_BASELINE",
      "surface_authority": "PROJECT_OWNED",
      "allowed_outcomes": ["KEEP_EXISTING", "MERGE", "NEEDS_HUMAN_DECISION"],
      "outcome": "MERGE",
      "reason": "Existing wording is project-specific; IntentOS adds missing evidence wording.",
      "merge_reason": "Prepare reviewed wording that preserves project-specific wording and adds IntentOS verification evidence.",
      "preserved_existing_terms": ["project-specific rule"],
      "added_intentos_terms": ["verification evidence", "apply-plan before writes"],
      "risk_surfaces": ["engineering"],
      "human_decision_required": "Yes",
      "requires_apply_chain": "Yes",
      "can_replace_existing_rule": "No",
      "target_action": "prepare apply-plan after approval"
    }
  ],
  "protected_constraints": [],
  "release_production_gaps": [],
  "conflicts": [],
  "native_adoption_decision": {
    "recommendation": "DOCS_BRIDGE",
    "migration_depth": "DOCS_BRIDGE",
    "confidence": "LOW",
    "can_codex_write_now": "No",
    "default_path": "prepare apply plan after review",
    "preserve": ["existing project rules"],
    "merge": ["project context docs"],
    "replace": ["old AI workflow routing after approval"],
    "blocked": ["production execution", "secrets", "CI/hook mutation without approval"],
    "human_confirmation": "Allow Codex to prepare a reviewable apply plan for the recommended migration path."
  },
  "proposed_next_steps": [],
  "boundary": {
    "writesTargetFiles": "No",
    "authorizesTargetFileWrites": "No",
    "approvesGovernanceReplacement": "No",
    "approvesImplementation": "No",
    "approvesReleaseOrProduction": "No",
    "modifiesCiOrHooks": "No"
  },
  "outcome": "RECONCILIATION_RECORDED"
}
```

## Outcome

`RECONCILIATION_RECORDED`
