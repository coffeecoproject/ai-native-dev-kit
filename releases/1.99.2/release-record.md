# IntentOS 1.99.2 Release Record

## Theme

Review Context Enforcement.

## Human Summary

IntentOS now fails closed when an unregistered semantic source tries to define
current product direction. Registered public, reviewer, GPT, and Agent guidance
is checked for direct contradictions to the zero-experience solo operating
contract.

New Review Packets and GPT review prompts also carry one current contract ID,
version, and digest. The binding identifies the context used for review; it is
not technical approval and does not duplicate execution evidence.

## Delivered

- `UNCLASSIFIED` fallback for unknown context sources;
- explicit active-guidance registry for public, reviewer, GPT, Agent, and
  current core guidance;
- deterministic `CONFLICTING` classification for direct positive assertions
  that restore user technical choices, multi-person modes, industrial-team
  requirements, internal-owner delegation, or universal current-user external
  authority;
- stable review-context contract ID and digest;
- automatic binding for newly generated Review Packets and GPT review prompts;
- current-binding validation with legacy no-binding compatibility;
- generated-project creation and installed-checker coverage;
- current Chinese public-entry wording aligned with the solo operating model.

## Preserved Safety

- no Solo/Team/Enterprise mode or context was added;
- historical records remain readable and auditable;
- compatibility schemas remain unchanged;
- execution evidence retains its existing task, intent, project, Git, source,
  approval, apply, completion, and release identity chains;
- implementation, apply, release, production, provider, and external authority
  remain unchanged.

## Evidence Status

The source checker validates explicit path classification, registered guidance
presence, direct conflict regressions, template bindings, prompt contracts, and
bounded current-user authority. Repository self-check initializes a disposable
project, runs the installed checker, generates both review-input types, and
validates their bindings against the installed authority registry. Final
release claims require the focused tests, Manifest check, repository self-check,
full verification suite, and diff check to pass on the same source snapshot.

## Known Limitations

Conflict scanning is deterministic and covers supported direct assertions; it
does not prove all natural-language guidance semantically correct. Legacy review
inputs without a context binding remain readable for audit compatibility, but
they cannot claim explicit current-context binding. Existing owner-like schema
fields remain compatibility vocabulary. See
[known-limitations.md](known-limitations.md).

## Allowed Claims

- Unknown semantic sources do not automatically receive current product
  authority.
- Registered active guidance is checked for supported direct contradictions.
- Newly generated review inputs identify the exact current context contract.
- Generated projects receive and execute the same context enforcement.

## Forbidden Claims

- Deterministic conflict detection does not prove all prose semantically valid.
- A context binding is not implementation, apply, release, or production
  approval.
- A legacy review packet without binding is not newly context-bound.
- This release does not add organization modes or a second evidence system.

## Verification

- `node scripts/check-review-context-authority.mjs`
- `node --test tests/review-context-authority.test.mjs`
- generated-project review-input binding smoke test in repository self-check
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `npm run verify`
- `git diff --check`

See [known-limitations.md](known-limitations.md) and
[self-check-report.md](self-check-report.md).
