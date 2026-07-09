# 1.87 Release Channel Decoupling Examples

These examples show how IntentOS separates source identity from release-channel
decisions.

They cover:

- new projects that keep GitHub as source and evidence only;
- existing projects with a provider release SOP that should be preserved;
- GitHub Release assets that require owner review before they can become a
  release channel;
- GitHub Actions artifacts that must not become long-lived release packages
  without retention and cost-owner evidence;
- tags that remain source identity unless a release workflow is explicitly
  approved.

All examples are non-authorizing. They do not approve release, execute release,
upload GitHub Release assets, run GitHub-hosted release workflows, delete
artifacts, change CI, change production, or touch secrets.

