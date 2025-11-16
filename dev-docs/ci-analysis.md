# CI failure analysis for docs-only branches

## Summary
Pull request #41 (`codex/realizar-auditoria-de-codigo-excluyendo-markdown`) only added documentation files, but the CI workflow keeps linting and testing the whole TypeScript source tree on every push. The "Build and Test" job defined in `.github/workflows/ci.yml` runs `npm run lint`, `npm run type-check`, `npm test`, and `npm run build` after installing dependencies. Because linting enforces architectural guardrails, it failed before tests or the build could complete.

## Root cause
The project-wide ESLint config (`.eslintrc.json`) sets `max-lines-per-function` to 20. When the PR branch was created, the domain layer still contained earlier scaffolding implementations where `Email.validate` and `User.create` held multiple responsibilities inside a single method. ESLint rightfully flagged both functions as too long and stopped the workflow during the `npm run lint` step. The failing code can be seen in commit `7d6e6eb` before it was refactored—`Email.validate` mixed emptiness, format, domain parsing, and blocking logic, while `User.create` mixed entity construction and domain-event registration without delegating to helper methods.

## Resolution
Splitting the logic into focused helpers keeps each function short and makes the rule pass (see the refactor recorded in commit `7d6e6eb`).

1. `Email.validate` now just orchestrates validation helpers such as `ensureNotEmpty`, `ensureBasicFormat`, `extractParts`, `validateLocalPart`, `validateDomain`, and `ensureDomainNotBlocked`. Each helper owns a specific check, so no single method exceeds the 20-line cap.
2. `User.create` now delegates the initial state assembly to `buildInitialProps`, reducing the factory to orchestration plus domain-event emission.

With those refactors in place, rerunning `npm run lint`, `npm run type-check`, `npm test`, and `npm run build` completes successfully, so the workflow can pass even when subsequent PRs only touch docs.
