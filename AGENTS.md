# Universal Agent Rules & Operating Standard (`AGENTS.md`)

> **Operating Standard**: Universal, stack-agnostic engineering protocol. Enforces relentless requirement assessment, London School Outside-In TDD, interface segregation, day-1 containerization, design token theming, strict DevSecOps guardrails, and on-demand capability activation (strict YAGNI).

---

## 0. Glossary & Acronyms

- **ADR (Architecture Decision Record)**: Log in `memory.md` capturing architectural context, trade-offs, and consequences.
- **TDD (Test-Driven Development - London School / Mockist)**: Outside-in double-loop driving code from external entrypoints inward, discovering collaborator contracts via mocks of owned interfaces.
- **Walking Skeleton**: Minimal end-to-end implementation verifying cross-tier connectivity before business logic.
- **Adapter Pattern**: Wrapping third-party dependencies behind domain-owned interfaces to isolate external breaking changes.
- **Pure DI (Dependency Injection)**: Supplying dependencies via explicit constructor/factory arguments wired at an application **Composition Root** (entrypoint). Avoids heavy reflection-based DI containers.
- **Hexagonal Architecture (Ports & Adapters)**: Strict boundary isolation where Domain Core (zero dependencies) $\leftarrow$ Application (ports, use cases) $\leftarrow$ Adapters (infrastructure, vendors).
- **Idempotence**: Replay-safe operations producing identical state on repeated execution (e.g., database upserts, webhook processing).
- **DDL (Data Definition Language)**: Database schema mutations; must be version-controlled via migrations (never raw/ad-hoc).
- **RBAC (Role-Based Access Control)**: Authorization restricting actions via user roles and granular permissions.
- **Feature Flag / Toggle**: Dynamic runtime decision point resolving feature enablement or domain strategy based on context without redeploying code.
- **Entitlement**: Commercial capability or quota limit granted to a tenant via their active pricing plan or contractual tier.
- **Usage Metering**: Non-blocking, event-driven ingestion tracking consumption of quantifiable resources (API calls, storage, compute).
- **Domain Strategy Pattern**: Encapsulating algorithmic variations behind an interface, allowing use cases to select behavior dynamically without hardcoded tenant conditionals.
- **UI/UX Pro Max (Design Intelligence)**: Design-system-first protocol enforcing intentional visual hierarchy, 60-30-10 color balance, WCAG AAA/AA ergonomics, and tenant white-labeling.
- **JWT / JTI**: JSON Web Token containing a cryptographic JTI (JWT ID nonce) for distributed real-time revocation.
- **A11y & ARIA**: Accessibility standards and Accessible Rich Internet Applications markup attributes (`role`, `aria-*`).
- **FOUC**: Flash of Unstyled Content; eliminated via early blocking theme resolution before DOM render.
- **SCIM**: System for Cross-domain Identity Management: open standard REST API automating user and group provisioning from enterprise IdPs (Okta, Entra ID).
- **Impersonation**: Temporary, dual-audited authentication allowing authorized support staff to operate within a tenant workspace without credential sharing.
- **Hierarchical Tenancy**: Multi-tier tenant structure allowing parent organizations to manage pooled commercial entitlements and policies across child workspaces.
- **SOLID & GoF Patterns**: Architectural foundation (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) combined with GoF patterns (Adapter, Strategy, Factory, State, Repository).
- **DRY vs. AHA**: Single source of truth for business invariants (DRY) balanced against Avoid Hasty Abstractions (AHA): duplication across divergent tenant workflows is far cheaper than the wrong abstraction.
- **Stack Agnosticism & Reference Parity**: Protocol is 100% stack-, language-, and framework-neutral. References to specific tools (PostgreSQL, Redis, MinIO) represent canonical local dev reference implementations, not mandatory technology lock-in.
- **Strict YAGNI ("You Aren't Gonna Need It")**: Absolute prohibition against scaffolding infrastructure, dependencies, or architectural ports for capabilities that have not been explicitly requested.
- **Capability-Triggered Architecture (Just-In-Time)**: Activating specialized technical architectures (storage, queues, billing, search, real-time) only upon an explicit domain requirement or tenant contract trigger.

---

# PART I: UNIVERSAL CORE INVARIANTS (Always-On Engine)
> Non-negotiable architectural guardrails applied across **every single task, feature, service, and line of code**, regardless of domain or scale.

## 1. Operating Protocol & Cognitive Loop

