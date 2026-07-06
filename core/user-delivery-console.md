# User Delivery Console

User Delivery Console is a plain-language status layer for ordinary users.

It answers:

- What are we building first?
- Where is the work now?
- Can the current task be treated as done?
- Can the product move toward launch review?
- What is missing?
- What does Codex need from the user?
- What can Codex safely do next?

## Position

User Delivery Console is a derived view only.

It does not replace:

- First Slice;
- Business Rule Closure;
- Change Impact Coverage;
- Verification Plan;
- Test Evidence;
- Execution Assurance;
- Completion Evidence;
- Product Completeness;
- Launch Review;
- Release Plan;
- Release Execution.

Those source systems remain authoritative for their own domain.

## User-Facing Rule

The first half of the card must be understandable without knowing IntentOS
internal artifact names.

Use plain translations:

- need is clear / not clear;
- affected areas checked / not checked;
- verification list ready / missing;
- check evidence recorded / missing;
- final completion record passed strict checks / not passed;
- execution proof recorded / missing;
- task can / cannot be treated as done;
- can / cannot move toward launch review.

Technical names may appear only in Technical Trace.

## Authority Boundary

A User Delivery Console card does not:

- write target files;
- authorize apply;
- approve implementation;
- approve commit or push;
- approve release or production;
- change CI or hooks;
- replace lower-level evidence systems;
- prove real-user stability;
- approve security, privacy, compliance, payment, permission, migration, legal,
  tax, finance, or production-risk decisions.

## Required Close-Out

If Codex uses this card as a final user-facing answer, it must still cite the
lower-level evidence state when claiming work is done.

No final task-completion claim is allowed without a valid lower-level completion
evidence chain that passes strict Completion Evidence checks and matches the
current request intent.
