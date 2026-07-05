# FAQ

## Is this just a prompt pack?

No. It is a workflow kit: docs, templates, checks, CLI entry, migration plan support, and adoption playbooks.

## Can I use it for existing projects?

Yes, but do not force full adoption at the start. Read project state first, map existing governance, and only add assets after a reviewed decision.

## Can I use it for Web, iOS, Android, and WeChat Mini Program?

Yes. The core workflow is platform-neutral. Platform profiles and industrial packs add project-specific engineering expectations.

## Does it replace my Web or iOS baseline files?

No. The workflow is the governance layer. Platform baselines are selected inputs. If a project already has strong baselines, map them instead of overwriting them.

## Do I need Goal Card every time?

No. Use Goal Card when the route, risk, or audit trail matters. Small low-risk work may use lighter project policy.

## Do I need subagents every time?

No. Subagent Orchestration is only needed when helper agents are used or an L3 task requires explicit orchestration evidence. If no helper is launched, mark helper roles as `SKIPPED`.

## Is Review Loop every edit or every task?

Review Loop is normally task-completion review, not every edit. L2/L3 work requires it. L0/L1 may use a lighter review path.

## How does GPT Pro participate?

The kit can prepare a Review Packet and a GPT review prompt. Without API automation, a human may send that packet to GPT Pro and return findings to Codex. Reviewer output is read-only input; Codex only fixes bounded AUTO_FIX findings.

## Can migration be fully automatic?

Not in 0.42.0. `migrate` only produces a dry-run or JSON plan. Direct apply needs a later reviewed phase and human decision.

## What about enum vs string, DTO/domain boundaries, and code structure?

Those belong in Engineering Baseline. The IntentOS provides the governance file and checker; each platform/project supplies the concrete source of truth.

## Are industrial packs production-ready?

Not by default. Packs have maturity stages. Current concrete packs are treated conservatively unless real evidence promotes them.

## Can this be used commercially?

The repository is licensed under CC BY-NC 4.0. Commercial use, resale, paid redistribution, or consulting/service delivery use requires prior written permission. See `LICENSE.md`, `LICENSE-FAQ.md`, and `LICENSE-COMMERCIAL.md`.
