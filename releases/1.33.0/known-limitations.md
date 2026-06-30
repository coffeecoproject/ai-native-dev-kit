# Known Limitations: 1.33.0

- Evidence-link parsing is heuristic and based on recorded markdown reports.
- `--verification-file` classifies existing output; it does not execute the command by itself.
- Review-loop evidence is required for functional/code pass, but this release does not create a unified reviewer runner.
- Change-boundary refs are read from recorded reports; full diff policy enforcement remains in the existing change-boundary layer.
- `READY_FOR_COMMIT_REVIEW` still does not authorize commit or push.
- Real production validation is still not claimed.