- **Relentless Questioning**: Never act on assumptions. Explore decision branches by asking **one clear question at a time** until all constraints, edge cases, and interfaces are resolved.
- **Zero Premature Scaffolding (Strict YAGNI)**: Before writing code or modifying configs, identify the minimal capability set required for the active prompt. Forbid introducing dependencies, Docker containers, schema tables, or mock ports for inactive capabilities.
- **Stack & Tool Assessment on Demand**: When a feature introduces a triggered capability (storage, caching, queues, crypto, email, validation), relentlessly evaluate and propose the most suitable language-native tools for the active stack. Prefer standard library or established ecosystem standards; never introduce unneeded dependencies.
- **Lightweight ADR Tracking**: Log all architectural decisions in `memory.md` using the schema: `Date`, `Status`, `Context`, `Decision`, `Rationale & Alternatives`, `Consequences`.
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
- **Defect Fix Protocol (Red-to-Green Reproduction)**: Never attempt to fix a defect or secondary regression without first writing an isolated, minimal failing test (acceptance or unit) that accurately reproduces the bug (Red). Only then implement the targeted fix to turn the test green. Never delete, comment out, or weaken an existing test to disguise a failure.
- **PII & Credential Scrubbing (Data Hygiene)**: Absolute ban on outputting raw passwords, payment card numbers, access tokens, webhook secrets, or unmasked PII into structured logs, OpenTelemetry trace attributes, error envelopes, or test fixtures. All logged context must pass through a redaction filter.

---

## 2. Test-Driven Development (London School / Mockist)

- **Strictly Outside-In**: Drive all features from the outermost observable layer inward:
  1. *UI Acceptance*: User interactions, DOM states, navigation, accessibility, feedback states (loading, error, success, empty).
  2. *Client State & API Clients*: Discovered by UI tests; unit test request/response envelopes.
  3. *Backend Acceptance*: Walking skeletons verifying routing, status codes, guards, headers against isolated test environments.
  4. *Domain Unit Tests*: Mock immediate domain collaborators (`Controllers/Handlers -> Services -> Adapters`).
- **Cardinal Adapter Rule ("Only Mock Types You Own")**: Never mock third-party libraries, SDKs, ORMs, drivers, or external clients (including LaunchDarkly, Unleash, Stripe, or Paddle). Encapsulate external dependencies behind owned boundary interfaces (`IFeatureFlagPort`, `IBillingAdapter`, `IMeteringService`, `IEntitlementPort`); mock only these interfaces in unit tests.
- **Pure Constructor DI & Composition Root**: Pass dependencies explicitly into constructors or factory functions. Assemble the dependency graph at the application Composition Root. Avoid heavy reflection/runtime DI containers unless framework-native.
- **Automated Architecture Boundaries (Hexagonal)**: Enforce automated dependency graph linting in pre-commit/CI. Dependencies point strictly inward: Domain Core (zero dependencies) $\leftarrow$ Application (use cases + owned ports) $\leftarrow$ Adapters (infrastructure). Transport/UI calls Application. `packages/shared` must remain pure/isomorphic (no server/browser/ORM imports). Frontend and Backend workspaces may never import from each other. Zero circular dependencies allowed.
- **Absolute Ban on Tenant-ID Conditionals**: Hardcoded tenant branching (`if (tenant.id === '...')`) is strictly forbidden in Domain Core. Conflicting tenant requirements must be resolved via the **Strategy Pattern**, **Domain Policy Factories**, or **Extension Hooks** resolved at the application boundary.
- **SOLID & Design Patterns Invariants**:
  - *Single Responsibility (SRP)*: Pure use cases and segregated ports; identity, RBAC, entitlements, and billing never share contracts.
  - *Open/Closed (OCP)*: Domain Core is open for extension via Domain Strategies, closed for modification (zero tenant branching).
  - *Liskov Substitution (LSP)*: All ports have 100% interchangeable in-memory test doubles and production adapters.
  - *Interface Segregation (ISP)*: Granular, client-specific ports; never combine distinct capabilities into monolithic interfaces.
  - *Dependency Inversion (DIP)*: High-level Domain Core depends solely on abstractions (owned ports); infrastructure depends on domain.
  - *DRY vs. AHA*: Strictly DRY on business invariants, validation schemas, and migrations. Explicitly avoid premature DRY (AHA - Avoid Hasty Abstractions) across divergent tenant workflows: duplication is far cheaper than the wrong abstraction.
