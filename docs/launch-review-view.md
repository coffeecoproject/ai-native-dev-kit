# Launch Review View

Launch Review View is the user-facing answer to:

```text
Can this go live?
What blocks launch review?
```

It does not decide release by itself. It reads the current close-out state and turns it into a launch-review summary.

## How It Fits

```text
finish
  -> Unified Closure Decision
  -> Safe Launch label
  -> Launch Review View
  -> Codex prepares one exact external release action and rollback
  -> current user consents to that concrete effect
```

So the rule is simple:

- If `finish` is not `DONE`, launch review cannot be ready.
- If `finish` is `DONE`, Launch Review View checks launch-specific gaps such as consent reference, rollback, monitoring, platform review, and post-launch smoke.
- Even when the view says `READY_FOR_RELEASE_REVIEW`, it only means Codex can present one exact real-world action for consent. It is not consent or execution authority by itself.

## User Flow

For a project, Codex can run:

```bash
node scripts/cli.mjs launch-view ../my-project --intent "prepare release review" --verification "npm run verify passed"
```

To check recorded Launch Review Views:

```bash
node scripts/cli.mjs launch-view-check ../my-project
```

## What Users See

The view should answer in plain language:

- current launch review label
- why that label was chosen
- whether Unified Closure is done
- which launch surfaces are missing
- what concrete real-world effect needs current-user consent
- what evidence exists
- what the safest next step is

## What It Does Not Do

Launch Review View never:

- deploys
- submits an app or mini program review
- changes production configuration
- changes secrets, DNS, certificates, CI, hooks, payment, permissions, or migrations
- approves release
- replaces the project release SOP

## Good Use

Use this after implementation and close-out evidence exists, or when the user asks whether a version can move toward release review.

For existing production projects, use it as a read-only adapter view. Codex prepares bounded technical changes through the controlled apply chain; it asks the user only for unresolved business facts or consent to concrete production effects.
