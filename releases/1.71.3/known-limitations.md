# 1.71.3 Known Limitations

- `--out` writes only an explicitly requested report file. It is not a general apply mechanism.
- Adoption Assurance can verify recorded workflow adoption evidence, but it does not prove the target product is correct or production-ready.
- `VERIFIED_ACTIVE` means IntentOS is the active working mode; release, production, data, security, compliance, payment, and business authority still remain project-owned.
- The checker validates evidence shape and consistency. It does not validate real human identity, external-system state, provider dashboards, or production incidents.
- Older 1.71.2 Adoption Assurance reports should be regenerated or migrated before strict 1.71.3 checks are used.

