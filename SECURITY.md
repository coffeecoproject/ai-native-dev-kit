# Security Policy

## Human Summary

This repository is a workflow kit, not a hosted service. Security reports should focus on repository scripts, generated project assets, workflow templates, CI examples, and documentation that could cause unsafe adoption.

## Supported Version

Security review focuses on the current default branch and the latest tagged release after `1.0.0`. Earlier pre-1.0 versions may be referenced for migration context, but they are not treated as supported production releases.

## Reporting

Report suspected security issues privately before public disclosure.

Preferred channels:

1. GitHub private vulnerability reporting or GitHub Security Advisory for this repository, when enabled.
2. A private repository owner or maintainer channel.
3. If no private channel is available, open a minimal public issue that describes impact without exposing exploit details, exploit steps, private project data, secrets, or vulnerable downstream targets.

Reports should include:

- affected file, script, template, workflow, or documentation path;
- impact summary;
- reproduction or reasoning steps that do not expose secrets;
- whether generated project assets, CI templates, release guidance, or workflow commands are affected;
- suggested severity if known.

## Response Expectations

The project does not promise a response SLA.

Maintainers should triage credible reports with:

- a task card or issue;
- risk label or severity note;
- review packet when the fix changes workflow behavior;
- verification evidence before release.

Security-sensitive fixes should avoid publishing exploit details before a safe release or mitigation note is available.

This policy is not legal advice.

## Security Impact Areas

- Repository scripts and CLI routing.
- Generated workflow assets.
- CI templates and hook guidance.
- Release, migration, baseline, and apply-plan guidance.
- Documentation that could cause unsafe adoption, secret exposure, or unauthorized production action.

## Out Of Scope

- Security guarantees for projects that copy this kit without running their own checks.
- Commercial authorization decisions.
- Legal advice about license compliance.
- Vulnerabilities introduced by user-specific project code outside this repository.
