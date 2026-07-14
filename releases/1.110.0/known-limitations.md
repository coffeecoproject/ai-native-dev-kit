# IntentOS 1.110.0 Known Limitations

- IntentOS validates recorded control evidence; the resolver and checker do
  not run arbitrary project controls or commands from evidence files.
- Full dynamic failure proof requires an existing bounded execution adapter and
  safe isolated fixture. When that proof cannot be produced safely, the claim
  remains partial or not proven.
- A proven control establishes one bounded enforcement claim only. It does not
  establish product correctness, regulatory correctness, release approval, or
  production safety.
- Control discovery is intentionally bounded to task-relevant project evidence;
  it is not a continuous monitor or exhaustive audit of every repository
  control.
- Historical evidence is not upgraded automatically to current 1.110 proof.