- **Mandatory 100.00% Coverage Gate**: Enforce 100.00% coverage (lines, branches, functions, statements) via the stack's native coverage runner. Test all HTTP status codes (2xx, 4xx, 5xx), UI interaction states, and boundary/error edge cases.

---

## 3. Database, Migrations & State Isolation

- **Version-Controlled Migrations Only**: All schema alterations must be committed migration files. Direct schema pushes (`db push`) and unversioned runtime DDL are forbidden. Migration resets permitted only in dev/test.
- **Zero-Downtime Expand & Contract**: Single-step destructive changes (dropping/renaming columns, changing types, non-null columns without defaults) are forbidden. Use the 3-phase lifecycle: (1) Expand (add nullable/default column) $\to$ (2) Dual-Write & Backfill (dual-write in app, backfill data) $\to$ (3) Contract (read new, drop deprecated in next migration).
- **Lock Timeouts & Concurrent Indexing**: Index creation must be non-blocking/concurrent. Migrations must enforce strict lock timeouts (e.g., `SET lock_timeout = '3s';`) to prevent connection pool exhaustion. Automated migration linting in CI.
- **Forward-Only Migrations**: Downward rollbacks (`down.sql`) are strictly forbidden in production; all fixes must roll forward via new timestamped migrations.
- **Idempotent Fixtures & Seeds**: Baseline seed fixtures must use idempotent upserts keyed on unique identifiers.
- **PostgreSQL Native Row-Level Security (RLS) Baseline**: All tenant-partitioned tables must enforce RLS (`ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`). Migration scripts must attach security policies using `USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)`. Database adapters and transaction managers must inject `SET LOCAL app.current_tenant_id = ?` at connection checkout. Integration tests must assert that cross-tenant queries return zero records even when application-level `WHERE` clauses are omitted.
- **Test Database Isolation**: Automated test suites must run against dedicated test datastores with deterministic setup/cleanup lifecycle hooks (`beforeEach`/`afterEach` or transactional rollbacks). Never hardcode secrets or admin passwords.

---

## 4. Security, Observability & Baseline Configuration

- **Fail-Fast Runtime & Dynamic Config**: Validate environment variables at application startup using a stack-native schema validator. Abort boot on malformed, missing, or insecure values (e.g., reject weak secrets and wildcard CORS in production). For dynamic tenant configuration and feature flags, enforce local in-memory evaluation/caching, guaranteed offline fallback defaults, and circuit-breaker degradation if external configuration providers fail.
- **Standard Error Envelope**: Standardize all API error responses: `{ "error": string, "code": string, "requestId": string, "details"?: unknown }`. Mask 500 errors and stack traces in production. Standardize commercial error responses: `402 Payment Required` (plan upgrade required / subscription past due) and `429 Too Many Requests` (quota exhausted, including standard `Retry-After` and quota usage headers).
- **Outbound Resilience & Circuit Breakers**: Mandatory strict timeouts (connect $\le$ 2s, read $\le$ 5s). Exponential backoff with randomized jitter on transient failures (429, 5xx, socket drops). Circuit breakers fail fast on error threshold (e.g., 5 failures over 10s) with owned fallbacks.
- **Inbound Idempotency & Secure Webhooks**: Mutating endpoints support `Idempotency-Key` header, replaying cached responses on duplicates. Inbound webhooks require timing-safe signature verification (HMAC-SHA256), replay tolerance window ($\le$ 5m), and idempotent event ledgers.
- **Decoupled Health Probes (No Restart Spirals)**: Liveness (`/healthz`) tests shallow process responsiveness only (never queries DB/cache; failure restarts container). Readiness (`/readyz`) tests live datastore connectivity (failure returns 503, removing pod from load balancer routing without restart). Startup probe (`/startup`) guards cold migrations.
- **Prometheus RED Metrics & OpenTelemetry**: Expose RED metrics (Rate, Errors, Duration p50/p95/p99 histograms) on internal/protected `/metrics`. Track process telemetry (memory, event loop lag). Standardize W3C `traceparent` headers for distributed tracing correlated with `x-request-id`.
- **Correlation Tracing & Structured Logs**: Tag requests with `x-request-id`. Propagate correlation IDs across structured JSON logging and domain service audit events.
- **Schema-Driven API Docs**: Generate API specifications (OpenAPI, gRPC reflection) directly from code schemas; never maintain decoupled manual documentation.

