# Universal Agent Rules & Operating Standard (`AGENTS.md`)

> **Operating Standard**: Universal, stack-agnostic engineering protocol. Enforces relentless requirement/tool assessment, London School Outside-In TDD, interface segregation, day-1 containerization, design token theming, and strict DevSecOps guardrails.

---

## 0. Glossary & Acronyms

- **ADR (Architecture Decision Record)**: Log in `memory.md` capturing architectural context, trade-offs, and consequences.
- **TDD (Test-Driven Development - London School / Mockist)**: Outside-in double-loop driving code from external entrypoints inward, discovering collaborator contracts via mocks of owned interfaces.
- **Walking Skeleton**: Minimal end-to-end implementation verifying cross-tier connectivity before business logic.
- **Adapter Pattern**: Wrapping third-party dependencies behind domain-owned interfaces to isolate external breaking changes.
- **Pure DI (Dependency Injection)**: Supplying dependencies via explicit constructor/factory arguments wired at an application **Composition Root** (entrypoint). Avoids heavy reflection-based DI containers.
- **Idempotence**: Replay-safe operations producing identical state on repeated execution (e.g., database upserts).
- **DDL (Data Definition Language)**: Database schema mutations; must be version-controlled via migrations (never raw/ad-hoc).
- **RBAC (Role-Based Access Control)**: Authorization restricting actions via roles and granular permissions.
- **Feature Flag / Toggle**: Dynamic runtime decision point resolving feature enablement or domain strategy based on context without redeploying code.
- **Entitlement**: Commercial capability or quota limit granted to a tenant via their active pricing plan or contractual tier.
- **Usage Metering**: Non-blocking, event-driven ingestion tracking consumption of quantifiable resources (API calls, storage, compute).
- **Domain Strategy Pattern**: Encapsulating algorithmic variations behind an interface, allowing use cases to select behavior dynamically without hardcoded tenant conditionals.
- **UI/UX Pro Max (Design Intelligence)**: Design-system-first protocol enforcing intentional visual hierarchy, 60-30-10 color balance, WCAG AAA/AA ergonomics, and tenant white-labeling.
- **JWT / JTI**: JSON Web Token containing a cryptographic JTI (JWT ID nonce) for distributed real-time revocation.
- **A11y & ARIA**: Accessibility standards and Accessible Rich Internet Applications markup attributes (`role`, `aria-*`).
- **FOUC**: Flash of Unstyled Content; eliminated via early blocking theme resolution before DOM render.
- **DevSecOps / SAST / SBOM**: Security automation: Static Application Security Testing and Software Bill of Materials.

---

## 1. Operating Protocol & Cognitive Loop

- **Relentless Questioning**: Never act on assumptions. Explore decision branches by asking **one clear question at a time** until all constraints, edge cases, and interfaces are resolved.
- **Stack & Tool Assessment on Demand**: When a feature introduces new capabilities (storage, caching, queues, crypto, email, validation), relentlessly evaluate and propose the most suitable language-native tools for the active stack. Prefer standard library or established ecosystem standards; never introduce unneeded dependencies.
- **Lightweight ADR Tracking**: Log all decisions in `memory.md` using the schema: `Date`, `Status`, `Context`, `Decision`, `Rationale & Alternatives`, `Consequences`.
- **5-Phase Execution Loop**:
  `[1. Assess & ADR] -> [2. Outer Acceptance Test (Red)] -> [3. Contract Discovery] -> [4. Inner TDD (Green)] -> [5. Verify & Commit]`
- **Tiered Test Immutability**:
  - Existing regression test suites are 100% read-only. Forbid modifying or deleting prior tests without explicit user mandate.
  - In-flight feature tests are immutable during the Red phase; assertions may never be loosened or deleted to force green.
  - Logical defects in new tests require: `// [TEST_AUDIT] Reason: <flaw> | Fix: <corrected assertion>`.
  - Feature Flag Immutability & Lifecycle: New feature toggles must lock default state (e.g. `flags.default.ts`) in existing test environments so regression suites remain read-only and green. All non-permanent flags must follow a strict typed lifecycle (`release`, `experiment`, `entitlement`, `ops`) and be pruned within 1 release cycle post-GA.
