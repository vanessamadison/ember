# EMBER repeatable build and assurance system

This document defines how we ship **consistent, reviewable, security-conscious** changes. It is meant for humans and for coding agents. Follow it on every meaningful PR.

## Principles

1. **Evidence before assertions** — Do not claim “fixed” or “secure” until `npm run verify` (or the CI equivalent) has been run and the output reviewed.
2. **Determinism first** — Automated tests and static analysis beat ad-hoc “vibe checks.”
3. **AI assists; it does not certify** — Large language models are useful for structured review **rubrics** and test ideas; they are not a substitute for tests, typecheck, or specialist review for cryptography.
4. **Plan-then-build** — Non-trivial work starts from a **planfile** (template below) linked from the PR.

---

## Daily commands (local)

| Command | Purpose |
|---------|---------|
| `npm run lint` | ESLint via [Expo’s recommended config](https://docs.expo.dev/guides/using-eslint/) |
| `npm run lint:strict` | ESLint with `--max-warnings 0` (**used in CI** alongside tests and `tsc`) |
| `npm test` | Jest (`jest-expo` preset) |
| `npm run test:watch` | Jest watch mode while developing |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run verify` | **Lint + test + typecheck** — run before pushing or marking work complete |

### Git hooks (optional but recommended)

Repeatable systems are **behavior**, not just documentation. To make “verify before push” automatic, wire a **pre-push** hook (e.g. [husky](https://typicode.github.io/husky/) + `npm run verify`, or a small script in `.git/hooks/pre-push`). Team members can still bypass with `git push --no-verify` when needed; CI remains the **non-bypassable** gate.

Optional hygiene (not wired into `verify` yet; add when you adopt them):

- `npm audit` / Dependabot — dependency vulnerability signal
- EAS production builds — binary integration proof on real devices

---

## Planfile-driven development

For any feature that touches **crypto, sync, storage, permissions, or mesh/BLE**, create a planfile *before* implementation.

1. Copy [docs/templates/PLANFILE.template.md](templates/PLANFILE.template.md) to something like `docs/plans/YYYY-MM-short-title.md` (or your chosen plans directory).
2. Fill in scope, threat boundaries, acceptance criteria, and **test plan** (concrete test cases or file paths).
3. In the PR description, link the planfile and tick off **Definition of done**.

This keeps AI-generated and human-written code aligned with explicit security and product boundaries.

---

## CI (GitHub Actions)

Workflow: [.github/workflows/ci.yml](../.github/workflows/ci.yml)

- **quality-gate** — `npm ci` → `npm run lint:strict` → `npm test -- --ci` → `npm run typecheck`
- **EAS preview builds** (Android / iOS) — run after the quality gate; require `EXPO_TOKEN` and EAS project access

---

## Lint policy (React Compiler rules)

Expo’s ESLint stack enables **React Compiler** hook rules (`react-hooks/purity`, `react-hooks/refs`, `react-hooks/immutability`) as **`error`** in [.eslintrc.js](../.eslintrc.js). Patterns that trip them (e.g. `Date.now()` during render, ref access during render, one Reanimated shared value mutated from both an effect and a gesture) should be refactored rather than disabled.

- **Release branches:** also run `npm run lint:strict` to enforce `--max-warnings 0` once warning debt is cleared.

---

## Testing strategy

### Where tests live

- `__tests__/**/*.test.ts(x)` — unit and light integration tests
- Co-located `*.test.ts` adjacent to modules is also fine if the team prefers; keep one convention per area

### Jest and Babel

Unit tests use a **test-only Babel pipeline** (see [babel.config.js](../babel.config.js)): WatermelonDB decorators and the Reanimated Babel plugin are **omitted** under `api.env('test')` so Jest can transform sources reliably.

### Security-sensitive modules

Priority targets for unit tests:

- `src/crypto/**` — key handling, encrypt/decrypt invariants, failure modes (wrong key, tampered ciphertext)
- `src/sync/**` — CRDT merge behavior, snapshot/delta edge cases
- Any new native bridge or permission-gated code

Add **property-based** or fuzz-style tests later (e.g. `fast-check`) for parsing and crypto boundaries if the dependency cost is acceptable.

---

## “Evals” and AI-assisted review (2026 onward)

**Evals** here means *structured, repeatable evaluation* — not “ask the model if it’s safe.”

### Tier A — Must always pass (machine)

- `npm run verify` in CI
- Target: **100% of security-critical modules** covered by at least smoke-level unit tests before declaring a release candidate

### Tier B — SAST and supply chain

- `npm audit` (and/or OSV scanner) on a schedule
- Lockfile committed; no unreviewed `--force` installs for production branches

### Tier C — AI review rubric (human in the loop)

Use [evals/PR-SECURITY-RUBRIC.md](../evals/PR-SECURITY-RUBRIC.md) on PRs that touch Tier A modules:

1. Paste the rubric into your agent **or** work through it manually.
2. Save the completed rubric (or a short summary + link) in the PR or in `docs/plans/…` for traceability.
3. Treat model output as **suggestions**; verify each point against code and tests.

### Tier D — Release gates (org-dependent)

- Internal or external penetration test before major releases
- Apple / Google permission and data-deletion review for store submissions

---

## Definition of done (default)

- [ ] Planfile linked (for crypto/sync/storage/BLE/permissions changes)
- [ ] `npm run verify` passes locally (or failing steps explicitly documented with an issue and timeline)
- [ ] New behavior has tests or a justified exception in the planfile
- [ ] For security-sensitive changes, PR-SECURITY-RUBRIC completed
- [ ] No new `eslint-disable` without justification in the PR description

---

## Related docs

- [docs/ARCHITECTURE.md](ARCHITECTURE.md) — system design
- [docs/templates/PLANFILE.template.md](templates/PLANFILE.template.md) — plan template
