# Guided Closure Review Checklist

Use this checklist for Guided Closure Cards.

## User Experience

- The card answers whether the task can be treated as done.
- The main user-facing sections avoid internal checker names and strict flags.
- The card asks at most 3 human decisions by default.
- Any high-risk case asks at most 5 decisions.
- The recommended next step is a single clear action.

## Evidence

- The card records what was checked.
- The card records changed-file count when available.
- The card records whether verification was provided.
- The card records whether impact coverage and execution closure reports were found.
- Technical details may mention internal checks, but they must not become user instructions.

## Boundaries

Confirm the card does not:

- write target files;
- authorize apply;
- approve implementation;
- approve commit or push;
- approve release or production;
- modify CI or hooks;
- change task state;
- forgive debt;
- replace Review Loop;
- replace Safe Launch;
- approve high-risk domain decisions.
