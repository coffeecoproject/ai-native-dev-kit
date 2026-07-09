# IntentOS 1.87.0 Known Limitations

- Release Channel Policy is a policy/evidence layer, not a deployment executor.
- It does not calculate exact GitHub Actions, storage, registry, platform, or
  provider cost. It classifies cost-risk surfaces and requires a cost owner when
  risk is present or unknown.
- It does not replace Release Evidence Gate. Release Channel Policy can be used
  as release-channel evidence before release-owner review.
- It does not prove a third-party provider, app store, mini-program platform,
  package registry, Docker registry, or server release process is correct. It
  records whether owner, cost, retention, package identity, and source evidence
  are present.
- It does not delete old artifacts or optimize bundle size. Evidence deletion is
  treated as a blocker.

