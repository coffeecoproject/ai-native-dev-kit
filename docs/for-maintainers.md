# For Maintainers

This page is for people maintaining IntentOS itself, CI, release evidence, or advanced project adoption.

Most users should start with [Start Here](start-here.md).

## Primary Public Entry

```bash
node scripts/cli.mjs start <project>
node scripts/cli.mjs next <project>
node scripts/cli.mjs doctor <project>
```

## Natural-Language Evidence

```bash
node scripts/cli.mjs ask <project> "I want to build a booking app"
node scripts/cli.mjs guide <project> --deep --intent "add paid booking"
```

## Completion And Release Views

```bash
node scripts/cli.mjs finish <project> --intent "finish booking validation" --verification "npm run verify passed"
node scripts/cli.mjs release-guide <project> --intent "help me launch"
node scripts/cli.mjs release-plan <project> --intent "help me launch"
```

## Write Planning

```bash
node scripts/cli.mjs apply-plan <project> --intent "adopt IntentOS workflow assets"
node scripts/cli.mjs apply-readiness <project> --plan apply-plans/001-example.md
node scripts/cli.mjs approval-record-check <project>
```

## Existing Project Adoption

```bash
node scripts/cli.mjs workflow-map <project>
node scripts/cli.mjs native-migration <project>
node scripts/cli.mjs reconcile-rules <project>
```

## Release Evidence

```bash
node scripts/cli.mjs launch-view <project> --intent "prepare release review" --verification "npm run verify passed"
node scripts/cli.mjs release-adapter <project> --intent "prepare release adapter"
node scripts/cli.mjs release-recipe <project> --intent "help me launch"
node scripts/cli.mjs release-handoff <project> --intent "help me launch"
node scripts/cli.mjs release-execution <project> --intent "prepare release execution" --mode PLAN_ONLY
```

## Full Command Reference

Use [Scripts Reference](reference/scripts.md) for the complete command list.

The CLI still supports lower-level commands for debugging and exact CI references. The public front door intentionally shows fewer commands first.
