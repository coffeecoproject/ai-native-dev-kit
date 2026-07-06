# Known Limitations 1.77.2

- Test Evidence Binding still records and checks evidence; it is not a test runner.
- Schema `1.77.1` is the explicit schema identity for the stricter 1.77.1 Test Evidence report shape.
- Older Test Evidence reports that still use schema `1.77.0` should be regenerated or migrated before strict checks are used.
- The checker can prove refs, digests, task binding, test-control coverage, and Markdown/JSON reason consistency, but it cannot prove product correctness by itself.
- Manual verification still depends on accountable human owners and decision records.
- Execution Assurance does not require Test Evidence by default in this patch.
- Existing projects may need their own test command conventions mapped before Test Evidence reports become useful.
