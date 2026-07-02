# Known Limitations

- 1.53 does not migrate existing Guided Closure Cards or Execution Closure Reports into Closure Decision records.
- The resolver uses conservative signals and may ask for evidence when a human already knows the task is complete.
- `DONE` means complete for the current workflow scope. It is not commit, push, release, production, or launch approval.