---

## 5. Identity, RBAC & Stateless Multi-Tenancy Foundation

- **Hybrid Token Lifecycle**:
  - *Access Tokens*: Short-lived (e.g., 15m), stateless tokens stored **strictly in-memory** (never in browser `localStorage`).
  - *Refresh Tokens*: Cryptographically secure rotating tokens transmitted via `HttpOnly, Secure, SameSite=Strict` cookies.
  - *Instant Revocation*: Check cryptographic token JTIs and user revocation timestamps against a fast distributed cache.
- **Stateless Multi-Tenancy**: Resolve tenant context via request headers (`X-Tenant-ID` / `X-Tenant-Slug`) with fallback to user's personal default workspace. Verify tenant membership on every tenant route.
- **Explicit Aggregate Root Encapsulation**: Every Domain Aggregate Root permanently encapsulates its `tenantId` as an immutable property of its identity. Entities can never exist in an orphaned or ambiguous multi-tenant state.
- **Repository Scoping Invariant**: Repository ports strictly require `(tenantId, entityId)` on all lookups and queries. Direct single-identifier lookups (`findById(id)`) without tenant scoping are strictly forbidden at the boundary. Collaborator mocks in London School unit tests must explicitly assert tenant arguments on every interaction.
- **REST Conventions**: Return `204 No Content` on successful deletions. Protect built-in system roles with `403 Forbidden`. Expose granular subresource endpoints for role/permission assignments. Protect auth routes with redirect guards.

---

## 6. Frontend Architecture, Design Tokens, Theming & A11y (Design Pro Max)

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

## 7. Containerization, DevSecOps & CI/CD Discipline

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

---

# PART II: TRIGGERED CAPABILITY MODULES (On-Demand Architecture)
> Activated **IF AND ONLY IF** a domain requirement or tenant request explicitly demands that capability. If a capability is inactive, **zero code, infrastructure, or mock ports may be scaffolded**.

---

## 8. Capability: Binary Object Storage & Tenant File Security
- **Trigger**: Domain requirement involves binary assets, file uploads, avatars, attachments, or document exports.
- **Strict YAGNI**: If no file upload/retrieval is required, do NOT provision object storage containers or write storage adapters.
- **Architecture Protocol (When Triggered)**:
  - **Pre-Signed Direct Uploads**: Never stream or buffer binary file uploads through application web servers. Clients request short-lived pre-signed upload URLs (`POST /api/uploads/presign`) with MIME and byte-size limits validated upfront; clients upload directly to object storage.
  - **S3 Local Parity**: Provision an S3-compatible store (e.g., MinIO) in Docker Compose only once storage is required.
  - **Storage Adapter (`IStorageAdapter`)**: All storage interactions (signed URLs, delete, download) are wrapped in an owned adapter. Offload heavy media processing (resizing, virus scans) to background workers (`IJobQueue`).
  - **Public vs. Private Segregation & RBAC Downloads**: Public assets (avatars) served via CDN with immutable cache. Private assets (invoices, sensitive docs) stored in private buckets with public access disabled. Downloads require short-lived (5–15m) pre-signed download URLs guarded by tenant context and RBAC permissions (`requirePermission`). Storage keys must be tenant-partitioned (`tenants/<tenantId>/<resource>/<uuid>.<ext>`).

---

## 9. Capability: Asynchronous Background Jobs & Queues
- **Trigger**: Operations exceeding synchronous HTTP request SLAs (>500ms), long-running batch processing, media transcoding, or scheduled tasks.
- **Strict YAGNI**: If all business logic executes within sub-second synchronous request lifecycles, do NOT introduce queue drivers or worker containers.
- **Architecture Protocol (When Triggered)**:
  - **Owned Queue Adapter (`IJobQueue`)**: Domain code only dispatches via `IJobQueue.enqueue()`. Never import queue drivers directly into domain or web layers.
  - **Evolutionary Runtime Topology**: Start simple with embedded execution (in-process or primary datastore). Decouple to a standalone worker process/container via `WORKER_MODE=embedded|standalone` only when workload demands it—zero domain code changes.
  - **Domain-First State Idempotency**: Verify entity state (e.g. `status !== 'PENDING'`, `sentAt !== null`) and unique constraints. Bounded retries (e.g., 3 attempts) with structured error logging on exhaustion.
  - **Zero-Flakiness Testing**: Use `InMemoryJobQueueAdapter` in unit/acceptance tests executing synchronously or via `drain()`. Forbid arbitrary `sleep()` or timeout polling. Test worker handlers as isolated domain units.

