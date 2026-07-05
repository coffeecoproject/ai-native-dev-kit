# 1.73.0 Known Limitations

## External Naming

The repository hosting name and any package publishing identity are external
systems. IntentOS can document the desired naming, but repository rename or
package publish requires explicit human approval and external execution.

Recommended external identity:

```text
GitHub repository: coffeecoproject/intentos
Package name: intentos
CLI command: intentos
```

## Existing Projects With Older Generated Assets

Existing projects may still contain older generated workflow assets. 1.73.0
does not silently move those files.

Required handling:

```text
detect -> plan -> approve -> migrate -> verify
```

Until migration is approved and verified, those projects should be treated as
pending naming migration rather than fully migrated.

## Historical Evidence

Some historical records may describe earlier names or transition states. Those
records are release evidence, not active product identity.

Active public usage must use IntentOS.

## No Production Authority

1.73.0 does not grant Codex permission to deploy, publish, submit, migrate,
rename external repositories, publish packages, mutate CI/hooks, touch secrets,
change provider settings, or approve production release.
