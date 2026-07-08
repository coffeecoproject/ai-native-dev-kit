# IntentOS 1.84.0 Known Limitations

1.84.0 normalizes old-project task entry. It is not a task execution system.

## Limitations

- It does not implement, test, or complete tasks.
- It does not prove a migrated `CURRENT` task has passed Task Governance. That
  connection is reserved for 1.85.
- It does not delete, rewrite, archive, or clean old TODO/session files.
- It does not install `.intentos/` into existing projects.
- It does not replace `AGENTS.md`, project-native task systems, issue trackers,
  CI, release rules, or production processes.
- It uses heuristic source discovery for markdown-based task records.
- It treats unsafe signals conservatively and may block takeover until a human
  or project owner clarifies the source state.

## Compatibility

Existing 1.22 Work Queue records remain valid. 1.84 adds a takeover layer before
Work Queue becomes the future task authority for an old project.