---

## 10. Capability: Multi-Tenant Feature Divergence & Conflicting Workflows
- **Trigger**: Conflicting tenant requirements, divergent business rules, compliance variations, or experimental feature releases.
- **Strict YAGNI**: If all tenants share uniform domain behavior, do NOT introduce complex dynamic feature flag systems.
- **Architecture Protocol (When Triggered)**:
  - **Owned Feature Flag Port (`IFeatureFlagPort`)**: Domain and application layers evaluate flags solely via an owned interface (matching OpenFeature evaluation semantics). Third-party SDKs (LaunchDarkly, Unleash, etc.) are isolated strictly inside `*.adapter.*`.
  - **Zero-Tolerance on Tenant-ID Branching**: Hardcoded tenant branching (`if (tenantId === '...')`) is strictly forbidden in Domain Core. Tenant-specific variations must be resolved via the **Strategy Pattern** or **Domain Policy Factories** wired at the application layer.
  - **Feature-Flagged Strategy Factory Pattern**: When tenant workflows diverge: (1) Domain Core defines the strategy interface and domain implementation classes; (2) Application layer defines a typed `DomainPolicyFactory` that calls `await this.featureFlagPort.getStringValue(flagKey, evaluationContext, defaultVariant)` to instantiate the strategy; (3) Application use cases consume the strategy via pure dependency injection. In London School unit tests, test each strategy implementation in isolation with 100% coverage, and unit test the factory by mocking `IFeatureFlagPort`.
  - **Evaluation Context & Fallbacks**: Flag evaluations must pass a structured `EvaluationContext` (`tenantId`, `userId`, `tier`, `attributes`). Providers must maintain local in-memory evaluation or aggressive caching with guaranteed offline fallback defaults.
  - **Lifecycle & Pruning Discipline**: Every flag must be typed (`release`, `experiment`, `entitlement`, `ops`) and tagged with an expiration/owner. Release flags must be removed within 1 cycle of full rollout; existing regression tests must lock default flag values.

---

## 11. Capability: SaaS Monetization, Commercial Entitlements & Metered Quotas
- **Trigger**: Product monetization, subscription tiers, seat limits, paywalled modules, or metered usage billing.
- **Strict YAGNI**: If the application is open-access, internally hosted, or non-commercial, do NOT introduce payment gateways or metering queues.
- **Architecture Protocol (When Triggered)**:
  - **Decoupled Entitlement Enforcement**: Strictly separate RBAC (user permissions) from Entitlements (tenant plan capabilities). Evaluate entitlements via `IEntitlementPort.canAccess(tenantId, featureKey)` before executing restricted domain operations.
  - **Application Use-Case Guard Protocol**: Entitlement access (`assertAccess(tenantId, featureKey)`) and quota checks (`assertQuota(tenantId, metricKey, quantity)`) must be executed explicitly within Application Use Cases / Command Handlers before invoking domain mutations. Transport-level middleware may be used optionally as a fast-rejection cache, but can never replace Application Use-Case guards. In London School unit tests, use cases must mock and verify `IEntitlementPort` interactions explicitly, verifying that `402 Payment Required` or `429 Too Many Requests` domain errors are thrown on unauthorized attempts.
  - **Owned Billing Adapter (`IBillingAdapter`)**: All commercial integrations (subscriptions, invoices, checkout sessions, customer portal) must be wrapped in an owned adapter. Never mock or expose third-party billing SDKs (Stripe, Paddle) to domain logic.
  - **Non-Blocking Asynchronous Metering (`IMeteringService`)**: Ingest usage events asynchronously via `IJobQueue` or out-of-band telemetry pipelines. Never execute synchronous billing API calls or heavy database writes on the hot request path.
  - **High-Throughput Quota Enforcement**: Atomic quota counters (e.g. Redis sliding window or token bucket) protect datastores from row lock contention. Support both **Hard Limits** (`429 Too Many Requests` with `Retry-After`) and **Soft Limits** (overage tracking and billing event dispatching).
  - **Subscription Webhook Ledger & Grace Periods**: Webhooks (`invoice.payment_failed`, `customer.subscription.updated`) must be verified via timing-safe HMAC, processed idempotently through an event ledger, and drive subscription state machines with configurable grace periods before downgrading tenant access.

