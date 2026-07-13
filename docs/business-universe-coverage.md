# Business Universe Coverage

Some tasks look finished because the most obvious path works, while another
source, lifecycle branch, or real generation path was never handled. IntentOS
uses Business Universe Coverage internally to catch that class of omission.

The user does not choose categories, commands, environments, or test tools.
Codex automatically:

1. reads the current task and project;
2. decides whether a structural omission risk is actually evidenced;
3. maps relevant classes, origins, participants, paths, lifecycle branches,
   selection points, and derived relationships;
4. separates real project behavior from fixtures, seeds, mocks, and manual
   examples;
5. creates stable scenario IDs and positive plus negative or reverse
   verification obligations;
6. prevents completion when any required scenario disappears downstream.

For deep repositories, Codex scans in deterministic segments. If a bounded run
is interrupted, the next run resumes from the exact inventory, cursor, candidate
set, and state digest. A changed project boundary or edited resume record is
rejected instead of silently restarting or claiming coverage.

Verification placement is derived from project paths and active profiles. A Web
or mobile scenario is not converted into a backend obligation; API, cloud
function, worker, storage, and UI paths remain separate when project evidence
shows they are separate.

This is conditional. A documentation edit or a bounded non-behavioral change
does not create an empty report. An uncertain technical scan makes Codex keep
inspecting; it does not make the user classify the system.

The normal entry remains natural language:

```bash
node scripts/cli.mjs work <project> --intent "<business goal>"
```

Maintainers may inspect the internal read-only evidence:

```bash
node scripts/cli.mjs business-universe <project> --intent "<business goal>"
node scripts/cli.mjs business-universe-check <project> --require-structured-evidence --require-ready
```

Business Universe Coverage does not authorize implementation or release and
does not replace Business Rule Closure, testing, or the final finish decision.

When Challenger review is required, its structured evidence must name the
current task and intent, the current discovery-boundary digest, and every
current coverage scenario ID and digest exactly once. A generic reviewer PASS
or a result from another task cannot satisfy the gate.
