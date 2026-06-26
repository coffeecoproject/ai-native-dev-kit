# Example: Review Loop L2 First Slice

This example shows how a single L2 task moves through Review Packet, GPT Review Prompt, Review Loop Report, Final Report, Follow-up Proposal, and plain review summary.

It is not a product template. It is a workflow dogfood example for review semantics.

The example intentionally includes:

- one `AUTO_FIX`
- one `NEEDS_HUMAN_DECISION`
- one `DIRECT_FOLLOW_UP`
- one `DO_NOT_PROCEED`

Flow:

```text
request
  -> preflight
  -> spec
  -> eval
  -> task
  -> review packet
  -> GPT review prompt
  -> review loop report
  -> final report
  -> follow-up proposal
  -> plain review summary
```

Files:

- `requests/001-review-loop-l2-slice.md`
- `preflight/001-review-loop-l2-slice.md`
- `specs/001-review-loop-l2-slice.md`
- `evals/001-review-loop-l2-slice.md`
- `tasks/001-review-loop-l2-slice.md`
- `review-packets/001-review-loop-l2-slice.md`
- `gpt-review-prompts/001-review-loop-l2-slice.md`
- `review-loop-reports/001-review-loop-l2-slice.md`
- `final-reports/001-review-loop-l2-slice.md`
- `follow-up-proposals/001-review-loop-l2-slice.md`
- `review-summaries/001-review-loop-l2-slice.md`

Expected checks:

```bash
node scripts/check-workflow-artifacts.mjs examples/review-loop-l2-first-slice --mode implementation --task tasks/001-review-loop-l2-slice.md
node scripts/check-review-loop.mjs examples/review-loop-l2-first-slice --mode implementation --task tasks/001-review-loop-l2-slice.md
node scripts/check-next-step-boundary.mjs examples/review-loop-l2-first-slice --mode implementation --task tasks/001-review-loop-l2-slice.md
```
