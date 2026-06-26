---
schema_version: 1.0
number: "001"
slug: invalid-frontmatter
title: Invalid Frontmatter
status: draft
created_at: "2026-06-26"
devkit_version: 0.40.0
---
# Request Card: Invalid Frontmatter

## Raw Request

Invalid frontmatter should fail.

## User / Customer

Fixture maintainer.

## Problem

The metadata block is missing `artifact_type`.

## Desired Outcome

The checker rejects the file before relying on Markdown-only structure.

## Constraints

- Keep this fixture minimal.

## Priority

P1

## Suggested Task Level

L1
