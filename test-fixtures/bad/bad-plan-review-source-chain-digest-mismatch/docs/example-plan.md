# Implementation Plan

Intent: allow authorized users to delete eligible draft records.

Permission and authorization:
- `record.write:OWN` can delete only the actor's own eligible draft record.
- `record.lifecycle.manage:ALL` can delete any eligible draft record.
- Platform admin does not gain business delete authority unless the project
  grants that business capability.
- Unauthorized actors receive a non-existence style `404` before lifecycle
  detail checks, covering existence leakage and error priority.

Data-destructive guards:
- Non-draft records cannot be deleted.
- Draft records with workflow history cannot be deleted.
- Draft records with settlement, payment, submission, import, or schedule
  history cannot be deleted.
- An audit record is written before delete.

Frontend/backend consistency:
- Frontend buttons use backend capability flag.
- Backend remains authoritative even if the button is hidden.

Verification:
- Use project-native static command review for `npm run verify`.
- Add later Test Evidence for positive, negative, role, lifecycle, and
  regression cases.