- **Zero-Tolerance Type & Config Guardrails**:
  - Absolute ban on type escapes (`any`, `@ts-ignore`, `unsafe`, `# type: ignore`) and inline lint disables in domain/test code.
  - Tooling configs and 100.00% coverage thresholds are locked infrastructure; never modify them to bypass errors.
  - *Vendor Escape Exception*: Permitted strictly within owned adapter files (`*.adapter.*`) with mandatory `// [VENDOR_TYPE_ESCAPE] Reason: <missing vendor typings>`.
- **Bounded Debugging & Blast Radius**:
  - Zero multi-file shotgun edits. Isolate the failure stack trace and modify only the single component under test.
  - If a fix fails or causes secondary regressions within 2 micro-iterations, immediately revert to the clean Git checkpoint.

---

## 2. Test-Driven Development (London School / Mockist)

- **Strictly Outside-In**: Drive all features from the outermost observable layer inward:
  1. *UI Acceptance*: User interactions, DOM states, navigation, accessibility, feedback states (loading, error, success, empty).
  2. *Client State & API Clients*: Discovered by UI tests; unit test request/response envelopes.
  3. *Backend Acceptance*: Walking skeletons verifying routing, status codes, guards, headers against isolated test environments.
  4. *Domain Unit Tests*: Mock immediate domain collaborators (`Controllers/Handlers -> Services -> Adapters`).
- **Cardinal Adapter Rule ("Only Mock Types You Own")**: Never mock third-party libraries, SDKs, ORMs, drivers, or external clients (including LaunchDarkly, Unleash, Stripe, or Paddle). Encapsulate external dependencies behind owned boundary interfaces (`IFeatureFlagPort`, `IBillingAdapter`, `IMeteringService`, `IEntitlementPort`); mock only these interfaces in unit tests.
- **Pure Constructor DI & Composition Root**: Pass dependencies explicitly into constructors or factory functions. Assemble the dependency graph at the application Composition Root. Avoid heavy reflection/runtime DI containers unless framework-native.
- **Automated Architecture Boundaries (Hexagonal)**: Enforce automated dependency graph linting in pre-commit/CI. Dependencies point strictly inward: Domain Core (zero dependencies) $\leftarrow$ Application (use cases + owned ports) $\leftarrow$ Adapters (infrastructure). Transport/UI calls Application. `packages/shared` must remain pure/isomorphic (no server/browser/ORM imports). Frontend and Backend workspaces may never import from each other. Zero circular dependencies allowed. Absolute ban on tenant-ID conditionals (`if (tenant.id === '...')`) in Domain Core: conflicting tenant requirements must be resolved via the Strategy Pattern, Domain Policy Factories, or Extension Hooks resolved at the application boundary.
- **Mandatory 100.00% Coverage Gate**: Enforce 100.00% coverage (lines, branches, functions, statements) via the stack's native coverage runner. Test all HTTP status codes (2xx, 4xx, 5xx), UI interaction states, and boundary/error edge cases.

---

## 3. Asynchronous Jobs & Background Workers (YAGNI)

- **Owned Queue Adapter (`IJobQueue`)**: Domain code only dispatches via `IJobQueue.enqueue()`. Never import queue drivers directly into domain or web layers.
- **Evolutionary Runtime Topology**: Start simple with embedded execution (in-process or primary datastore). Decouple to a standalone worker process/container via `WORKER_MODE=embedded|standalone` only when workload demands it—zero domain code changes.
- **Domain-First State Idempotency**: Verify entity state (e.g. `status !== 'PENDING'`, `sentAt !== null`) and unique constraints. Bounded retries (e.g., 3 attempts) with structured error logging on exhaustion.
- **Zero-Flakiness Testing**: Use `InMemoryJobQueueAdapter` in unit/acceptance tests executing synchronously or via `drain()`. Forbid arbitrary `sleep()` or timeout polling. Test worker handlers as isolated domain units.

---

## 4. Database, Migrations & State Isolation

