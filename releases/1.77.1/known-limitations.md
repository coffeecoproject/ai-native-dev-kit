# Known Limitations 1.77.1

- Test Evidence Binding still records and checks evidence; it is not a test runner.
- The checker can prove refs, digests, task binding, and test-control coverage, but it cannot prove product correctness by itself.
- Manual verification still depends on accountable human owners and decision records.
- Execution Assurance does not require Test Evidence by default in this patch.
- Existing projects may need their own test command conventions mapped before Test Evidence reports become useful.
