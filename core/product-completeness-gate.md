# Product Completeness Gate

Product Completeness Gate answers one product question:

```text
Is this first version usable enough for a local demo, internal trial, release review, or is it blocked?
```

It complements Delivery Path. Delivery Path explains project progress; Product Completeness checks whether the product itself has the minimum pieces a user can try.

## Required Surfaces

- target user;
- core flow;
- screen, API, or data surface;
- permission and risk boundary;
- empty and error states;
- local run or demo instructions;
- verification evidence;
- explicit smoke or demo evidence when available;
- trial or handoff instructions;
- feedback, logging, or issue capture path;
- next version backlog.

## States

- `IDEA_ONLY`
- `FIRST_SLICE_DEFINED`
- `RUNNABLE_MVP`
- `INTERNAL_TRIAL_READY`
- `RELEASE_REVIEW_NEEDED`
- `BLOCKED`

## Boundary

Product Completeness Gate does not approve production release, replace Safe Launch, certify legal/security/privacy/compliance, or prove real-user adoption.
