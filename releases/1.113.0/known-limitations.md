# IntentOS 1.113.0 Known Limitations

- The P0/P1 findings promoted by the 1.112 audit are closed, but passing the
  current suites does not prove absolute business, security, legal, or
  production correctness.
- Platform providers, stores, hosting systems, payment systems, production
  data, and other real-world systems remain external authorities. IntentOS can
  prepare and verify bounded evidence; it cannot silently authorize their
  effects.
- Historical Completion and Release Evidence remains readable for audit
  compatibility but is not current readiness authority.
- `VERIFIED_BOUNDED` release-execution and governed-evolution edges preserve
  deliberate authority boundaries; they are not claims that IntentOS controls
  every external system or automatically promotes governance changes.
- Process-interruption recovery is verified for the supported local
  filesystem transaction model. A post-crash third-party change causes a
  fail-closed recovery block rather than destructive overwrite.
- The bounded local Verification Runtime proves current-candidate identity,
  lifecycle replay, run-owned process and path isolation, observed output, and
  cleanup for supported adapters. It does not provide an operating-system
  network namespace, hardware-backed attestation, or an external signature.
  A hostile candidate able to rewrite every local checker and evidence file
  still requires an isolated external runner or independently signed evidence;
  local Runtime Trust must not be presented as protection against that threat.
- Existing projects may retain stronger compatible project-native rules.
  IntentOS reconciles and consumes them; it does not erase proven governance
  merely for uniform naming.
- Request-bound automatic apply is limited to an exact reversible local
  governance graph. Legacy explicit-approval records remain readable for
  compatibility and concrete external-effect consent, but are not required for
  internal technical choices covered by the request-bound path.
- Repository information architecture and distribution structure remain as-is
  in 1.113. Broad structural governance is reserved for 1.114 and requires a
  separate plan, migration proof, and compatibility review.
- The nine domains and nineteen edges are maintainer audit views. They are not
  concepts a zero-experience user must select or operate.