- **Version-Controlled Migrations Only**: All schema alterations must be committed migration files. Direct schema pushes (`db push`) and unversioned runtime DDL are forbidden. Migration resets permitted only in dev/test.
- **Zero-Downtime Expand & Contract**: Single-step destructive changes (dropping/renaming columns, changing types, non-null columns without defaults) are forbidden. Use the 3-phase lifecycle: (1) Expand (add nullable/default column) $\to$ (2) Dual-Write & Backfill (dual-write in app, backfill data) $\to$ (3) Contract (read new, drop deprecated in next migration).
- **Lock Timeouts & Concurrent Indexing**: Index creation must be non-blocking/concurrent. Migrations must enforce strict lock timeouts (e.g., `SET lock_timeout = '3s';`) to prevent connection pool exhaustion. Automated migration linting in CI.
- **Forward-Only Migrations**: Downward rollbacks (`down.sql`) are strictly forbidden in production; all fixes must roll forward via new timestamped migrations.
- **Idempotent Fixtures & Seeds**: Baseline seed fixtures must use idempotent upserts keyed on unique identifiers.
- **Test Database Isolation**: Automated test suites must run against dedicated test datastores with deterministic setup/cleanup lifecycle hooks (`beforeEach`/`afterEach` or transactional rollbacks). Never hardcode secrets or admin passwords.

---

## 5. Security, Observability & Configuration

- **Fail-Fast Runtime & Dynamic Config**: Validate environment variables at application startup using a stack-native schema validator. Abort boot on malformed, missing, or insecure values (e.g., reject weak secrets and wildcard CORS in production). For dynamic tenant configuration and feature flags, enforce local in-memory evaluation/caching, guaranteed offline fallback defaults, and circuit-breaker degradation if external configuration providers fail.
- **Standard Error Envelope**: Standardize all API error responses: `{ "error": string, "code": string, "requestId": string, "details"?: unknown }`. Mask 500 errors and stack traces in production. Standardize commercial error responses: `402 Payment Required` (plan upgrade required / subscription past due) and `429 Too Many Requests` (quota exhausted, including standard `Retry-After` and quota usage headers).
- **Outbound Resilience & Circuit Breakers**: Mandatory strict timeouts (connect $\le$ 2s, read $\le$ 5s). Exponential backoff with randomized jitter on transient failures (429, 5xx, socket drops). Circuit breakers fail fast on error threshold (e.g., 5 failures over 10s) with owned fallbacks.
- **Inbound Idempotency & Secure Webhooks**: Mutating endpoints support `Idempotency-Key` header, replaying cached responses on duplicates. Inbound webhooks require timing-safe signature verification (HMAC-SHA256), replay tolerance window ($\le$ 5m), and idempotent event ledgers.
- **Decoupled Health Probes (No Restart Spirals)**: Liveness (`/healthz`) tests shallow process responsiveness only (never queries DB/cache; failure restarts container). Readiness (`/readyz`) tests live datastore connectivity (failure returns 503, removing pod from load balancer routing without restart). Startup probe (`/startup`) guards cold migrations.
- **Prometheus RED Metrics & OpenTelemetry**: Expose RED metrics (Rate, Errors, Duration p50/p95/p99 histograms) on internal/protected `/metrics`. Track process telemetry (memory, event loop lag). Standardize W3C `traceparent` headers for distributed tracing correlated with `x-request-id`.
- **Correlation Tracing & Structured Logs**: Tag requests with `x-request-id`. Propagate correlation IDs across structured JSON logging and domain service audit events.
- **Schema-Driven API Docs**: Generate API specifications (OpenAPI, gRPC reflection) directly from code schemas; never maintain decoupled manual documentation.

---

## 6. Authentication, RBAC, Multi-Tenancy & SaaS Monetization

### 6.1 Identity, RBAC & Stateless Multi-Tenancy
- **Hybrid Token Lifecycle**:
  - *Access Tokens*: Short-lived (e.g., 15m), stateless tokens stored **strictly in-memory** (never in browser `localStorage`).
  - *Refresh Tokens*: Cryptographically secure rotating tokens transmitted via `HttpOnly, Secure, SameSite=Strict` cookies.
  - *Instant Revocation*: Check cryptographic token JTIs and user revocation timestamps against a fast distributed cache.
