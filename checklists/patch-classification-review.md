# Patch Classification Review Checklist

- Is the repair scale one of the approved types?
- Is `SAFE_LOCAL_FIX` narrow and free of API, DB, auth, permission, release, env, migration, dependency, production, gate, schema, or contract impact?
- If governed surfaces are touched, is the type escalated away from `SAFE_LOCAL_FIX`?
- Does the report explain why not another type?
- Does it state whether the patch could hide a root cause?
- Does it state whether the patch could weaken a gate?
- Does it record rollback or recovery impact?
- Are affected baselines and surfaces explicit?
- Are required evidence and verification steps explicit?
- Are human decisions listed when risk or authority is unclear?
- Does the report say patch classification does not authorize implementation?
- Is `DO_NOT_PATCH` treated as a stop signal, not completed work?