---

## 12. Capability: High-Performance Caching & Distributed Locking
- **Trigger**: Hot-path read bottlenecks, expensive recalculations, distributed session revocation, or distributed locking.
- **Strict YAGNI**: Do NOT provision Redis or caching layers until database read metrics demonstrate clear latency or contention bottlenecks.
- **Architecture Protocol (When Triggered)**:
  - **Owned Cache Port (`ICachePort`)**: Wrap cache drivers behind an owned boundary. Domain Core never calls cache directly.
  - **Evolutionary Progression**: In-process memory cache first $\to$ dedicated distributed cache (Redis, KeyDB) when horizontal scaling requires shared cache state.
  - **Explicit Invalidation & Resilience**: Mandate explicit cache invalidation strategies (write-through or stale-while-revalidate with jittered TTL). Circuit-break cache calls: cache misses or outages must transparently fall back to source datastores without downtime.

---

## 13. Capability: Full-Text Search & Complex Filtering
- **Trigger**: Natural-language text search, fuzzy matching, typo tolerance, or faceted filtering across large corpora.
- **Strict YAGNI**: Do NOT spin up search engines for simple exact-match relational queries.
- **Architecture Protocol (When Triggered)**:
  - **Owned Search Port (`ISearchPort`)**: Application domain dispatches search queries and indexing requests solely via `ISearchPort`.
  - **Relational First**: Leverage relational full-text capabilities (e.g., PostgreSQL `tsvector` with GIN indexes) before introducing external search clusters.
  - **Decoupled External Engine**: Migrate to an external engine (Elasticsearch, Meilisearch) only when scale, typo tolerance, or scoring algorithms require it. Reindex asynchronously via `IJobQueue`.

---

## 14. Capability: Transactional Outbound Communications (Email / SMS / Push)
- **Trigger**: Domain events requiring external user notifications (invites, password resets, verification codes, system alerts).
- **Strict YAGNI**: If domain operations do not notify external channels, do NOT introduce email drivers or mail services.
- **Architecture Protocol (When Triggered)**:
  - **Owned Notification Port (`INotificationPort` / `IEmailAdapter`)**: Encapsulate transactional email providers (Resend, SendGrid, Postmark) behind an owned interface.
  - **Decoupled Templating & Async Dispatch**: Templates reside in application/infrastructure layers, rendered with strongly typed view models. Dispatch occurs asynchronously via `IJobQueue` to avoid HTTP thread blocking.
  - **Local Development Parity**: Provision an in-memory local mail catcher (e.g., Mailpit) in Docker Compose so tests and local development capture emails without external credentials.

---

## 15. Capability: Live Real-Time Events & Streaming
- **Trigger**: Real-time collaborative editing, live dashboards, instant status feeds, or progress streaming.
- **Strict YAGNI**: If polling or standard request/response cycles satisfy user requirements, do NOT introduce persistent socket connections.
- **Architecture Protocol (When Triggered)**:
  - **Owned Realtime Port (`IRealtimePort`)**: Encapsulate streaming mechanisms behind domain event subscriptions.
  - **SSE-First Evolution**: Default to Server-Sent Events (SSE) over HTTP for unidirectional server-to-client streaming. Adopt WebSockets only when sub-100ms bidirectional message exchange is explicitly required.
  - **Connection Auth & Heartbeats**: Authenticate socket/stream connections via initial handshake token validation. Enforce connection heartbeats, automatic client reconnect with exponential backoff, and tenant-partitioned channel access.

---

## 16. Capability: Outbound Webhooks & Integration Events
- **Trigger**: Enterprise tenants require subscribing external systems to platform domain events (e.g., Zapier, custom tenant webhooks).
- **Strict YAGNI**: Do NOT build outbound webhook infrastructure for internal-only monoliths.
- **Architecture Protocol (When Triggered)**:
  - **Cryptographic Signing**: Every outbound webhook payload must include a cryptographic HMAC-SHA256 signature header (`X-Signature-SHA256`) generated using a tenant-specific webhook secret.
  - **Reliable Dispatch Pipeline**: Webhook delivery must run asynchronously via `IJobQueue` with exponential backoff retries, configurable delivery timeouts ($\le$ 5s), and dead-letter quarantine after terminal failure.
  - **Idempotency & Event Nonces**: Outbound payloads include unique event nonces (`event_id`) and timestamps to protect tenant receivers against replay attacks.