- **Stateless Multi-Tenancy**: Resolve tenant context via request headers (`X-Tenant-ID` / `X-Tenant-Slug`) with fallback to user's personal default workspace. Verify tenant membership on every tenant route.
- **REST Conventions**: Return `204 No Content` on successful deletions. Protect built-in system roles with `403 Forbidden`. Expose granular subresource endpoints for role/permission assignments. Protect auth routes with redirect guards.

### 6.2 Feature Flagging, Dynamic Tenant Strategies & Conflicting Requests
- **Owned Feature Flag Port (`IFeatureFlagPort`)**: Domain and application layers evaluate flags solely via an owned interface (matching OpenFeature evaluation semantics). Third-party SDKs (LaunchDarkly, Unleash, etc.) are isolated strictly inside `*.adapter.*`.
- **Zero-Tolerance on Tenant-ID Branching**: Hardcoded tenant branching (`if (tenantId === '...')`) is strictly forbidden in Domain Core. Tenant-specific variations must be resolved via the **Strategy Pattern** or **Domain Policy Factories** wired at the application layer.
- **Evaluation Context & Fallbacks**: Flag evaluations must pass a structured `EvaluationContext` (`tenantId`, `userId`, `tier`, `attributes`). Providers must maintain local in-memory evaluation or aggressive caching with guaranteed offline fallback defaults.
- **Lifecycle & Pruning Discipline**: Every flag must be typed (`release`, `experiment`, `entitlement`, `ops`) and tagged with an expiration/owner. Release flags must be removed within 1 cycle of full rollout; existing regression tests must lock default flag values.

### 6.3 SaaS Monetization: Pricing Models, Entitlements & Metered Quotas
- **Decoupled Entitlement Enforcement**: Strictly separate RBAC (user permissions) from Entitlements (tenant plan capabilities). Evaluate entitlements via `IEntitlementPort.canAccess(tenantId, featureKey)` before executing restricted domain operations.
- **Owned Billing Adapter (`IBillingAdapter`)**: All commercial integrations (subscriptions, invoices, checkout sessions, customer portal) must be wrapped in an owned adapter. Never mock or expose third-party billing SDKs (Stripe, Paddle) to domain logic.
- **Non-Blocking Asynchronous Metering (`IMeteringService`)**: Ingest usage events asynchronously via `IJobQueue` or out-of-band telemetry pipelines. Never execute synchronous billing API calls or heavy database writes on the hot request path.
- **High-Throughput Quota Enforcement**: Atomic quota counters (e.g. Redis sliding window or token bucket) protect datastores from row lock contention. Support both **Hard Limits** (`429 Too Many Requests` with `Retry-After`) and **Soft Limits** (overage tracking and billing event dispatching).
- **Subscription Webhook Ledger & Grace Periods**: Webhooks (`invoice.payment_failed`, `customer.subscription.updated`) must be verified via timing-safe HMAC, processed idempotently through an event ledger, and drive subscription state machines with configurable grace periods before downgrading tenant access.

---

## 7. Frontend Architecture, Design Tokens, Theming & A11y (Design Pro Max)

- **Foundation & Intentional Visual Archetype**: Lock in UI framework, CSS strategy (utility-first, CSS Modules, or modern zero-runtime CSS), typography scale, and layout primitives at project inception. Reject generic "vibecoded" templates; select an intentional aesthetic archetype (Clean Enterprise SaaS, Bento Grid, High-Density Data Canvas) matching the product domain.
- **Design Intelligence & Mathematical Harmony**:
  - Enforce the **60-30-10 color rule** (60% canvas/surface, 30% structural/text, 10% purposeful accent).
  - Define design tokens via CSS custom properties (`--bg-canvas`, `--bg-surface`, `--text-main`, `--text-muted`, `--border-base`, `--accent-primary`).
  - Separate raw primitives (color palette, spacing scale) from semantic role tokens. Never hardcode magic colors or spacing.
