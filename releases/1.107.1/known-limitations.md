# IntentOS 1.107.1 Known Limitations

- Semantic detection is deterministic and rule-based; it prevents known
  responsibility drift but cannot prove every sentence is unambiguous.
- Dynamically generated guidance must be registered as a producer to enter the
  effective-guidance graph.
- Claude and Cursor assets remain readable compatibility references only; this
  release does not test their runtime behavior or claim feature parity.
- Passing the guidance scan proves responsibility consistency, not business,
  test, security, release, provider, or production correctness.
- Exact real-world effects and unavailable external authority facts still
  require bounded evidence from outside the repository.