---

## 17. Capability: Data Tenancy Isolation Tiers & Compliance
- **Trigger**: Enterprise tenant contractual mandates for physical or logical database separation (e.g., SOC2, HIPAA, banking).
- **Strict YAGNI**: Default to shared database with tenant partitioning. Do NOT implement complex multi-database routing unless contractually mandated.
- **Architecture Protocol (When Triggered)**:
  - **Tiered Isolation Strategy**:
    - *Pooled (Default)*: Shared database with strict Row-Level Security (RLS) and automatic tenant context injection (`SET LOCAL app.current_tenant_id = '...'`).
    - *Silo (Enterprise Tier)*: Dedicated schema-per-tenant or database-per-tenant resolved via a dynamic connection routing factory at the application boundary.
  - **Migration Automation**: Version-controlled migrations must run idempotently across all active tenant schemas or databases in parallel during CI/CD pipelines.

---

## 18. Capability: Immutable Tenant Audit Trail
- **Trigger**: B2B compliance requirements (SOC2, ISO27001, HIPAA) to maintain an audit trail of user actions, administrative mutations, and permission changes.
- **Strict YAGNI**: Do NOT confuse ephemeral stdout operational logs with compliance audit trails.
- **Architecture Protocol (When Triggered)**:
  - **Tamper-Evident Audit Ledger**: Audit entries (`id`, `tenant_id`, `actor_id`, `action`, `resource_type`, `resource_id`, `state_diff`, `ip_address`, `timestamp`) are append-only.
  - **Strict Immutability**: Forbid `UPDATE` or `DELETE` operations on audit tables via database triggers or WORM (Write-Once-Read-Many) policies.
  - **Decoupled Ingestion**: Record audit events asynchronously to avoid impacting domain transaction commit latency. Expose queryable, tenant-scoped audit search endpoints for tenant administrators.

---

## 19. Capability: Internationalization (i18n), Localization (l10n) & Multi-Currency
- **Trigger**: Product supports multi-lingual users, global regions, or multi-currency pricing.
- **Strict YAGNI**: Do NOT introduce translation dictionaries or currency converters for single-region applications.
- **Architecture Protocol (When Triggered)**:
  - **Decoupled Translation Keys**: Domain models and UI components store semantic translation keys; translations live in localized dictionaries loaded dynamically.
  - **Context Resolution**: Resolve user locale via `Accept-Language` header, tenant organization preference, or explicit user profile settings with graceful fallback.
  - **Currency Representation**: Store monetary values strictly as integers in the lowest minor currency unit (e.g. cents) alongside a standard ISO-4217 currency code. Never use floating-point arithmetic for currency calculations.

---

## 20. Capability: Tenant Custom Domains & Vanity White-Labeling
- **Trigger**: Enterprise tenants require hosting their workspace on a custom domain (e.g., `portal.customer.com`) with bespoke branding.
- **Strict YAGNI**: Do NOT build dynamic domain routing or custom certificate automation for standard subpath applications.
- **Architecture Protocol (When Triggered)**:
  - **Host & SNI Tenant Resolution**: Edge reverse proxy maps incoming `Host` header to tenant context, verifying verified custom domain ownership via DNS TXT challenges.
  - **Automated SSL**: Provision and renew Let's Encrypt TLS certificates dynamically at the reverse-proxy layer.
  - **Dynamic Theme Injection**: Serve tenant branding tokens (`--tenant-brand-primary`, `--tenant-logo`) in the initial HTML blocking script to eliminate visual flash on custom domains.

---

## 21. Capability: Tenant Data Portability & GDPR Deletion
- **Trigger**: Tenant account termination, data export requests, or GDPR "Right to be Forgotten" erasure mandates.
- **Strict YAGNI**: Do NOT implement export archiving engines until tenant self-service or compliance mandates require it.
- **Architecture Protocol (When Triggered)**:
  - **Asynchronous Export Generation**: Full tenant exports (relational data in JSON/CSV + binary assets) run as background batch jobs via `IJobQueue`, delivering a temporary signed download link to the tenant admin.
  - **Cryptographic Cascade Erasure**: Deletion requests execute a deterministic cascade: soft-delete with grace period $\to$ permanent cryptographic purging of relational rows, cache keys, audit logs, and object storage partitions.

---

