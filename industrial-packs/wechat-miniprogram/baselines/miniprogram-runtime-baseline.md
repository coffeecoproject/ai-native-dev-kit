# Mini Program Runtime Baseline

## Required Coverage

- Page lifecycle assumptions are documented for changed pages, including `onLoad`, `onShow`, `onHide`, and return-path behavior when relevant.
- Loading, empty, success, error, forbidden, and recovery states are reachable through tests, fixtures, simulator evidence, developer tool evidence, or documented manual review.
- Navigation, tab switching, back navigation, deep links, scan/share entry, and re-entry behavior are covered when touched.
- Weak network, timeout, duplicate action, and retry behavior are covered for critical flows.
- Platform capability usage is documented for changed capabilities, including camera, location, phone number, album, clipboard, subscription messages, or share behavior.

## Evidence Expectations

- Evidence must name the page or flow under review.
- Evidence must distinguish simulator/developer-tool evidence from real-device evidence when both are relevant.
- Evidence must include screenshots, logs, test output, or a clear non-applicability reason.
- Evidence must not rely on production user data or production-only credentials.

## AI Boundary

AI may draft runtime checks, fixtures, page-state notes, and evidence records inside an approved task.

AI must not claim platform behavior is release-ready without human review of runtime evidence.
