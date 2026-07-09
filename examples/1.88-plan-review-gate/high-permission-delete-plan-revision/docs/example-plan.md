# Implementation Plan

Intent: allow authorized users to delete draft records.

Scope:
- Add backend delete endpoint.
- Hide delete button for users without permission.
- Run `npm run verify`.

Missing details are intentional in this fixture: the plan has not yet explained
the unauthorized actor result, old related-record protection, or operation log
order.
