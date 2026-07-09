# Release Channel Decoupling

Release Channel Decoupling separates Git source identity from release execution.

Git and GitHub can remain the source and evidence system. They must not be
silently treated as the release package store, release executor, long-lived
artifact channel, or production approval system.

## What It Decides

- whether Git tags are only source identity or release triggers;
- whether GitHub Releases are unused, notes-only, asset-channel review required,
  or allowed with owner policy;
- whether GitHub Actions artifacts are short-lived handoff evidence or unsafe
  long-lived release package storage;
- whether an existing provider, registry, app-store, mini-program, server, or
  package release path should be preserved;
- whether release owner, cost owner, retention, rollback, and package identity
  evidence is missing.

## What It Does Not Do

Release Channel Decoupling does not approve release, execute release, upload
GitHub Release assets, run GitHub-hosted release workflows, delete artifacts,
change CI, change production, or touch secrets.

## New Projects

New projects default to GitHub as source and evidence repository only. Release
packages, platform uploads, production release, and long-lived artifacts remain
external release-owner decisions.

## Existing Projects

Existing projects are read first. Safe existing release SOPs are preserved and
mapped. Unsafe or unclear GitHub Release assets, Actions artifacts, tag-triggered
release workflows, provider deploys, registries, or server release scripts are
blocked until owner, cost, retention, and production-side-effect evidence exists.

