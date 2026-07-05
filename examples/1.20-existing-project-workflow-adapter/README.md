# 1.20 Existing Project Workflow Adapter Example

This example shows how to record a workflow adoption map for a governed existing
project without claiming that IntentOS workflow assets were installed.

Use it to verify that the adapter:

- inventories existing project workflow,
- recommends IntentOS workflow usage,
- preserves existing authority,
- blocks target writes, CI changes, hook changes, implementation, release, and
  high-risk decisions.

## Check

```bash
node scripts/check-workflow-adoption-map.mjs examples/1.20-existing-project-workflow-adapter
```
