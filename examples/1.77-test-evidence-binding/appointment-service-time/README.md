# Appointment Service Time Test Evidence

This example proves the 1.77 rule:

```text
Verification Plan obligations must be covered by concrete, current, task-bound evidence.
```

The evidence files are plain command-output records with metadata lines. The Test Evidence resolver reads those files and creates a Test Evidence Report; the checker validates source binding, digests, coverage, freshness, and Markdown/JSON consistency.

The example behavior is intentionally small but executable:

- appointment submission requires a non-empty service time;
- valid requests keep the existing booking path available;
- invalid requests return the bounded message `Service time is required.`;
- the same rule is enforced by the form, API contract, and domain handler.
