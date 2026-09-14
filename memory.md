# Architecture Decision Records (`memory.md`)

## ADR-001: Multi-Tenant Feature Flagging, Dynamic Strategy Resolution, SaaS Monetization Architecture, and UI/UX Pro Max Standards

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  When expanding a multi-tenant B2B SaaS application, two critical architectural gaps emerged within `AGENTS.md`:
  1. **Conflicting Per-Tenant Requirements**: Enterprise tenants demand divergent, mutually conflicting business rules (e.g. approval hierarchies, custom calculation logic, compliance toggles). Without an architectural standard, systems degrade into brittle `if (tenant.id === '...')` conditional branching within the Domain Core, violating the Open-Closed Principle and Hexagonal Architecture.
  2. **Commercial Authorization & Monetization**: RBAC (`requirePermission`) only validates user identity and roles within an organization, failing to model commercial boundaries (subscription tiers, seat limits, feature entitlements, and metered consumption). Payment providers (Stripe/Paddle) and usage tracking must not leak into domain logic or introduce latency bottlenecks on synchronous HTTP request paths.
  3. **Frontend Aesthetic & Ergonomics**: Generic "vibecoded" AI interfaces lack intentional aesthetic archetypes, mathematical color balance, accessible touch targets, and support for enterprise tenant white-labeling.

- **Decision**:
  1. **Segregated Owned Boundary Ports**: 
     - Adopt `IFeatureFlagPort` (modeled on OpenFeature semantics) for runtime operational/release toggles.
     - Adopt `IEntitlementPort` for commercial tier capability and quota validation, completely decoupled from RBAC.
     - Adopt `IBillingAdapter` to encapsulate third-party payment gateways (Stripe/Paddle) behind domain-owned boundaries.
     - Adopt `IMeteringService` for asynchronous consumption tracking.
  2. **Resolution of Conflicting Tenant Requirements**:
     - Enforce an absolute ban on tenant-ID conditionals (`if (tenant.id === '...')`) in Domain Core.
     - Domain Core defines algorithmic variations via the **Domain Strategy Pattern**.
     - The Application layer / Composition Root resolves tenant context and injects the resolved strategy or policy into use cases.
  3. **SaaS Monetization & Quota Pipeline**:
     - Quota evaluation uses two-tier storage: atomic in-memory counters (e.g., Redis sliding window / token bucket) for sub-millisecond enforcement, preventing relational database row-lock contention (`SELECT FOR UPDATE`).
     - Usage ingestion runs out-of-band asynchronously via `IJobQueue`.
     - Standardize commercial error envelopes: `402 Payment Required` (plan upgrade required) and `429 Too Many Requests` (quota exhausted, including `Retry-After`).
     - Inbound billing webhooks require timing-safe HMAC verification, an idempotent event ledger, and subscription state machines supporting configurable grace periods.
  4. **UI/UX Pro Max Standards**:
     - Require design-system-first definition prior to component implementation (intentional visual archetype, 60-30-10 color distribution, type scale).
     - Enforce WCAG AA/AAA ergonomics: 4.5:1 minimum text contrast, 44x44px minimum touch targets, visible keyboard focus indicators (`:focus-visible`), and layout-stable skeleton screens.
     - Dynamic tenant white-labeling: Inject tenant brand tokens (`--tenant-brand-primary`, `--tenant-logo`) into root CSS variables before first paint without FOUC.
     - Guard UI views using declarative capability wrappers (`<FeatureGate>`, `<EntitlementGate>`) rendering accessible fallback upgrade CTAs.

- **Rationale & Alternatives**:
  - *Alternative Considered (Unified `ICapabilityPort`)*: Merging feature flags and commercial entitlements into a single interface was evaluated. Rejected because it violates the Single Responsibility and Interface Segregation Principles: operational release toggles (ephemeral, engineer-driven, kill-switches) have different lifecycles, caching semantics, and failure modes than commercial entitlements (contract-driven, billing-synced, audited).
  - *Alternative Considered (Database Branching in Core)*: Adding tenant checks in domain services was rejected due to catastrophic cyclomatic complexity, testing nightmare, and domain pollution.
  - *Alternative Considered (Synchronous Billing Verification)*: Calling payment gateways or relational database counters on every API request was rejected due to intolerable latency and third-party availability risks.

