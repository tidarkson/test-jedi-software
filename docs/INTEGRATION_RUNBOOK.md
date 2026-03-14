# Integration Runbook

This runbook documents how to run the Next.js frontend against the real backend, execute smoke tests, and detect API contract drift.

## 1) Local Setup (Frontend + Backend)

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL + Redis available for backend

### Start backend (`test-jedi-backend`)
1. Install dependencies:
   - `pnpm install`
2. Configure backend env (DB/Redis/JWT/etc.).
3. Run migrations/seed as required by backend docs.
4. Start API:
   - `pnpm dev`
5. Confirm API is reachable:
   - `http://localhost:3001/docs/openapi.json`

### Start frontend (`test-jedi-software`)
1. Install dependencies:
   - `pnpm install`
2. Create `.env.local` from template:
   - Copy `.env.local.example` and set values.
3. Required frontend vars for backend integration:
   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1`
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
   - `NEXT_PUBLIC_ENVIRONMENT=development`
4. Start app:
   - `pnpm dev`
5. Open:
   - `http://localhost:3000`

## 2) Environment Variable Reference

### Frontend Core
- `NEXT_PUBLIC_API_BASE_URL`: Base URL for backend API (include `/api/v1`).
- `NEXT_PUBLIC_APP_URL`: Public URL of frontend app.
- `NEXT_PUBLIC_ENVIRONMENT`: Environment marker (`development`, `staging`, `production`).

### Smoke Test Credentials (frontend Playwright)
- `SMOKE_BASE_URL`: App URL target for smoke tests.
- `SMOKE_USER_EMAIL`, `SMOKE_USER_PASSWORD`: Standard seeded user.
- `SMOKE_ADMIN_EMAIL`, `SMOKE_ADMIN_PASSWORD`: Seeded admin user.
- `SMOKE_VIEWER_EMAIL`, `SMOKE_VIEWER_PASSWORD`: Seeded viewer user.
- `SMOKE_INVALID_PASSWORD`: Explicit wrong password for negative auth test.

### Templates Added
- `.env.staging`
- `.env.production`

## 3) Run Smoke Tests

Smoke tests are in `tests/smoke/` and cover Phases A-E:
- `auth.spec.ts`
- `repository.spec.ts`
- `runs.spec.ts`
- `plans.spec.ts`
- `admin.spec.ts`

### Install Playwright browsers
- `pnpm exec playwright install --with-deps chromium`

### Execute smoke suite
- Headless:
  - `pnpm test:smoke`
- Headed:
  - `pnpm test:smoke:headed`
- Interactive UI mode:
  - `pnpm test:smoke:ui`

### Expected baseline for seeded backend
- All 5 smoke files pass against seeded test data/accounts.

## 4) API Contract Drift Detection (OpenAPI Diff)

Contract drift occurs when backend OpenAPI changes but frontend assumptions are not updated.

### Recommended baseline workflow
1. Export and commit a known-good backend OpenAPI baseline (JSON).
2. During integration/CI, fetch current backend spec.
3. Diff baseline vs current spec and fail on breaking changes.

### Example commands
From frontend repo:

```bash
# 1) Capture current backend spec as artifact
curl -s http://localhost:3001/docs/openapi.json -o ./docs/openapi.current.json

# 2) Compare with baseline using Redocly CLI
npx @redocly/cli@latest openapi diff ./docs/openapi.baseline.json ./docs/openapi.current.json
```

Alternative with OpenAPI Diff tool:

```bash
npx openapi-diff ./docs/openapi.baseline.json http://localhost:3001/docs/openapi.json
```

### CI recommendation
- Add a pipeline step that runs OpenAPI diff on every backend API change.
- Fail build for breaking changes unless explicitly approved.

## 5) Operational Gaps Addressed

- Added initial automated smoke coverage (`tests/smoke/`) for all 5 integration phases.
- Added `.env.staging` and `.env.production` templates for non-local environments.
- Added this runbook for operating frontend against real backend.
- Added OpenAPI drift detection procedure to catch contract mismatches early.
