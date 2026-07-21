# iOS Build Settings

## Xcode Project / Workspace

Workspace:
Project:
Scheme:
Configuration:
Destination:

## Default Commands

```bash
xcodebuild test -scheme <Scheme> -destination 'platform=iOS Simulator,name=<Device>'
```

## Signing Boundary

Signing configuration, provisioning-profile selection, certificate mapping,
entitlement design, and local build/archive verification are technical
preparation owned by Codex. They require project evidence, secret-safe handling,
and internal review, not user technical approval. Codex must not invent a
credential, expose private material, or claim that a local archive was uploaded.

Ask for an unavailable external account fact when it cannot be inspected. Ask
for exact consent only before accessing or changing a real Apple account,
creating/revoking provider-managed signing material, uploading a build,
distributing through TestFlight, or releasing to the App Store.

## Notes

- 