- **Consequences**:
  - **Positive**: Domain Core remains 100% pure and decoupled from external tenant IDs and vendor billing SDKs; London School TDD can mock owned interfaces cleanly; test suites remain green by locking default flag states; multi-tenant systems can scale across conflicting customer requirements cleanly; UI achieves professional aesthetic distinction and accessibility.
  - **Trade-offs**: Requires establishing strategy factories and owned adapter implementations up-front; requires Redis or fast atomic cache infrastructure for high-throughput quota tracking.

---

## ADR-002: Bipartite Operating Standard: Universal Core Invariants and On-Demand Triggered Capability Modules (Strict YAGNI)

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Operating standards for autonomous AI coding agents often suffer from a fundamental failure mode: treating specialized technical capabilities (e.g. S3/MinIO object storage, asynchronous worker queues, metered billing, full-text search clusters, real-time WebSockets) as mandatory "Day-1" scaffolding regardless of the actual user task. When an agent is instructed to build a simple JWT authentication endpoint or an in-memory calculation engine, an unconditional operating standard leads the agent to provision MinIO, configure BullMQ/Celery workers, and scaffold billing adapters. This violates YAGNI (You Aren't Gonna Need It), inflates Docker footprint, bloats the codebase, and increases cognitive overhead.

- **Decision**:
  Restructure `AGENTS.md` into a formal **Two-Tier Architecture**:
  1. **Part I: Universal Core Invariants (Always-On Engine)**:
     - London School Outside-In TDD (Mockist double-loop).
     - Hexagonal Architecture Boundaries & Pure Constructor DI.
     - Cardinal Adapter Rule ("Only Mock Types You Own").
     - Zero-Tolerance Type & Config Guardrails (No `any`, 100.00% coverage gate).
     - Tiered Test Immutability.
     - Fail-Fast Startup Runtime Config.
     - Stateless Multi-Tenancy Identity (`X-Tenant-ID`) & Absolute Ban on Tenant-ID Branching in Domain Core (`if (tenant.id === '...')`).
     - Docker Parity & DevSecOps (Non-root containers, unified reverse proxy port 80, secret scanning, conventional commits).
  2. **Part II: Triggered Capability Modules (Just-In-Time / On-Demand)**:
     - Formally define 14 specialized capability modules: (1) Object Storage, (2) Background Workers, (3) Tenant Feature Divergence & Conflicts, (4) SaaS Monetization & Quotas, (5) Caching & Distributed Locking, (6) Full-Text Search, (7) Transactional Communications, (8) Real-Time Streaming, (9) Outbound Webhooks, (10) Data Tenancy Tiers, (11) Immutable Audit Trail, (12) i18n & Multi-Currency, (13) Custom Domains & Vanity White-Labeling, and (14) Tenant Data Portability & GDPR Deletion.
     - Each module defines an explicit **Activation Trigger**, a **Strict YAGNI** negative constraint (prohibiting premature scaffolding if unrequested), and the **Exact Architecture Protocol** when triggered.

- **Rationale & Alternatives**:
  - *Alternative Considered (Monolithic Checklist)*: Keeping all capabilities as flat rules in `AGENTS.md` was rejected because AI agents interpret flat rules as universal mandates, resulting in premature infrastructure scaffolding.
  - *Alternative Considered (Dynamic Plugin Architecture)*: Keeping capabilities in external documentation was rejected because agents need a single source of truth in `AGENTS.md` that is always in context.
  - *Chosen Approach*: The bipartite model preserves 100% rigor for universal invariants while establishing strict Just-In-Time discipline for feature-specific capabilities.

- **Consequences**:
  - **Positive**: Eliminates premature scaffolding; ensures clean, minimal codebases; keeps container footprint minimal; establishes clear, repeatable protocols for every specialized capability when requested by tenants; completely protects Domain Core purity.
  - **Trade-offs**: Requires the agent to execute a Capability Discovery step during the Cognitive Loop prior to writing code or modifying container configurations.

---

## ADR-003: Enterprise Identity (SAML/SCIM), Tenant Lifecycle State Machine, Secure Impersonation, and Agent Data Hygiene

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Subsequent research into B2B enterprise SaaS architecture and autonomous coding agent failure modes revealed four critical enterprise-tier capability gaps and two operational agent safety gaps:
  1. **Enterprise Identity**: Enterprise customers mandate SAML 2.0 / OIDC federation and automated directory user provisioning/deprovisioning via SCIM 2.0 to eliminate zombie accounts.
  2. **Tenant Lifecycle & Degradation**: In production, tenants transition between lifecycle states (`PROVISIONING`, `ACTIVE`, `PAST_DUE`, `SUSPENDED`, `ARCHIVED`, `DELETED`). Without formal state-machine protocols, system behavior during billing suspensions or data archiving is unpredictable.
  3. **Support Impersonation**: Platform engineers and customer support often need to troubleshoot in customer workspaces. Naive implementations introduce backdoor login vulnerabilities.
  4. **Hierarchical Multi-Tenancy**: Enterprise organizations hold contracts with multiple subsidiary workspaces, requiring inherited entitlements and shared quota pooling.
  5. **Agent Safety & Data Hygiene**: Coding agents often fail by hallucinating commands, outputting unmasked credentials into logs/traces, or attempting bug fixes without writing regression reproduction tests first.

- **Decision**:
  1. **Enterprise Capabilities Expansion (Part II)**:
     - Add **Capability 22: Enterprise SSO (SAML 2.0 / OIDC) & SCIM 2.0 Directory Sync** via owned `ISSOAdapter` and tenant-scoped IdP metadata.
     - Add **Capability 23: Tenant Lifecycle State Machine & Service Degradation** (predictable suspension, background job quarantine, read-only gating).
     - Add **Capability 24: Secure Support Impersonation & Audit Access** with ephemeral tokens ($\le$ 60m), dual-identity audit logging, and credential mutation blocks.
     - Add **Capability 25: Hierarchical Multi-Tenancy (Organizations, Workspaces & Teams)** with inherited billing pools and strict workspace operational scoping.
  2. **Universal Core Invariant Guardrails (Part I)**:
     - Add **Defect Fix Protocol (Red-to-Green Reproduction)**: Mandate writing an isolated failing regression test before implementing any defect fix.
     - Add **PII & Credential Scrubbing**: Absolute ban on logging raw secrets, auth tokens, or PII into telemetry, traces, or audit logs.

- **Rationale & Alternatives**:
  - *Alternative Considered (Ad-hoc Support Logins)*: Rejected because un-audited support logins violate SOC2/HIPAA and risk severe security breaches.
  - *Alternative Considered (Global SSO Configuration)*: Storing SAML credentials globally in environment variables was rejected because enterprise multi-tenancy requires every tenant to configure its own distinct IdP (Okta, Azure AD).

- **Consequences**:
  - **Positive**: Complete enterprise deal-readiness; rock-solid tenant lifecycle handling; zero security backdoors for support; bulletproof agent safety during bug fixes and logging.
  - **Trade-offs**: Introduces more domain states to manage during tenant status changes.

---

## ADR-004: Tenant Isolation via Explicit Aggregate Root Encapsulation and Scoped Repository Ports

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  In multi-tenant systems, deciding how `tenant_id` is propagated into the Domain Core represents a pivotal architectural fork:
  1. *Ambient Context (AsyncLocalStorage / Thread-Local)*: Hides tenant identity from method signatures, but introduces significant failure risks: context leaks in promise chains, event emitters, background worker queues, and untestable implicit state in London School unit tests.
  2. *Parameter Drilling*: Passing `tenantId` into every method across all layers adds noise and boilerplate.
  3. *Domain Aggregate Root Encapsulation*: Making `tenantId` an immutable, permanent property of every Aggregate Root's identity.

- **Decision**:
  Adopt **Explicit Aggregate Root Encapsulation & Repository Scoping**:
  1. Every Domain Aggregate Root permanently encapsulates its `tenantId` upon construction. Entities cannot exist in an orphaned or ambiguous multi-tenant state.
  2. Repository ports strictly enforce `(tenantId, entityId)` on all lookups and mutations (e.g., `findById(tenantId: TenantId, id: EntityId)`). Single-identifier lookups without tenant scoping (`findById(id)`) are strictly forbidden at the port boundary.
  3. London School Outside-In TDD unit tests must explicitly assert tenant arguments on collaborator mock verifications.

- **Rationale & Alternatives**:
  - *Alternative Considered (AsyncLocalStorage)*: Evaluated and rejected. While it reduces parameter lists, ambient context breaks down in asynchronous worker queues (`IJobQueue`), event dispatchers, and creates hidden dependencies that violate pure DI and mockist TDD principles.
  - *Alternative Considered (Global Tenant Filters in ORM)*: Rejected because relying on magical ORM middleware leaves Domain Core ignorant of tenancy boundaries, risking cross-tenant data corruption if bypassed.

- **Consequences**:
  - **Positive**: 100% testable purity; collaborator mocks explicitly verify tenant parameters; cross-tenant query leaks are physically prevented by the type system and port contracts; works uniformly across HTTP, background jobs, CLI, and event consumers.
  - **Trade-offs**: Repository interfaces must declare `tenantId` as the first argument in all query methods.

---

## ADR-005: Transport-Agnostic Commercial Entitlement Enforcement at the Application Use-Case Boundary

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Deciding where to enforce commercial entitlement and quota evaluations in the execution lifecycle presents three architectural choices:
  1. *HTTP Transport Middleware / Route Guards*: Validates access before invoking the controller. Fast, but tightly coupled to the HTTP transport layer and completely blind to background jobs (`IJobQueue`), CLI tools, scheduled cron jobs, and event consumers.
  2. *Command Bus Interceptor Pipeline*: Reflects on command metadata. Provides centralized interception, but adds abstraction complexity and reflection overhead.
  3. *Application Use-Case Boundary*: Use cases / Command Handlers explicitly invoke `assertAccess(tenantId, featureKey)` and `assertQuota(tenantId, metricKey, quantity)`.

- **Decision**:
  Adopt **Application Use-Case Boundary Enforcement**:
  1. Every Application Use Case modifying restricted capabilities or consuming quota explicitly calls `await this.entitlementPort.assertAccess(tenantId, featureKey)` before invoking domain mutations.
  2. Transport-level guards (HTTP middleware) may be used optionally as a fast-rejection cache, but can never replace Application Use-Case guards.
  3. In London School Outside-In TDD, use cases must mock `IEntitlementPort` directly and assert that unauthorized attempts throw typed commercial domain errors (`EntitlementExceededError` $\to$ HTTP 402, `QuotaExhaustedError` $\to$ HTTP 429).

- **Rationale & Alternatives**:
  - *Alternative Considered (HTTP Middleware Only)*: Rejected because asynchronous background worker handlers, webhook consumers, and CLI commands would bypass entitlement verification, allowing tenants to exploit out-of-band execution paths without being billed or gated.
  - *Alternative Considered (Domain Core Entitlement Checks)*: Rejected because Domain Core must remain purely focused on business invariants and unaware of commercial pricing structures or billing tiers.

- **Consequences**:
  - **Positive**: 100% transport-agnostic; all execution paths (HTTP, queues, CLI, cron) are protected uniformly; easily mockable and verifiable in unit tests; keeps Domain Core pure while guarding application entrypoints.
  - **Trade-offs**: Use cases must explicitly inject and call `IEntitlementPort`.

---

## ADR-006: Shared Database with Native PostgreSQL Row-Level Security (RLS) as Default Isolation Standard

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Selecting a baseline datastore isolation architecture in multi-tenant SaaS requires balancing operational overhead with security defense-in-depth:
  1. *Application-Level Filtering Only (`WHERE tenant_id = ?`)*: High portability, but catastrophic blast radius: a single missing `WHERE` clause or raw SQL join leaks entire tables across tenants.
  2. *Schema-per-Tenant from Day 1*: Clean physical schema boundaries, but severe operational friction: connection pool exhaustion, schema migration drift across hundreds of schemas, and heavy database server overhead.
  3. *Pooled Database with Native Row-Level Security (RLS)*: A single shared database where PostgreSQL natively enforces tenant row isolation via session variables.

- **Decision**:
  Adopt **Pooled Database with Native PostgreSQL Row-Level Security (RLS)** as the default:
  1. All tenant-partitioned tables must enable RLS (`ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`).
  2. Migration scripts attach security policies using `USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)`.
  3. Database adapters/transaction managers inject `SET LOCAL app.current_tenant_id = ?` on connection checkout.
  4. Integration tests must assert that cross-tenant queries return zero records even when application-level `WHERE` clauses are omitted.
  5. Siloed schemas or dedicated databases are reserved strictly as an enterprise-tier upgrade (Capability 17).

- **Rationale & Alternatives**:
  - *Alternative Considered (Application Filtering Only)*: Rejected because human or AI coding errors in SQL queries can cause catastrophic data leakage breaches.
  - *Alternative Considered (Schema-per-Tenant Day 1)*: Rejected due to migration fragility, deploy latency, and unneeded infrastructure complexity during initial growth phases.

- **Consequences**:
  - **Positive**: Automated defense-in-depth at the database kernel level; zero schema migration sprawl; highly cost-effective; seamless migration path to enterprise siloed schemas when required.
  - **Trade-offs**: Requires setting session variables on transactions and configuring database roles properly (bypassing RLS requires explicit superuser/BYPASSRLS privileges).
