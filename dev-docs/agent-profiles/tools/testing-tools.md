# Testing Tools Reference

This document provides guidance for AI agents on when and how to use the available testing mini-tools.

## When to Use Testing Tools

### Executor Agent
When implementing tests:
1.  **Before writing tests**: Read `dev-docs/testing/tools/test-data-factory.md` to understand how to create good test data.
2.  **After writing tests**: Run the mental checklist from `dev-docs/testing/tools/isolation-checker.md` to prevent flaky tests.
3.  **Before committing**: Validate resource management using the checklist from `dev-docs/testing/tools/cleanup-validator.md`.

### Validator Agent
When reviewing a Pull Request that includes tests:
1.  **Check for test isolation**: Use the checklist from `dev-docs/testing/tools/isolation-checker.md`.
2.  **Check for resource cleanup**: Use the checklist from `dev-docs/testing/tools/cleanup-validator.md`.
3.  **Check `package.json` changes**: Use the checklist from `dev-docs/testing/tools/dependency-classifier.md`.
4.  **Check API contract coverage**: Use the checklist from `dev-docs/testing/tools/contract-validator.md`.

## Tool Selection Matrix

| Situation | Primary Tool | Secondary Tool |
|---|---|---|
| "Write tests for a new API" | [test-data-factory.md](../../testing/tools/test-data-factory.md) | [contract-validator.md](../../testing/tools/contract-validator.md) |
| "Tests are failing intermittently" | [isolation-checker.md](../../testing/tools/isolation-checker.md) | [cleanup-validator.md](../../testing/tools/cleanup-validator.md) |
| "Review a test PR" | [isolation-checker.md](../../testing/tools/isolation-checker.md) | All checklists |
| "CI is failing with memory issues" | [cleanup-validator.md](../../testing/tools/cleanup-validator.md) | - |
| "The production build is too slow or large"| [dependency-classifier.md](../../testing/tools/dependency-classifier.md) | - |

## Tool Loading Strategy

### On-Demand (Recommended)
The agent should load ONLY the tool needed for the current task.
- **Writing tests**: Load 1 tool.
- **Reviewing a PR**: Load 2-3 tools.
- **Debugging a flaky test**: Load 1 tool.

### Batch Mode
For a comprehensive review, the agent can load all 5 tools sequentially.

## Anti-Patterns

- **DON'T** load all tools at once. This creates cognitive overhead.
- **DON'T** apply these tools to non-test code.
- **DON'T** use these tools for trivial one-line changes.
- **DO** load tools on-demand based on the task's context.
- **DO** use the "Quick Check" sections for fast validation.
- **DO** reference the specific tool in commit messages or PR reviews (e.g., "Applied patterns from isolation-checker.md").

---
*Version: 1.0 | Updated: 2024-11*