## 22. Capability: Enterprise SSO (SAML 2.0 / OIDC) & SCIM 2.0 Directory Sync
- **Trigger**: Enterprise tenant requires federated Single Sign-On (Okta, Azure AD / Entra ID, Google Workspace) or automated directory user/group synchronization.
- **Strict YAGNI**: For consumer, team-tier, or standard credentials applications, do NOT scaffold SAML endpoints or SCIM controllers.
- **Architecture Protocol (When Triggered)**:
  - **Owned SSO Port (`ISSOAdapter`)**: Wrap identity federation providers or libraries behind an owned boundary. Domain Core receives normalized domain identities (`FederatedIdentity`, `ExternalOrgId`).
  - **Tenant-Isolated IdP Metadata**: Store SSO configurations (Entity ID, ACS URL, X.509 certificates, OIDC client secrets) strictly scoped to the tenant record. Never use global application-wide SSO configs for multi-tenant federation.
  - **SCIM 2.0 Compliance**: Implement SCIM endpoints (`/scim/v2/Users`, `/scim/v2/Groups`) with bearer token authentication per tenant. Automated employee deprovisioning via SCIM must immediately revoke active JWT sessions and disable membership to eliminate zombie accounts.

---

## 23. Capability: Tenant Lifecycle State Machine & Service Degradation
- **Trigger**: Tenant account statuses evolve across distinct lifecycle stages (`PROVISIONING`, `ACTIVE`, `PAST_DUE`, `SUSPENDED`, `ARCHIVED`, `DELETED`).
- **Strict YAGNI**: If tenants are permanently active without billing states or trial periods, do NOT introduce complex lifecycle state machines.
- **Architecture Protocol (When Triggered)**:
  - **Explicit Domain State Machine**: Tenant entities model lifecycle state explicitly. State transitions are governed by domain events (e.g., `TenantPaymentFailed`, `GracePeriodExpired`, `TenantReactivated`).
  - **Predictable Service Degradation**:
    - `PAST_DUE`: Full application access continues with non-blocking UI warning banner; background jobs proceed.
    - `SUSPENDED`: Mutating write requests reject with standard `402 Payment Required`; read requests permitted (read-only mode) or blocked based on commercial policy; tenant background jobs are paused/quarantined in `IJobQueue`; inbound webhooks are recorded in ledger but deferred.
    - `ARCHIVED`: All tenant routes return `403 Forbidden` (`TENANT_ARCHIVED`); tenant data scheduled for cascade purge.

---

## 24. Capability: Secure Support Impersonation & Audit Access
- **Trigger**: Platform administrators or customer support staff require temporary access to troubleshoot within a tenant's workspace.
- **Strict YAGNI**: Do NOT create manual login backdoors, support passwords, or un-audited token bypasses.
- **Architecture Protocol (When Triggered)**:
  - **Short-Lived Impersonation Nonce**: Support impersonation issues an ephemeral token ($\le$ 60 minutes) containing explicit claims: `sub` (target user), `impersonator` (support staff ID), and `tenantId`.
  - **Strict Security Guardrails**: While in an impersonation session, mutating tenant billing details, modifying user credentials, or generating new API keys is strictly blocked (`403 Forbidden - Impersonation Restricted`).
  - **Mandatory Dual-Identity Audit Logging**: Every mutation executed during impersonation logs both the real staff actor (`actor_id = support_staff`) and the affected user context (`impersonated_user_id = target_user`) into the immutable audit ledger.

---

## 25. Capability: Hierarchical Multi-Tenancy (Organizations, Workspaces & Teams)
- **Trigger**: Enterprise customers require managing multiple subsidiaries, business units, or project workspaces under a single parent contract.
- **Strict YAGNI**: Single-tier tenancy (flat organizations) must remain the default. Do NOT introduce hierarchical data models until enterprise accounts require parent-child resource pooling.
- **Architecture Protocol (When Triggered)**:
  - **Hierarchical Entity Model**: Model relationship as `Enterprise Organization (Parent) -> Workspaces (Children) -> Teams -> Users`.
  - **Inherited Entitlements & Shared Quotas**: Commercial subscriptions and billing pools are anchored at the Parent Organization. Quotas (e.g. total seats, API pools) are either shared globally or explicitly allocated to child workspaces via an allocation policy.
  - **Strict Workspace Data Scoping**: All operational data (projects, assets, tickets) remains scoped strictly to the child `workspace_id`. Cross-workspace visibility is prohibited unless explicit parent-level administrative roles are evaluated.
