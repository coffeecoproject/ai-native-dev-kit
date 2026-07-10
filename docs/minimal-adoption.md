# Minimal Adoption

This is the 10-minute IntentOS path.

It is intentionally smaller than the full operator manual.

## 1. Start Read-Only

```bash
node scripts/cli.mjs start <project>
```

Read the human summary first. It should tell you:

- what kind of project this is;
- whether Codex can write now;
- which decisions are needed;
- what happens if you do nothing.

## 2. Ask For The Next Safe Step

```bash
node scripts/cli.mjs next <project>
```

Use this when you are not sure whether to initialize, continue, migrate, review, or stop for a human decision.

## 3. Check Health

```bash
node scripts/cli.mjs doctor <project>
```

Use this after setup, before important changes, or before handoff.

## New Project

For a new project, Codex should:

1. clarify the goal and first useful version;
2. derive and recommend the platform, baseline level, and concrete packs without
   asking the user to understand their internal IDs;
3. prepare an exact controlled plan before writing workflow or baseline assets;
4. build only the agreed first slice;
5. verify and close the task with evidence.

## Existing Project

For an existing project, Codex should:

1. read existing project files and rules;
2. enter IntentOS Operating Mode for planning, routing, review, and comparison;
3. compare existing rules against IntentOS references and recommend the safer,
   more complete valid rule;
4. preserve stronger project rules and plan only selected gaps;
5. prepare a reviewed controlled apply plan before workflow asset changes.

## Governed Or Production Project

For governed, dirty, or production-sensitive projects, Codex should stay read-only until the project has:

- Native Migration Plan;
- Existing Rule Reconciliation;
- Unified Apply Plan;
- Approval Record;
- Controlled Apply Readiness.

IntentOS may guide the work immediately, but it does not grant write permission.

## Do Not Start With These

Most users should not start by choosing:

- hook policy;
- industrial packs;
- BL2;
- workflow-map;
- release execution;
- low-level checkers.

Codex should route to those only when the project state requires them.
