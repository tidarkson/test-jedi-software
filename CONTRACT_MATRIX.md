# API Contract Matrix (Frontend ↔ Backend)

**Generated:** 2026-03-12  
**Scope:** Auth, Repository (Suites + Cases), Runs, Plans, Integrations  
**Base URL:** `/api/v1`

## Canonical Envelopes (Frozen)

### Success
```json
{
  "status": "success",
  "code": 200,
  "data": { }
}
```

### Error
```json
{
  "status": "error",
  "code": 400,
  "error": "VALIDATION_FAILED",
  "message": "Validation failed",
  "errors": []
}
```

> Note: Where OpenAPI omits non-2xx responses, the integration contract still assumes canonical error envelope with runtime codes (typically `400/401/403/404/500`) from middleware/service layers.

| Route | Method | Request DTO (key fields) | Success Response Shape | Error Codes | Auth Required | Enum Transforms | Status |
|---|---|---|---|---|---|---|---|
| `/auth/register` | POST | `AuthRegisterRequest`: `email,name,password,organizationName` | `201` → `data: { user: UserProfile, accessToken }` | `400` | No | `user.role`: backend role enum (UPPERCASE domain) → frontend lowercase role union **TRANSFORM REQUIRED** | Approved |
| `/auth/login` | POST | `AuthLoginRequest`: `email,password` | `200` → `data: { user: UserProfile, accessToken }` | `401` | No | `user.role`: backend role enum (UPPERCASE domain) → frontend lowercase role union **TRANSFORM REQUIRED** | Approved |
| `/auth/refresh` | POST | Refresh token cookie (no JSON body) | `200` → `data: { accessToken }` | `401` | No | None | Approved |
| `/auth/logout` | POST | None | `200` → `data: {}` | `401` | Yes | None | Approved |
| `/auth/me` | GET | None | `200` → `data: { user: UserProfile }` | `401` | Yes | `user.role`: backend role enum (UPPERCASE domain) → frontend lowercase role union **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/suites` | GET | Path: `projectId` | `200` → `data: SuiteDto` (suite tree/list) | `401` | Yes | `Suite.status` (backend `ACTIVE/DRAFT/ARCHIVED/DEPRECATED`) ↔ frontend lowercase lifecycle values **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/suites` | POST | Path: `projectId`; `SuiteCreateRequest`: `name,description,parentSuiteId` | `201` → `data: SuiteDto` | `400` | Yes | `Suite.status` uppercase ↔ frontend lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/suites/{id}` | PUT | Path: `projectId,id`; `SuiteUpdateRequest`: `name,description,parentSuiteId,isLocked,isArchived` | `200` → `data: SuiteDto` | `400` | Yes | `Suite.status` uppercase ↔ frontend lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/suites/{id}` | DELETE | Path: `projectId,id` | `200` → `data: {}` | `404` | Yes | None | Approved |
| `/projects/{projectId}/suites/{id}/clone` | POST | Path: `projectId,id` | `201` → `data: SuiteDto` | `404` | Yes | `Suite.status` uppercase ↔ frontend lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/suites/{id}/lock` | POST | Path: `projectId,id` | `200` → `data: SuiteDto` | `404` | Yes | `Suite.status` uppercase ↔ frontend lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/suites/{id}/archive` | POST | Path: `projectId,id` | `200` → `data: SuiteDto` | `404` | Yes | `Suite.status` uppercase ↔ frontend lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/cases` | GET | Path: `projectId`; Query: `page,limit,search` | `200` → `data: TestCaseDto` / list payload | `401` | Yes | `priority,severity,type,automationStatus,status`: backend UPPERCASE enums ↔ frontend lowercase unions **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/cases` | POST | Path: `projectId`; `TestCaseCreateRequest`: `suiteId,title,priority,severity,type,automationStatus,steps,...` | `201` → `data: TestCaseDto` | `400` | Yes | Request + response enums: `priority,severity,type,automationStatus,status` UPPERCASE↔lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/cases/{id}` | GET | Path: `projectId,id` | `200` → `data: TestCaseDto` | `404` | Yes | `priority,severity,type,automationStatus,status` UPPERCASE↔lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/cases/{id}` | PUT | Path: `projectId,id`; `TestCaseUpdateRequest` (partial case fields) | `200` → `data: TestCaseDto` | `400` | Yes | `priority,severity,type,automationStatus,status` UPPERCASE↔lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/cases/{id}` | DELETE | Path: `projectId,id` | `200` → `data: {}` | `404` | Yes | None | Approved |
| `/projects/{projectId}/cases/{id}/history` | GET | Path: `projectId,id` | `200` → `data` history payload | `404` | Yes | Historical case/run statuses are backend uppercase ↔ frontend lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/cases/bulk` | POST | Path: `projectId`; `BulkCaseOperationRequest`: `suiteId,items[]` | `200` → `data: {}` | `400` | Yes | Any enum fields inside `items[]` must normalize to frontend lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/runs/preview` | POST | Path: `projectId`; optional filter payload | `200` → `data` preview payload | `400,401,500` (runtime canonical) | Yes | Preview statuses/types from backend uppercase ↔ frontend lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/runs` | POST | Path: `projectId`; `RunCreateRequest`: `name,type,environment,planId,caseIds[]` | `201` → `data: RunDto` | `400` | Yes | `type`: backend `MANUAL/AUTOMATED` (and domain may include `HYBRID`) ↔ frontend lowercase values **TRANSFORM REQUIRED**; `status` uppercase↔lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/runs` | GET | Path: `projectId` | `200` → `data: RunDto` / list payload | `400,401,500` (runtime canonical) | Yes | `Run.status,type` backend uppercase ↔ frontend lowercase unions **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/runs/{id}` | GET | Path: `projectId,id` | `200` → `data: RunDto` | `404` | Yes | `Run.status,type` backend uppercase ↔ frontend lowercase unions **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/runs/{id}` | PUT | Path: `projectId,id`; `RunUpdateRequest`: `name,status,environment,assigneeId` | `200` → `data: RunDto` | `400` | Yes | Request `status` + response `status,type`: backend uppercase ↔ frontend lowercase; semantic map needed (`COMPLETED`↔`closed`) **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/runs/{id}` | DELETE | Path: `projectId,id` | `200` → `data: {}` | `404` | Yes | None | Approved |
| `/projects/{projectId}/runs/{id}/close` | POST | Path: `projectId,id` | `200` → `data: RunDto` | `400` | Yes | `Run.status` uppercase↔lowercase (`COMPLETED`↔`closed`) **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/runs/{id}/clone` | POST | Path: `projectId,id` | `201` → `data: RunDto` | `404` | Yes | `Run.status,type` uppercase↔lowercase **TRANSFORM REQUIRED** | Approved |
| `/runs/{runId}/cases` | GET | Path: `runId` | `200` → `data` run-case list payload | `400,401,500` (runtime canonical) | Yes | `RunCase.status` backend uppercase (`NOT_RUN`,`PASSED`,...) ↔ frontend lowercase test status/queue states **TRANSFORM REQUIRED** | Approved |
| `/runs/{runId}/cases/{runCaseId}` | PUT | Path: `runId,runCaseId`; `RunCaseUpdateRequest`: `status,comment,defectId,actualResult` | `200` → `data` updated run-case payload | `400` | Yes | `status`: backend `PASSED/FAILED/BLOCKED/SKIPPED/NOT_RUN` ↔ frontend lowercase (`passed/failed/blocked/skipped/pending|untested`) **TRANSFORM REQUIRED** | Approved |
| `/runs/{runId}/cases/bulk-status` | POST | Path: `runId`; bulk status payload | `200` → `data` bulk update result | `400` | Yes | Bulk `status` values use backend uppercase ↔ frontend lowercase **TRANSFORM REQUIRED** | Approved |
| `/runs/{runId}/metrics` | GET | Path: `runId` | `200` → `data` metrics payload | `400,401,500` (runtime canonical) | Yes | Embedded status buckets may be backend uppercase keys; normalize to frontend lowercase keys **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/plans` | POST | Path: `projectId`; `PlanCreateRequest`: `name,description,targetRelease,startDate,endDate` | `201` → `data: PlanDto` | `400` | Yes | `Plan.status` backend uppercase domain (`DRAFT/ACTIVE/COMPLETED/ARCHIVED`) ↔ frontend `draft/pending_approval/approved/deprecated` requires case + semantic mapping **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/plans` | GET | Path: `projectId` | `200` → `data: PlanDto` / list payload | `400,401,500` (runtime canonical) | Yes | `Plan.status` uppercase + semantic drift vs frontend plan status union **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/plans/{id}` | GET | Path: `projectId,id` | `200` → `data: PlanDto` | `404` | Yes | `Plan.status` uppercase + semantic drift **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/plans/{id}` | PUT | Path: `projectId,id`; `PlanUpdateRequest`: `name,description,status,targetRelease` | `200` → `data: PlanDto` | `400` | Yes | Request+response `status` requires case + semantic mapping (`ACTIVE`/`COMPLETED` vs frontend `pending_approval`/`approved`) **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/plans/{id}/runs` | POST | Path: `projectId,id`; body includes run linkage (OpenAPI placeholder schema) | `200` → `data: PlanDto` | `400,401,404,500` (runtime canonical) | Yes | `Plan.status` in response requires uppercase→lowercase semantic transform **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/plans/{id}/runs/{runId}` | DELETE | Path: `projectId,id,runId` | `200` → `data: PlanDto` | `404` | Yes | `Plan.status` in response requires uppercase→lowercase semantic transform **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/plans/{id}/approve` | POST | Path: `projectId,id`; `PlanApproveRequest`: `note` | `200` → `data: PlanDto` | `403` | Yes | Approval state in backend status/isApproved fields must map to frontend `PlanStatus` lowercase values **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/plans/{id}/readiness` | GET | Path: `projectId,id` | `200` → `data` readiness payload | `400,401,500` (runtime canonical) | Yes | If payload includes plan status enums, normalize uppercase→lowercase **TRANSFORM REQUIRED** | Approved |
| `/plans/{id}/versions` | GET | Path: `id` | `200` → `data` version list | `400,401,404,500` (runtime canonical) | Yes | If snapshot includes plan/run/case statuses, normalize uppercase→lowercase **TRANSFORM REQUIRED** | Approved |
| `/plans/{id}/versions/{versionId}` | GET | Path: `id,versionId` | `200` → `data` version snapshot | `400,401,404,500` (runtime canonical) | Yes | Snapshot enum payloads require uppercase→lowercase normalization **TRANSFORM REQUIRED** | Approved |
| `/plans/{id}/baseline` | POST | Path: `id` | `200` → `data` baseline set result | `400,401,404,500` (runtime canonical) | Yes | None | Approved |
| `/plans/{id}/baseline` | GET | Path: `id` | `200` → `data` baseline comparison | `400,401,404,500` (runtime canonical) | Yes | Snapshot status enums require uppercase→lowercase normalization **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/webhooks` | POST | Path: `projectId`; `WebhookRequest`: `url,name,secret,timeoutMs,events[],isActive` | `201` → `data` webhook object | `400` | Yes | `events[]`: backend `RUN_CREATED/RUN_CLOSED/CASE_FAILED/PLAN_APPROVED/DEFECT_CREATED` ↔ frontend webhook events (`test_run_started`, etc.) **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/webhooks` | GET | Path: `projectId` | `200` → `data` webhook list | `400,401,500` (runtime canonical) | Yes | `events[]` + delivery status (`PENDING/SUCCESS/FAILED`) ↔ frontend lowercase event/status unions **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/webhooks/{webhookId}` | PUT | Path: `projectId,webhookId`; `WebhookRequest` | `200` → `data` webhook object | `400,401,404,500` (runtime canonical) | Yes | `events[]` uppercase↔frontend lowercase event keys **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/webhooks/{webhookId}` | DELETE | Path: `projectId,webhookId` | `200` → `data: {}` | `400,401,404,500` (runtime canonical) | Yes | None | Approved |
| `/projects/{projectId}/integrations` | PUT | Path: `projectId`; `IntegrationConfigRequest`: `provider,settings` | `200` → `data` integration config/result | `400,401,500` (runtime canonical) | Yes | `provider`: backend `JIRA/GITHUB/GITLAB/SLACK/TEAMS/CI` ↔ frontend lowercase (`jira/github/gitlab/slack/teams/azure_devops`) **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/integrations` | GET | Path: `projectId` | `200` → `data` integrations list | `400,401,500` (runtime canonical) | Yes | `provider/status` values require uppercase→lowercase normalization; provider vocabulary mismatch (`CI` vs `azure_devops`) **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/integrations/{provider}` | DELETE | Path: `projectId,provider` | `200` → `data: {}` | `400,401,404,500` (runtime canonical) | Yes | Path `provider` must be mapped to backend uppercase enum set **TRANSFORM REQUIRED** | Approved |
| `/integrations/jira/connect` | GET | Query: `projectId` | `302` redirect (OAuth start) | `400` | No | Query/provider flow uses backend `JIRA` identity; frontend route constants `jira` require normalization **TRANSFORM REQUIRED** | Approved |
| `/integrations/jira/callback` | GET | Query: `code,state` | `200` → `data` callback result | `400` | No | None | Approved |
| `/integrations/jira/webhook` | POST | `AutomationImportRequest` (OpenAPI placeholder) | `200` → `data` ingestion result | `400,500` (runtime canonical) | No | Imported execution statuses from backend uppercase ↔ frontend lowercase execution status keys **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/runs/{runId}/pr-link` | POST | Path: `projectId,runId`; `RunPrLinkRequest`: `provider,repository,pullRequest,branch,buildNumber` | `201` → `data` PR-link object | `400,401,500` (runtime canonical) | Yes | `provider`: backend `GITHUB/GITLAB` ↔ frontend `github/gitlab` **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/runs/{runId}/pr-link` | GET | Path: `projectId,runId` | `200` → `data` PR-link list | `400,401,500` (runtime canonical) | Yes | `provider` uppercase↔lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/notification-rules` | POST | Path: `projectId`; `NotificationRuleRequest`: `provider,channel,events,threshold,isActive` | `201` → `data` notification rule | `400,401,500` (runtime canonical) | Yes | `provider` (`SLACK/TEAMS`) + `enabledEvents` (`RUN_CREATED...`) ↔ frontend lowercase unions **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/notification-rules` | GET | Path: `projectId` | `200` → `data` notification rule list | `400,401,500` (runtime canonical) | Yes | `provider/events` uppercase↔lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/notification-rules/{ruleId}` | PUT | Path: `projectId,ruleId`; `NotificationRuleRequest` | `200` → `data` notification rule | `400,401,404,500` (runtime canonical) | Yes | `provider/events` uppercase↔lowercase **TRANSFORM REQUIRED** | Approved |
| `/projects/{projectId}/notification-rules/{ruleId}` | DELETE | Path: `projectId,ruleId` | `200` → `data: {}` | `400,401,404,500` (runtime canonical) | Yes | None | Approved |
| `/projects/{projectId}/runs/{runId}/import-results` | POST | Path: `projectId,runId`; Body: `AutomationImportRequest` (`application/json` or XML) | `200` → `data` import summary | `400,401,500` (runtime canonical) | Yes | Imported case/run statuses and automation classifications uppercase↔frontend lowercase **TRANSFORM REQUIRED** | Approved |

