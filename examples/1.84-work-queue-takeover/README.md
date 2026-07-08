# 1.84 Work Queue Takeover Examples

These examples show how IntentOS handles old-project task records before task execution.

- `reliable-existing-system`: a project already has a reliable Work Queue, so IntentOS maps it instead of duplicating it.
- `messy-todo-migration`: old TODO records are migrated into an IntentOS Work Queue proposal.
- `missing-task-system`: no reliable task source exists, so IntentOS recommends establishing a new Work Queue.
- `unsafe-dirty-project`: unsafe signals block takeover.

The reports are non-authorizing. They do not approve implementation, completion, commit, push, or release.
