# Web App Environment Topics

Use these topics when drafting `docs/environment-baseline.md` for a web project.

## Runtime

- Node.js version
- package manager and lockfile
- framework runtime, such as Next.js, Vite, Remix, Nuxt, or SvelteKit
- local install, dev, build, lint, typecheck, test, and preview commands

## Application Boundary

- route structure
- frontend module and component structure
- state management
- API client boundary
- auth/session handling
- form validation and error state conventions

## Environment Variables

- public client variables
- server-only variables
- API base URL
- auth/session secrets
- analytics or observability keys

Variable names may be recorded. Secret values must never be recorded.

## Testing And Release

- unit/integration/E2E command
- visual or behavior regression command
- preview/staging/production status
- deployment provider
- build output ownership
- rollback process
- monitoring, logs, and alert evidence