- **Theme Engine & Dynamic Tenant White-Labeling**:
  - Drive themes via root attributes (`data-theme="dark"` or `class="dark"`). Support user preference persistence with fallback to `prefers-color-scheme`.
  - Prevent FOUC: Inject a tiny, synchronous, blocking script in `<head>` to resolve theme before first paint.
  - Dynamically inject tenant white-label tokens (`--tenant-brand-primary`, `--tenant-logo`) into root CSS variables without layout recalculation or flash.
- **Ergonomics & Accessibility Priority Gate (WCAG AA/AAA)**:
  - Strict **4.5:1 text contrast** for normal text (3:1 for large text/icons) across all themes.
  - Minimum **44x44px touch targets** for all interactive elements with generous negative space (8px grid).
  - High-visibility keyboard focus rings (`:focus-visible`) on all interactive controls.
  - Build on headless accessible primitives (Radix, Ark, Headless UI) with focus trapping, escape dismissal, and full keyboard navigation.
  - Forbid native browser dialogs (`window.confirm`, `window.alert`); use accessible modals/dialogs.
  - Prevent Cumulative Layout Shift (CLS) using layout-stable skeleton screens for loading states.
  - Form accessibility: Pair labels with inputs; bind validation alerts via `role="alert"`, `aria-invalid`, and `aria-describedby`.
- **Declarative Capability & Entitlement Guards**:
  - Guard UI views with declarative wrappers (`<FeatureGate flag="...">`, `<EntitlementGate feature="...">`) that render accessible fallback upgrade CTAs and paywalls without breaking layout flow.
- **Mobile-First & Responsive Layouts**:
  - Mobile-first breakpoint hierarchy (`sm`, `md`, `lg`, `xl`).
  - Utilize fluid typography/spacing (`clamp()`), flexbox/grid layout primitives, and container queries for modular components.
- **State & Deep Linking**:
  - Segregate server cache (remote data queries) from ephemeral client state (modals, active drawer).
  - Synchronize tabs, active filters, search inputs, and pagination bidirectionally with URL query parameters.

---

## 8. Direct-to-Storage Object Architecture & Tenant File Security

- **Pre-Signed Direct Uploads**: Never stream or buffer binary file uploads through application web servers. Clients request short-lived pre-signed upload URLs (`POST /api/uploads/presign`) with MIME and byte-size limits validated upfront; clients upload directly to object storage.
- **S3 Local Parity (Day 1)**: Provision an S3-compatible store (e.g., MinIO) in Docker Compose from day one for 100% development and E2E testing parity without cloud credentials.
- **Storage Adapter (`IStorageAdapter`)**: All storage interactions (signed URLs, delete, download) are wrapped in an owned adapter. Offload heavy media processing (resizing, virus scans) to background workers (`IJobQueue`).
- **Public vs. Private Segregation & RBAC Downloads**: Public assets (avatars) served via CDN with immutable cache. Private assets (invoices, sensitive docs) stored in private buckets with public access disabled. Downloads require short-lived (5–15m) pre-signed download URLs guarded by tenant context and RBAC permissions (`requirePermission`). Storage keys must be tenant-partitioned (`tenants/<tenantId>/<resource>/<uuid>.<ext>`).

---

## 9. Containerization, DevSecOps & CI/CD Discipline

- **Dockerize From Day 1**:
  - Establish multi-stage Dockerfiles and container orchestration (Docker Compose) on the initial commit.
  - Container parity: All datastores, applications, workers, and ingress reverse proxies run in containers across dev and prod.
  - Route local services through a unified reverse proxy/gateway (port 80) to eliminate port sprawl and cross-origin friction.
  - Run all production containers as unprivileged, non-root users. Accelerate builds with BuildKit cache mounts and `.dockerignore`.
- **Automated Supply Chain & Secret Scanning**:
  - Enforce automated secret scanning on pre-commit (`lint-staged`) and CI pipelines.
  - Maintain automated weekly dependency vulnerability audits and generate CycloneDX SBOM on all release builds.
  - Run SAST linters to block insecure coding patterns.
- **Commit & Verification Discipline**:
  - Enforce Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `refactor:`, `ci:`) via commit hooks. Never use `--no-verify`.
  - Full suite verification (typecheck, lint, secret scan, 100% test coverage) must pass before pushing code.