## Acceptance Criteria Check

- [x] Contract matrix document exists in repo (`test-jedi-software/CONTRACT_MATRIX.md`)
- [x] Every endpoint in the 5 route groups has Request DTO, Success shape, and Error Codes defined
- [x] Enum mismatches are explicitly marked with **TRANSFORM REQUIRED**
- [x] All route groups are marked **Approved**

## Checklist Validation (Tested 2026-03-12)

| Checklist Item | Verification Evidence | Result | Contract Decision |
|---|---|---|---|
| Frontend uses lowercase enums while backend sends UPPERCASE → transform layer mandatory | Backend enums observed in OpenAPI/Prisma (`RunCaseUpdateRequest.status=PASSED/FAILED/...`, `RunCreateRequest.type=MANUAL/AUTOMATED`, integration providers `JIRA/GITHUB/...`), while frontend unions are lowercase in `types/index.ts`, `types/integrations.ts`, and store models. | PASS | Keep mandatory `toFrontendEnum(...)` / `toBackendEnum(...)` adapters in API client boundary for all status/type/provider/event fields. |
| `RunDto` missing `passRate`, `failRate`, `completionPct` | OpenAPI `RunDto` fields are only `id,projectId,name,status,type,environment,startedAt,completedAt`; frontend run dashboard uses metrics fields (`passRate`, `failRate`) in run metrics types/components. | PASS | Treat run metrics as a separate contract: fetch `GET /runs/{runId}/metrics` (or aggregate equivalent) in addition to `RunDto`. Do not assume metrics are embedded in `RunDto`. |
| `SuiteDto.parentSuiteId` vs frontend `parentId` mismatch | OpenAPI `SuiteDto` has `parentSuiteId`; frontend suite models/store (`types/index.ts`, `lib/store/test-repository-store.ts`) use `parentId`. | PASS | Add adapter mapping: `parentId = parentSuiteId ?? null` on inbound, and `parentSuiteId = parentId` on outbound updates/creates. |
| `PlanDto` sparse vs frontend `TestPlan` rich shape | OpenAPI `PlanDto` exposes sparse fields (`id,projectId,name,status,approvedBy,approvedAt`); frontend `TestPlan` expects `linkedRuns`, `readinessScore`, `readinessMetrics`, `passRate`, `completionRate`, `openDefects`, `versions`, etc. | PASS | Build `TestPlanViewModel` via composed calls: base `PlanDto` + `GET /projects/{projectId}/plans/{id}/readiness` + `GET /plans/{id}/versions` + linked-runs source (`/projects/{projectId}/plans/{id}/runs` path contract). Mark single-call hydration as unsupported until backend expands `PlanDto`. |

### Test Outcome Summary

- [x] Enum-transform requirement confirmed and frozen as mandatory at transport boundary.
- [x] Run metrics gap verified; separate metrics endpoint strategy defined.
- [x] Suite parent field mismatch verified; adapter mapping defined.
- [x] Plan payload sparsity verified; multi-endpoint composition strategy defined.
