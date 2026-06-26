# Request Card: Legacy Frontmatter Warning

## Raw Request

Legacy request artifacts without frontmatter should still pass with a warning by default.

## User / Customer

Fixture maintainer.

## Problem

Older workflow artifacts do not start with schema-backed metadata.

## Desired Outcome

The default checker reports a migration warning without failing.

## Constraints

- Do not require strict schema unless `--strict-schema` is passed.

## Priority

P1

## Suggested Task Level

L1
