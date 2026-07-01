# MVP CLI Note Tool

## Original User Goal

I want a tiny note-taking tool that can add a note and show an empty state.

## Run

```bash
npm test
node src/cli.mjs help
node src/cli.mjs add "call customer"
node src/cli.mjs list
```

## Verify

`npm test` checks the help command, add command, list command, empty-state output, and writes structured local evidence to `evidence/smoke-output.json`.

## Boundary

This is local demo evidence only. It does not persist real data, prove real-user adoption, approve production, or authorize future apply.
