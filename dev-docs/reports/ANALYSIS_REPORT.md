# 📊 Comprehensive Analysis Report: Prompt Templates vs. Project Architecture

**Date:** 2025-11-19
**Project:** `kit_fundador`
**Scope:** 26 Prompt Templates (`dev-docs/prompt_example/`) and 2 Agent Profiles (`dev-docs/agent-profiles/`).

---

## 1. Executive Summary

The analysis reveals a **significant structural misalignment** between the provided prompt templates and the actual `kit_fundador` project architecture, despite a **strong methodological alignment**.

- **Methodology (Aligned):** The templates correctly enforce the project's core values: TDD, Clean Architecture principles, rigorous auditing, and "Anti-Drift" mechanisms. The focus on quality, testing, and clear roles (Executor/Validator) is excellent.
- **Structure (Misaligned):** The templates consistently use generic file paths (e.g., `src/services`, `src/components/views`) and commands (e.g., `npm test`) that do not exist or are not preferred in the `kit_fundador` environment (which uses `src/application/use-cases`, `web/src/components/sections`, and `make` commands).

**Impact:** If agents use these templates "as is", they will hallucinate non-existent directories, create files in the wrong locations, and run commands that may fail or bypass the Docker environment.

---

## 2. Systemic Misalignments

These issues appear across almost all 28 analyzed files.

### 2.1. Backend Architecture Paths

| Template Assumption (Generic) | Project Reality (`kit_fundador`)                                                    | Recommendation                          |
| ----------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------- |
| `src/services/`               | `src/application/use-cases/` (Logic) <br> `src/infrastructure/services/` (External) | Use explicit Clean Architecture layers. |
| `src/data-access/`            | `src/infrastructure/repositories/`                                                  | Update to specific repository paths.    |
| `src/core/`                   | `src/domain/`                                                                       | Use `domain` for core business logic.   |
| `src/models/`                 | `src/domain/entities/`                                                              | Use `entities` or `value-objects`.      |

### 2.2. Frontend Architecture Paths

| Template Assumption (Generic) | Project Reality (`kit_fundador`) | Recommendation                                  |
| ----------------------------- | -------------------------------- | ----------------------------------------------- |
| `src/components/views/`       | `web/src/components/sections/`   | The project does not use "views".               |
| `src/components/common/`      | `web/src/components/ui/`         | Use `ui` for atomic components.                 |
| `src/api/`                    | `web/src/infrastructure/api/`    | Align with frontend clean arch (if applicable). |

### 2.3. Testing Structure

| Template Assumption (Generic) | Project Reality (`kit_fundador`)                              | Recommendation                                  |
| ----------------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| `tests/[component].test.ts`   | `tests/unit/[layer]/...` <br> `tests/integration/[layer]/...` | Enforce strict separation of test types.        |
| `npm test`                    | `make test` <br> `make test-unit`                             | Use `make` commands to ensure Docker execution. |

### 2.4. Operational Commands

| Template Assumption (Generic) | Project Reality (`kit_fundador`) | Recommendation                         |
| ----------------------------- | -------------------------------- | -------------------------------------- |
| `npm run dev`                 | `make dev`                       | Use `make` for full env orchestration. |
| `npm run lint`                | `make lint`                      | Consistent with `CLAUDE.md`.           |

---

## 3. Detailed Analysis by Category

### 3.1. Agent Profiles (`EJECUTOR.md`, `VALIDADOR.md`)

**Status:** 🟡 Partially Aligned

- **Strengths:**
  - Excellent definition of the "Executor" (Make it work/right/fast) and "Validator" (Trust but verify) roles.
  - Strong emphasis on TDD (Red/Green/Refactor) and rigorous checklists (Edge cases, Math errors).
  - References to `dev-docs/domain/ubiquitous-language.md` are correct.
- **Weaknesses:**
  - **Commands:** Uses `npm test`, `npm run lint` instead of `make` commands.
  - **Paths:** `EJECUTOR.md` references `src/domain/utils/average.ts` (acceptable) but also generic structures in examples.
  - **ADR Script:** References `./scripts/adr-helper.sh` which may not exist or be executable without `make`.
- **Fixes:**
  - Replace all `npm` commands with `make` equivalents.
  - Verify script paths.

### 3.2. Implementation Templates (1-5)

**Status:** 🔴 Misaligned

- **Files:** `prompt_template_1_large_implementation.md` to `prompt_template_5_daily_task.md`.
- **Analysis:**
  - These templates drive the core coding work.
  - They heavily rely on the generic "Service/Controller/Model" pattern which contradicts the project's "Domain/Use-Case/Infrastructure" pattern.
  - Frontend examples consistently point to `views` instead of `sections`.
- **Fixes:**
  - Rewrite "Proposed Changes" sections to prompt for `Domain`, `Application`, and `Infrastructure` layers.
  - Update frontend examples to `web/src/components/...`.

### 3.3. Audit Templates (6-12)

**Status:** 🟡 Mostly Aligned (Methodologically)

- **Files:** `template_6_general_audit.md`, `template_10_code_quality_audit.md`, `template_11_ui_ux_audit.md`, etc.
- **Analysis:**
  - The scoring systems (Completeness, Quality, Impact) are excellent and agnostic of architecture.
  - However, specific checklists (e.g., in `template_10`) mention "Service Layer" or generic module paths.
  - `template_11` (UI/UX) is largely safe but should reference `web/src` for component checks.
- **Fixes:**
  - Minor path updates in examples.

### 3.4. Planning & Guardrails Templates (13-24)

**Status:** 🟡 Mixed

- **Files:** `template_13_infrastructure_plan.md`, `template_15_testing_plan.md`, `template_20_anti_drift_guardrails.md`.
- **Analysis:**
  - **Infrastructure:** `template_13` assumes a generic AWS/Terraform setup. The project uses Docker Compose for dev. It needs to be adapted to reflect the project's actual infra (or kept generic if the project _will_ use AWS later).
  - **Testing:** `template_15` and `17` need to explicitly mention `tests/unit` vs `tests/integration` folders to avoid placing tests in the wrong root.
  - **Guardrails:** `template_20` is excellent conceptually. The "Boundary Markers" examples need to use real project paths (e.g., `src/domain` instead of `src/modules`).
- **Fixes:**
  - Align testing paths.
  - Contextualize infrastructure examples to the project's Docker setup.

---

## 4. Action Plan

To resolve these issues, I recommend a batch update operation:

1.  **Global Terminology Update:**
    - Replace "Service" with "Use Case" (where referring to business logic).
    - Replace "Controller" with "Infrastructure Adapter/Controller".
    - Replace "View" with "Section/Page".

2.  **Path Correction:**
    - `src/services` -> `src/application/use-cases`
    - `src/core` -> `src/domain`
    - `src/data-access` -> `src/infrastructure/repositories`
    - `src/components/views` -> `web/src/components/sections`
    - `tests/*.test.ts` -> `tests/unit/*.test.ts` OR `tests/integration/*.test.ts`

3.  **Command Standardization:**
    - `npm test` -> `make test`
    - `npm run dev` -> `make dev`
    - `npm run lint` -> `make lint`

4.  **Agent Profile Refinement:**
    - Update `EJECUTOR.md` and `VALIDADOR.md` to explicitly forbid the creation of "Service" classes in the Domain layer and enforce the Clean Architecture dependency rule (Domain <- Application <- Infrastructure).

This alignment will ensure that AI agents acting on these templates produce code that fits seamlessly into the `kit_fundador` structure without requiring manual correction.
