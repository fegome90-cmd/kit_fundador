# CI failure analysis for docs-only branches

## Summary
Pull request #41 (`codex/realizar-auditoria-de-codigo-excluyendo-markdown`) only touched documentation, but the CI workflow still
installs dependencies and runs `npm run lint`, `npm run type-check`, `npm test`, and `npm run build`. Linting failed before the
other steps could start because `eslint` crashed with a parsing error inside `src/domain/value-objects/Email.ts`.

## Root cause
The stack uses `@typescript-eslint/parser` v6.x, which officially supports TypeScript versions `>=4.3.5 <5.4.0`. Our
`package.json` allowed any TypeScript `^5.0.0`, so GitHub Actions installed 5.9.3 during `npm ci`. That unsupported compiler
version caused the parser to throw `Parsing error: ';' expected` near the `domainLabels.some(...)` call in `Email.ts`, which is
why ESLint stopped the workflow even though the syntax is valid.

## Resolution
Pin TypeScript to a version the parser understands. The repo now declares and locks TypeScript to `~5.3.3`, so `npm ci` installs a
compatible compiler locally and in CI. Once dependencies are aligned, `npm run lint`, `npm run type-check`, `npm test`, and
`npm run build` proceed normally for documentation-only branches too.
