# Known Limitations: 1.11.0

## Human Summary

1.11.0 strengthens source governance and release checks, but it does not turn the kit into a production-validated delivery platform.

## Limitations

- Manifest reverse drift uses explicit source patterns and manifest coverage; it is not a full semantic inventory system.
- Structured release checks verify meaningful section bodies, but they cannot prove the claims are true without evidence review.
- Direct init can still be forced with `--force-new-project`; the flag is intentionally explicit and should be used only for intentionally new project directories.
- Real CODEOWNERS are still not added because maintainer handles require a human ownership decision.
- Industrial packs remain `draft`.
- No automatic external reviewer, GPT/API hook, or real-project scanner is added.

## Recommended Follow-up

- Decide real CODEOWNERS when maintainer handles are ready.
- Consider splitting manifest groups into clearer source and target naming in a future release.
- Continue collecting real-project adoption evidence before promoting industrial packs.

