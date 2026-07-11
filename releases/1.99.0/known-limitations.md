# IntentOS 1.99.0 Known Limitations

- IntentOS can infer technical requirements but cannot invent product policy or
  business facts absent from project evidence.
- Legal, tax, compliance, and provider facts may require information from
  outside the repository. Only the dependent capability or claim remains
  blocked while unaffected engineering continues.
- `CURRENT_CONVERSATION_USER` records that the current user explicitly supplied
  consent in the active interaction; IntentOS does not cryptographically
  authenticate an external legal identity.
- Real provider, app-store, production, billing, messaging, and data state must
  be verified at the external boundary before claiming the effect occurred.
- Optional team or organization mappings may be read from project evidence, but
  they are not the default user model and are not required for solo use.
