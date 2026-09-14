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

---

## ADR-007: Feature-Flagged Domain Strategy Factory Pattern for Conflicting Tenant Workflows

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  When different enterprise tenants require divergent, conflicting business logic (e.g. approval hierarchies, custom calculations, export formats), resolving strategies dynamically requires choosing an architectural mechanism:
  1. *Database-Backed Tenant Policy Config*: Storing policy names in tenant database records loaded via repository. Works, but adds database lookup latency to use cases and lacks percentage rollouts or dynamic targeting capabilities.
  2. *Declarative Rule Engine*: Writing an internal JSON-schema/DSL rule interpreter. Over-engineered and complex to test with Outside-In TDD.
  3. *Feature-Flagged Strategy Factory Pattern*: Application layer queries an owned `IFeatureFlagPort` string toggle and resolves the typed Domain Strategy via a factory.

- **Decision**:
  Adopt the **Feature-Flagged Domain Strategy Factory Pattern**:
  1. Domain Core defines the strategy interface (e.g., `IFulfillmentStrategy`) and pure domain implementations (`FifoApprovalStrategy`, `OptimisticAutoStrategy`). Domain Core contains zero tenant IDs or flag knowledge.
  2. The Application layer defines a typed `DomainPolicyFactory` that queries `IFeatureFlagPort.getStringValue('fulfillment_strategy', context, 'default')` to instantiate the corresponding strategy.
  3. Use cases receive the resolved strategy via Pure Constructor DI or method injection.
  4. In London School Outside-In TDD, each strategy is tested as an isolated domain unit with 100% coverage, and the factory is unit-tested by mocking `IFeatureFlagPort`.

- **Rationale & Alternatives**:
  - *Alternative Considered (Tenant-ID branching in Domain Core)*: Strictly forbidden because it couples Domain Core directly to external customer identities, violates Open-Closed Principle, and makes testing fragile.
  - *Alternative Considered (Database Configuration)*: Rejected as the primary mechanism because feature flags support in-memory caching, offline fallbacks, and Canary/A-B targeting without database query overhead.

- **Consequences**:
  - **Positive**: Domain Core stays 100% pure; new tenant variations can be introduced by adding a new Strategy class without modifying existing strategies; testing is clean, fast, and deterministic; enables instant rollback or targeted canary rollout per tenant.
  - **Trade-offs**: Requires defining a strategy interface, factory, and flag mapping for each divergent workflow.

---

## ADR-008: Universal Stack Agnosticism, Explicit SOLID Invariants, and the DRY vs. AHA Balance

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  A universal agent operating standard must remain 100% portable across programming languages (TypeScript, Python, Go, Rust, C#, Java) and framework ecosystems. Additionally, the relationship between classical software engineering principles (SOLID, GoF Design Patterns, DRY) and multi-tenant domain modeling requires precise codification:
  1. *Stack Agnosticism*: Clarify that tool references (e.g. PostgreSQL, Redis, MinIO, Mailpit) represent canonical development reference implementations for local parity, not mandatory language/driver lock-in.
  2. *SOLID & GoF Alignment*: Explicitly enforce how Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion govern hexagonal boundaries.
  3. *DRY vs. AHA*: Distinguish between invariant single sources of truth (validation, entities) and premature DRY across conflicting tenant business logic.

- **Decision**:
  1. **Strict Stack Agnosticism**:
     - No framework, library, or programming language is assumed.
     - Capability modules specify behavioral contracts and reference parities; concrete implementations are chosen on-demand based on stack-native idioms.
  2. **Codification of SOLID Invariants**:
     - **SRP**: Clean segregation between Identity, RBAC, Entitlements, Metering, and Billing.
     - **OCP**: Domain Core is closed to modification (banning `if (tenant.id === '...')`), open to extension via Domain Strategies.
     - **LSP**: All ports must have 100% interchangeable in-memory test doubles and production adapters.
     - **ISP**: Fine-grained, segregated ports (`IFeatureFlagPort`, `IEntitlementPort`, `IBillingAdapter`).
     - **DIP**: Domain Core depends purely on owned abstractions; infrastructure depends on Domain Core.
  3. **AHA (Avoid Hasty Abstractions) over Premature DRY**:
     - DRY applies strictly to domain business invariants and database schema migrations.
     - Premature DRY across divergent tenant workflows is forbidden: duplication is far cheaper than the wrong abstraction. Conflicting tenant requirements are modeled via independent Domain Strategy classes.

- **Rationale & Alternatives**:
  - *Alternative Considered (Prescribing a specific stack)*: Rejected because `AGENTS.md` is designed as a universal standard adaptable to any tech stack.
  - *Alternative Considered (Aggressive DRY across all tenant code)*: Rejected because attempting to share a single workflow class across divergent enterprise clients leads to tangled boolean parameters and regression nightmares.

- **Consequences**:
  - **Positive**: Complete portability across tech stacks; rock-solid architectural foundations; prevents abstraction hell in enterprise customization; aligns mockist TDD with classical engineering rigor.
  - **Trade-offs**: Requires discipline to resist combining similar-looking tenant strategies prematurely.

---

## ADR-009: Twelve-Factor App Methodology and Modern 2026 Cloud-Native Alignment (15-Factor Standard)

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  The Twelve-Factor App methodology (originated in 2011) remains the canonical benchmark for building scalable, portable, resilient Software-as-a-Service applications. Over the past 15 years, modern cloud-native practice has extended these principles into the **15-Factor App** (or "Beyond the Twelve-Factor App"), incorporating critical distributed concerns such as API-First contracts, end-to-end Telemetry & Observability, and Zero-Trust Authentication & Authorization.
  A thorough audit of `AGENTS.md` revealed that while many of these factors were already active (container parity, health probes, RED metrics, multi-tenancy, outside-in TDD), several essential cloud-native production invariants needed explicit codification:
  1. **Disposability & Graceful Shutdown (Factor IX)**: Dynamic cloud environments (Kubernetes, Nomad, Cloud Run) scale and redeploy containers constantly. Without explicit `SIGTERM`/`SIGINT` signal interception, readiness probe failure (`/readyz` $\to$ 503), bounded in-flight request/job draining (15–30s), and clean connection pool teardown, rolling deployments drop active user connections and corrupt asynchronous worker tasks.
  2. **Config vs. Secrets Segregation (Factor III & XV)**: Plain environment variables are insufficient for enterprise security. Non-sensitive operational configuration must be strictly separated from sensitive credentials, certificates, and keys; secrets must be injected from secure vaults/stores and scrubbed from traces, memory dumps, and logs.
  3. **Event-Stream Logging (Factor XI)**: Applications must never manage log files, rotation, or transport. Structured JSON must stream directly to `stdout`/`stderr` as unbuffered event streams.
  4. **Strict Build, Release, Run Separation (Factor V)**: Builds create immutable container images; releases combine image and environment configuration; production containers are 100% immutable (no hot-patching).
  5. **Attached Backing Services & Stateless Processes (Factors IV, VI, VII, VIII, XII)**: Stateless share-nothing processes, ephemeral scratchpad disk, attached backing services referenced dynamically via environment URIs, port-bound listeners, and ephemeral one-off admin jobs (migrations, backfills).

- **Decision**:
  Explicitly formalize and codify the complete 12-Factor + 15-Factor Cloud-Native Architecture Standard in `AGENTS.md`:
  - **Factor I (Codebase)**: Single revision-controlled repository with many environment deploys (`AGENTS.md` Section 1 & 7).
  - **Factor II (Dependencies)**: Explicitly declared, isolated, containerized from Day 1, CycloneDX SBOM generation (`AGENTS.md` Section 7).
  - **Factor III (Config & Secrets)**: Externalized in environment, startup schema validation, secrets segregation from general config (`AGENTS.md` Section 4).
  - **Factor IV (Backing Services)**: Attached resources referenced via environment URIs, wrapped behind owned hexagonal adapters (`AGENTS.md` Section 2 & 7).
  - **Factor V (Build, Release, Run)**: Strict 3-stage separation, immutable container images, zero production patching (`AGENTS.md` Section 7).
  - **Factor VI (Processes)**: Stateless, share-nothing processes; local filesystem is strictly ephemeral scratchpad (`AGENTS.md` Section 5 & 7).
  - **Factor VII (Port Binding)**: Self-contained services bound to explicit ports; local reverse proxy on port 80 (`AGENTS.md` Section 7).
  - **Factor VIII (Concurrency)**: Scale horizontally via the process model (web vs worker processes) (`AGENTS.md` Section 7 & 9).
  - **Factor IX (Disposability & Graceful Shutdown)**: Fast startup (<3s), `SIGTERM`/`SIGINT` signal trapping, `/readyz` 503 cut-off, bounded 15–30s in-flight request/job draining, clean pool disposal (`AGENTS.md` Section 4).
  - **Factor X (Dev/Prod Parity)**: Day-1 container parity across datastores and application runtimes (`AGENTS.md` Section 7).
  - **Factor XI (Logs as Event Streams)**: Unbuffered structured JSON to `stdout`/`stderr`, no in-app logfile rotation (`AGENTS.md` Section 4).
  - **Factor XII (Admin Processes)**: Ephemeral one-off jobs (migrations, seeds) using the identical release container image and environment (`AGENTS.md` Section 3 & 7).
  - **Factor XIII (API First)**: Schema-driven API contracts (OpenAPI, gRPC reflection) generated directly from code schemas (`AGENTS.md` Section 4).
  - **Factor XIV (Telemetry & Observability)**: RED metrics (`/metrics`), W3C `traceparent` OpenTelemetry tracing, decoupled health probes (`/healthz`, `/readyz`, `/startup`) (`AGENTS.md` Section 4).
  - **Factor XV (Zero-Trust Security & Identity)**: Built-in token lifecycles, JTI revocation, least-privilege RBAC, multi-tenant row isolation (RLS), pre-commit secret scanning (`AGENTS.md` Section 1, 4, 5).

- **Rationale & Alternatives**:
  - *Alternative Considered (Implicit Assumption of 12-Factor)*: Evaluated and rejected. When standards do not explicitly prescribe graceful shutdown or secret segregation, autonomous agents and developers routinely implement abruptly exiting processes, log to local files, and hardcode connection strings, causing severe production regressions.
  - *Alternative Considered (Legacy 2011 12-Factor Only)*: Rejected because modern containerized ecosystems require API contracts, distributed tracing, and built-in Zero-Trust security as universal day-1 concerns.

- **Consequences**:
  - **Positive**: Complete cloud-native resilience; zero dropped requests during rolling deploys or autoscaling; clean dev/prod parity; leak-free secret management; full auditability and observability; applications are immediately production-ready for Kubernetes, ECS, Cloud Run, or Nomad.
  - **Trade-offs**: Requires wiring process signal handlers and shutdown hooks at the application Composition Root.

---

## ADR-010: Standardized Open-Source Workspace Architecture, Toolchain, and Verification Blueprint

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Following the formalization of Universal Core Invariants, Triggered Capabilities, and 12/15-Factor Cloud-Native standards, establishing the physical codebase structure and developer workflows requires explicit agreement without implicit assumptions. A rigorous, interactive decision review was conducted covering repository topology, runtimes, frameworks, persistence, testing, quality gates, and local orchestration under the mandate to strictly use best-in-class, battle-tested, permissive open-source tools.

- **Decision**:
  Adopt the following technical stack and workspace architecture:
  1. **Repository Topology & Build Orchestration**:
     - Monorepo workspace managed by **Turborepo** and **pnpm** workspaces (`pnpm-workspace.yaml`).
     - Standardized TypeScript (`tsconfig.base.json`) with strict compiler flags across all packages.
  2. **Application Topology**:
     - `apps/api`: **NestJS** backend modular application exporting OpenAPI v3.1 schemas, serving HTTP endpoints, with pure DI / application services driving domain use cases.
     - `apps/web`: **React 19** Single Page Application bundled with **Vite**, utilizing **TanStack Router** (type-safe file-based routing and deep linking), **TanStack Query** (colocated route loaders and server cache), **shadcn/ui** (headless Radix primitives), and **Tailwind CSS**.
  3. **Shared Package Boundaries (Hexagonal Architecture)**:
     - `packages/domain`: Pure Domain Core (Entities, Value Objects, Domain Events, Strategy Interfaces, Domain Exceptions). Zero external framework or database dependencies.
     - `packages/db`: **PostgreSQL** persistence layer via **Drizzle ORM**, `drizzle-kit` version-controlled migrations, and native Row-Level Security (RLS) policies.
     - `packages/shared`: Shared **Zod** validation schemas, common DTO types, standard API error envelopes, and HTTP contract definitions.
     - `packages/ui`: Shared design system tokens (CSS variables conforming to UI/UX Pro Max 60-30-10) and reusable shadcn component primitives.
  4. **API Contracts & Client Integration**:
     - Shared Zod validation schemas in `packages/shared`.
     - OpenAPI v3.1 specification generated from NestJS.
     - TanStack Query hooks in `apps/web` generated via **Orval** / `@hey-api/openapi-ts`.
  5. **Verification & Testing Infrastructure**:
     - **Vitest** standardized across all packages for unit and integration testing with native ESM, instant watch mode, and a mandatory 100.00% v8 coverage gate.
     - **Playwright** for end-to-end user acceptance and accessibility testing.
  6. **Code Quality, Formatting & Git Discipline**:
     - **Biome** for blazing-fast open-source linting and formatting, enforcing strict TypeScript rules and zero type escapes (`any`, `@ts-ignore`).
     - **Husky** + **lint-staged** + **commitlint** to automate pre-commit linting and enforce Conventional Commits.
  7. **Local Container Orchestration**:
     - Multi-stage Dockerfiles and `docker-compose.yml`.
     - **Traefik** reverse proxy on port 80 routing `/api` to `apps/api` and `/` to `apps/web` with automatic container label discovery.

- **Rationale & Alternatives**:
  - *Alternatives Evaluated*: Monolithic single-directory app, Bun runtime, Fastify/Hono standalone, Next.js App Router, Prisma/TypeORM, Nx, Jest, ESLint/Prettier, Lefthook, Nginx.
  - *Chosen Approach*: Provides the optimal balance of enterprise modularity (NestJS + pnpm monorepo), type-safe client-server contracts (Zod + OpenAPI + TanStack), blazing-fast iteration (Vite + Vitest + Biome), and seamless compliance with `AGENTS.md` and 12-factor cloud-native standards.

- **Consequences**:
  - **Positive**: Zero assumptions; strict boundary isolation between domain core, database, and presentation; end-to-end type safety; sub-second linting and testing; predictable day-1 container parity.
  - **Trade-offs**: Requires setting up initial workspace boilerplate (pnpm, Turborepo, Biome, TypeScript project references).

---

## ADR-011: Feature-Driven Hexagonal Folder Structure and Sibling Test Colocation Protocol

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Organizing files within a multi-package hexagonal monorepo requires an explicit architectural standard to avoid two prevalent industry anti-patterns:
  1. *Horizontal Layer Smushing*: Dumping all controllers in `/controllers`, all services in `/services`, and all entities in `/entities`. This fractures feature cohesion, requiring developers to jump across 6 directories to touch one feature, and creates hidden circular dependencies.
  2. *Decoupled Unit Test Mirrors*: Placing unit tests in a mirrored top-level `test/` folder separate from `src/`. In large monorepos, mirrored test folders lead to orphaned tests when source files are renamed or relocated, brittle deep relative import paths (`../../src/modules/...`), and poor developer discovery.

- **Decision**:
  Adopt **Feature-Driven Hexagonal Structure with Dual-Tier Test Pairing**:
  1. **Dual-Tier Test Pairing Protocol**:
     - **Unit, Port, and Component Tests (`*.spec.ts` / `*.spec.tsx`)**: Strictly colocated as **direct siblings** in the same directory as the source file under test (e.g. `order.entity.ts` paired with `order.entity.spec.ts`).
     - **Acceptance & End-to-End Tests (`*.e2e-spec.ts`)**: Decoupled in dedicated application-level directories (`apps/api/test/` for HTTP API acceptance, `apps/web/e2e/` for Playwright browser tests).
  2. **Backend Hexagonal Module Layout (`apps/api`)**:
     Organize by feature vertical slices conforming to Hexagonal Architecture:
     ```text
     apps/api/src/modules/<feature>/
     ├── domain/                  # Feature domain models & outbound ports
     │   ├── <feature>.entity.ts
     │   ├── <feature>.entity.spec.ts      <-- Sibling test
     │   └── ports/
     │       └── <feature>.repository.port.ts
     ├── application/             # Use cases & application orchestration
     │   ├── <feature>.service.ts
     │   └── <feature>.service.spec.ts     <-- Sibling unit test (mocking ports)
     ├── infrastructure/          # Adapters (persistence, external gateways)
     │   └── <feature>.drizzle.repository.ts
     │   └── <feature>.drizzle.repository.spec.ts
     ├── presentation/            # Primary adapters (HTTP controllers & DTOs)
     │   ├── <feature>.controller.ts
     │   ├── <feature>.controller.spec.ts  <-- Sibling unit test
     │   └── dto/
     │       └── <feature>.dto.ts
     └── <feature>.module.ts      # NestJS Composition Root wiring
     ```
  3. **Frontend Feature Layout (`apps/web`)**:
     Organize by routes and colocated feature logic:
     ```text
     apps/web/src/
     ├── routes/                  # TanStack Router file-based route definitions
     │   ├── __root.tsx
     │   └── index.tsx
     ├── features/<feature>/      # Cohesive feature domain
     │   ├── components/          # Feature UI components + sibling *.spec.tsx
     │   ├── hooks/               # Custom hooks + sibling *.spec.ts
     │   └── queries/             # TanStack Query queryOptions definitions
     └── components/ui/           # Shared shadcn/Radix accessible primitives
     ```
  4. **Domain & Shared Packages (`packages/*`)**:
     - `packages/domain`: Pure Domain Core models (`core/`, `aggregates/`, `entities/`, `value-objects/`, `events/`, `policies/`) with sibling `*.spec.ts`.
     - `packages/db`: Drizzle schemas (`schema/`), migrations (`migrations/`), client pool, and RLS session injection helpers with sibling `*.spec.ts`.
     - `packages/shared`: Zod validation schemas, error envelopes, and HTTP contract DTOs with sibling `*.spec.ts`.
     - `packages/ui`: Design tokens and headless primitives with sibling `*.spec.ts`.

- **Rationale & Alternatives**:
  - *Alternative Considered (Mirrored Test Folder for Unit Tests)*: Rejected because moving or deleting a feature requires manual pruning in two distant trees, and developer tests are frequently forgotten or bypassed during refactoring.
  - *Alternative Considered (Flat Layer-by-Type Structure)*: Rejected because grouping by type (all controllers together) impairs modularity and prevents encapsulating feature boundaries.

- **Consequences**:
  - **Positive**: Cohesive feature encapsulation; refactor-safe test mobility; zero orphaned tests; instant sub-second test discovery; clear architectural separation between Domain Core, Application, and Adapters.
  - **Trade-offs**: Requires configuring toolchains (such as TanStack Router) to ignore sibling `*.spec.*` files during route generation (already configured).

---

## ADR-012: Real Estate Rental Management Domain Model, Ubiquitous Language, and Business Specifications

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Transitioning from workspace infrastructure to business domain modeling requires defining the core bounded contexts, ubiquitous language, aggregate invariants, and business rules for rental property management. Key design challenges included:
  1. *Naming Collision*: Disambiguating multi-tenant SaaS workspace identity (`tenantId`) from the physical counter-party leasing real estate.
  2. *Tri-Modal Scope*: Supporting multi-unit residential, co-living/shared housing, and commercial real estate within a unified domain model.
  3. *Utility & Financial Flexibility*: Modeling divergent utility billing mechanisms (sub-meters, RUBS, roommate splits, flat fees), payment allocation waterfalls, late fee policies, and security deposit escrow settlements without hardcoding conditionals.

- **Decision**:
  1. **Strict Tenancy Disambiguation**:
     - `tenantId` is reserved exclusively for the SaaS customer workspace (Landlord / Property Management Company) at the database and application boundary.
     - The leasing party is represented by `Renter` with polymorphic subtypes: `Resident` (residential), `Occupant` (co-living room), and `CommercialClient` (commercial businesses).
  2. **Bounded Context Architecture**:
     - *Property & Space Catalog Context*: `PropertyAggregate` and `RentableSpaceAggregate` supporting whole units, private rooms, and commercial suites.
     - *Lease & Tenancy Context*: `LeaseAgreementAggregate` governed by `ILeaseTransitionPolicy` state machines.
     - *Utility Metering & Calculation Context*: `UtilityMeterAggregate` and `IUtilityCalculationStrategy` (Sub-meter, RUBS SqFt/Occupants, Equal Split, Flat Fee).
     - *Invoicing & Payments Context*: `RentalInvoiceAggregate`, `IPaymentAllocationStrategy` (FIFO Waterfall, Proportional, Strict Full), and `ILateFeeStrategy`.
     - *Security Deposit Escrow Context*: Full escrow ledger tracking move-in collection, itemized move-out deductions, and settlement statements.
  3. **Formal Documentation Assets**:
     - Codified comprehensive domain entities, ubiquitous language, and state machines in [`docs/DOMAIN_ANALYSIS.md`](file:///home/prosubodh/projects/sthanori/docs/DOMAIN_ANALYSIS.md).
     - Codified functional and non-functional requirements, edge cases, and user roles in [`docs/BUSINESS_REQUIREMENTS.md`](file:///home/prosubodh/projects/sthanori/docs/BUSINESS_REQUIREMENTS.md).

- **Rationale & Alternatives**:
  - *Alternative Considered (Using "Tenant" for Renters)*: Strictly rejected due to intolerable naming ambiguity and query contamination with SaaS `tenantId`.
  - *Alternative Considered (Single Residential-Only Model)*: Rejected in favor of the unified tri-modal model enabling Sthanori to serve residential, co-living, and commercial landlords seamlessly.
  - *Alternative Considered (Hardcoded Billing Logic)*: Rejected; all algorithmic variations (utilities, late fees, payment allocation, proration) use the Feature-Flagged Strategy Pattern (ADR-007).

- **Consequences**:
  - **Positive**: Clean, collision-free ubiquitous language; total business alignment before writing implementation code; extreme modularity through domain strategies; auditable financial ledger architecture.
  - **Trade-offs**: Requires building domain strategy implementations for each billing variant.

---

## ADR-013: Deep-Dive Domain Model Extensions: Roommate Split Invoicing, Owner Disbursements, CAM, Work Orders, and Utility Anomaly Guards

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Following the baseline domain analysis, a deeper exploration of real-world operational realities across property management, utility billing, and co-living revealed several sophisticated requirements:
  1. *Roommate & Co-Living Billing*: Managing multi-renter households requires supporting both Joint & Several liability with individualized sub-invoices, single master invoices, and room-by-room leases.
  2. *Third-Party Property Ownership*: Managing assets for external property investors requires tracking management fee percentage commissions and generating net owner disbursement statements.
  3. *Common Area Maintenance (CAM)*: Allocating shared house utilities (hallway lighting, lobby HVAC, elevators) via landlord absorption, percentage deductions before RUBS, or itemized surcharges.
  4. *Maintenance Work Orders & Cost Attribution*: Distinguishing between landlord operating expenses and tenant chargebacks (invoiced on the renter's subsequent bill for tenant-caused damages).
  5. *Lease Renewals & Stepped Rent Escalation*: Automated 60/90-day renewal proposals and scheduled future rent adjustments over multi-year commercial/residential leases.
  6. *Deposit Escrow Banking & Jurisdictional Interest*: Multi-type deposits (security, pet, key, advance rent), designated escrow accounts, and statutory annual interest accrual.
  7. *Utility Anomaly Gates*: Protecting against typographical errors, pipe leaks, and meter rollovers (>200% spike threshold or decreasing readings) before invoice generation.

- **Decision**:
  1. **Configurable Strategy Extensions**:
     - Adopt `IRoommateBillingStrategy`: `JointSeveralSplitInvoiceStrategy`, `SingleMasterInvoiceStrategy`, and `IndividualRoomLeaseStrategy`.
     - Adopt `ICamCalculationStrategy`: `LandlordAbsorptionStrategy`, `MasterBillDeductionPercentageStrategy`, and `ItemizedCamSurchargeStrategy`.
     - Adopt `IMeterValidationPolicy`: `DecreasingReadingPolicy`, `SpikeDetectionPolicy` (>200% threshold), and `PermissivePolicy`.
  2. **Aggregate Model Extensions**:
     - Introduce `PropertyOwnerAggregate` to model external property investors and monthly disbursement statements.
     - Introduce `MaintenanceWorkOrderAggregate` with financial cost attribution (`LANDLORD_EXPENSE` vs. `TENANT_CHARGEBACK`).
     - Expand `LeaseAgreementAggregate` with `RentEscalationSchedule` and 60/90-day renewal offer proposal workflows.
     - Expand `SecurityDepositEscrowLedger` with multi-deposit categories, escrow bank tagging, and statutory interest accrual.
  3. **Documentation Assets**:
     - Fully updated and expanded [`docs/DOMAIN_ANALYSIS.md`](file:///home/prosubodh/projects/sthanori/docs/DOMAIN_ANALYSIS.md) and [`docs/BUSINESS_REQUIREMENTS.md`](file:///home/prosubodh/projects/sthanori/docs/BUSINESS_REQUIREMENTS.md).

- **Rationale & Alternatives**:
  - *Alternatives Considered*: Treating roommates only as a single lumped bill was rejected because co-living operators and modern apartment renters demand individual billing and payment autonomy. Treating maintenance purely as a text note was rejected because tenant damage chargebacks represent a major financial revenue recovery item.
  - *Strategy Pattern*: Keeping all variants configurable via feature flags and factories ensures zero tenant conditionals in domain core.

- **Consequences**:
  - **Positive**: Complete real-world market readiness for residential complexes, co-living operators, and commercial management companies; auditable fiduciary accounting; automated leak and typo detection.
  - **Trade-offs**: Expands the domain model to include work orders and owner disbursements alongside leases and utility meters.

---

## ADR-014: Advanced Rental Billing Domain Architecture: Renter Meter Submissions, Move-Out Settlements, Ancillary Services, Concessions, Delinquency Plans, and Tax Engine

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Operating real estate rental portfolios involves continuous edge cases across the resident lifecycle: utility billing lags during mid-month move-outs, self-service meter reading submissions, ancillary fee monetization, promotional discounts, rent delinquency, and local tax compliance. These required domain formalization to ensure clean DDD aggregates and eliminate hardcoded branching:
  1. *Move-Out Utility Settlement*: Municipal utility bills often arrive 30 days after a tenant vacates, creating tension with statutory security deposit refund deadlines (14–21 days).
  2. *Renter Meter Submission with Photo Proof*: Self-managed landlords need residents to submit sub-meter dial photos directly to avoid inspection overhead while preventing disputes.
  3. *Ancillary Add-ons & Incidental Fees*: Monetizing parking spaces (including metered EV charging), pet rent, storage units, and valet trash via recurring lease attachments.
  4. *Concessions & Payment Incentives*: Upfront free months, amortized net effective rent discounts with clawback terms, and early-bird payment discounts.
  5. *Delinquency & Eviction Workflows*: Statutory legal notices, installment repayment agreements, and legal holds that block partial payments to protect active eviction filings.
  6. *Tax & VAT/GST Compliance*: Evaluating line-item taxability across exempt residential rent, taxable commercial leases, parking surcharges, and utility user taxes.

- **Decision**:
  1. **New Aggregates & Value Objects**:
     - `MeterReadingSubmissionAggregate`: Submitter role (`RENTER` | `LANDLORD` | `TECHNICIAN`), photo proof URL, reading values, and verification review lifecycle.
     - `AncillaryServiceLedger`: Attached recurring add-ons (parking, pets, storage, valet trash) generating automated monthly invoice lines, plus one-off incidentals.
     - `ConcessionSchedule`: Upfront free months or monthly amortized discounts with early-termination clawback conditions.
     - `RepaymentPlanAggregate`: Tracking structured installment agreements for delinquent arrears with monthly installment billing.
     - `LegalHoldFlag`: Fiduciary guard on renter accounts blocking partial payments during legal/eviction actions.
  2. **Configurable Strategy Extensions**:
     - `IFinalUtilitySettlementStrategy`: `FinalPhysicalMeterReadingStrategy`, `HistoricalDailyAverageStrategy`, and `TemporaryEscrowHoldbackStrategy`.
     - `ITaxCalculationStrategy`: Evaluating line-item taxability across jurisdictions (exempt residential vs. taxable commercial/ancillary).
     - `IConcessionStrategy`: Managing upfront vs. amortized concession applications.
  3. **Documentation Assets**:
     - Synchronized comprehensive domain models, state machines, and bounded contexts in [`docs/DOMAIN_ANALYSIS.md`](file:///home/prosubodh/projects/sthanori/docs/DOMAIN_ANALYSIS.md).
     - Expanded functional requirements to 15 modules in [`docs/BUSINESS_REQUIREMENTS.md`](file:///home/prosubodh/projects/sthanori/docs/BUSINESS_REQUIREMENTS.md).

- **Rationale & Alternatives**:
  - *Self-Service Meter Photo Ingestion*: Eliminates landlord friction for nearby/self-managed setups while providing tamper-evident audit trails.
  - *Move-Out Settlement Flexibility*: Gives landlords legal options (holdback vs. historical estimation) based on local tenancy legislation.
  - *Strategy Pattern*: Ensures zero tenant conditionals in domain core; all variations configured via feature flags and policy factories.

- **Consequences**:
  - **Positive**: Complete coverage of real-world rental billing complexities; legally sound eviction and deposit workflows; maximized ancillary revenue tracking; total clarity for implementation.
  - **Trade-offs**: Requires building rich validation rules and multi-party workflows (renter submission $\to$ landlord review).

---

## ADR-015: Advanced Multi-Utility Tariff Engine, Sewer Baselining, EV Charging, and Cascading Meter Trees

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Real-world real estate utility operations encompass diverse physical services and complex pricing models that go far beyond flat-rate sub-metering:
  1. *Multi-Resource Physics*: Services span electricity (`KWH`, `KW` peak demand), clean water (`GALLONS`, `CCF`, `CUBIC_METERS`), unmetered wastewater/sewer, natural gas (`THERMS`), central chilled water (`TON_HOURS`), high-speed internet tiers, trash bins, and EV charging stations.
  2. *Complex Tariff Structures*: Utility providers employ inclining block tariffs (IBT), two-part tariffs (fixed customer readiness charge + volumetric usage), Time-of-Use (TOU) windows (peak/off-peak/shoulder), and seasonal summer/winter multipliers.
  3. *Wastewater/Sewer Baselining*: Wastewater outflow is unmetered. Naive 100% water coupling overcharges residents who water plants. The Winter Quarter Average (WQA) method is standard industry practice to cap sewer billing during non-irrigation seasons.
  4. *EV Charging Fleet Management*: Electric vehicle stations require multi-factor billing (energy delivered + session initiation + punitive idle dwell penalties post-grace period) to prevent charger hogging.
  5. *Cascading Meter Trees & Virtual CAM*: Large properties route power through hierarchical distribution panels (Master Meter $\to$ Sub-station $\to$ Unit Sub-meters + CAM panel). The system must derive virtual CAM when unmetered and flag distribution line loss (>5% variance).
  6. *Solar Net-Metering & Master Discrepancies*: Rooftop solar generation and master bill bulk discounts require configurable allocation (`LandlordAbsorption` vs. `ProportionalPassThrough`).

- **Decision**:
  1. **New Aggregates & Value Objects**:
     - `UtilityTariffAggregate`: Encapsulates `TariffStructureType` (`SINGLE_RATE`, `INCLINING_BLOCK_TIERED`, `TWO_PART_FIXED_VOLUMETRIC`, `TIME_OF_USE`), fixed monthly customer readiness charge, contiguous rate tiers (`minUnits`, `maxUnits`, `ratePerUnit`), Time-of-Use rate windows, and seasonal multipliers.
     - Hierarchical Meter Tree: `UtilityMeterAggregate` encapsulates optional `ParentMeterId`, virtual CAM calculation, and automated line loss threshold auditing ($>5\%$).
  2. **Configurable Strategy Extensions**:
     - `ITariffEvaluationStrategy`: `SingleRateTariffStrategy`, `IncliningBlockTariffStrategy`, `TwoPartTariffStrategy`, `TimeOfUseTariffStrategy`.
     - `ISewerCalculationStrategy`: `WaterPercentageSewerStrategy`, `WinterQuarterAverageSewerStrategy` (WQA), and `FlatSewerFeeStrategy`.
     - `IEvChargingTariffStrategy`: `MultiFactorEvChargingStrategy` (energy + session fee + idle penalty).
     - `IUtilityDiscrepancyStrategy`: `LandlordAbsorptionStrategy` (default) and `ProportionalPassThroughStrategy`.
  3. **Formalized Documentation**:
     - Updated [`docs/DOMAIN_ANALYSIS.md`](file:///home/prosubodh/projects/sthanori/docs/DOMAIN_ANALYSIS.md) (Section 8).
     - Updated [`docs/BUSINESS_REQUIREMENTS.md`](file:///home/prosubodh/projects/sthanori/docs/BUSINESS_REQUIREMENTS.md) (Module 16).

- **Rationale & Alternatives**:
  - *Strategy Pattern*: Keeps all algorithmic variations isolated behind domain ports, resolved via feature flags and factories (ADR-007). Zero tenant branching in Domain Core.
  - *Decoupled Tariff Aggregate*: Decouples physical meters (hardware, serial number, pulse multiplier, location) from commercial tariffs (effective dates, rates, tiers, seasonal adjustments).

- **Consequences**:
  - **Positive**: Full-spectrum market readiness for residential complexes, commercial retail/office buildings, and co-living operators with complex utility structures; automated leak and line-loss detection; fair sewer and solar accounting.
  - **Trade-offs**: Requires building tier validation and time-window resolution in domain services.

---

## ADR-016: Move-In/Move-Out Condition Inspection, Useful-Life Depreciation Engine, and Deposit Dispute Resolution

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Security deposit deductions represent the most contentious and legally sensitive workflow in rental property operations:
  1. *Statutory Protection for Normal Wear and Tear*: Property legislation strictly prohibits charging tenants for reasonable deterioration resulting from everyday living (e.g. minor paint scuffing, carpet flattening in traffic pathways).
  2. *Useful Life & Unlawful Replacement Charges*: Landlords cannot legally charge full replacement costs for aged property finishes. If a tenant ruins a 4-year-old carpet with a 5-year useful life, the tenant is only liable for the remaining $20\%$ useful value.
  3. *Evidence Defensibility*: Enforceable move-out deductions require unambiguous photographic and checklist evidence contrasting move-in baseline condition against move-out condition.
  4. *Dispute Resolution & Statutory Clocks*: Tenants must have a structured mechanism to rebut itemized deductions with counter-evidence within strict jurisdictional response deadlines (14–21 days) to prevent statutory bad-faith penalties.

- **Decision**:
  1. **New Aggregates & Value Objects**:
     - `ConditionInspectionAggregate`: Captures walkthrough inspections (`MOVE_IN`, `MID_LEASE_PERIODIC`, `MOVE_OUT`) structured by room areas (`LIVING_ROOM`, `KITCHEN`, `BEDROOM`, `BATHROOM`, etc.) and element categories (`WALLS_CEILING`, `FLOORING_CARPET`, `WINDOWS_BLINDS`, `APPLIANCES`, etc.), storing condition grades, cleanliness ratings, timestamped photo URLs, and inspector/renter e-signatures.
     - `AssetDepreciationSchedule`: IRS/HUD-aligned useful life catalog (Paint: 36 mo, Carpet: 60 mo, Vinyl/Laminate: 120 mo, Hardwood: 240 mo, Appliances: 120 mo, Drywall: Indefinite) driving straight-line monthly depreciation formulas.
     - `DamageDisputeAggregate`: Formal dispute lifecycle tracking contested deduction lines, renter rebuttal narratives, counter-evidence photos, statutory response deadlines, and settlement credit memo adjustments.
  2. **Automated Diffing & Settlement Integration**:
     - The inspection engine automatically diffs move-out conditions against move-in baselines.
     - For any downgraded item, repair estimates are fed into the depreciation engine to calculate `MaxAllowableTenantCharge` ($\text{Cost} \times (1 - \text{Age} / \text{UsefulLife})$).
     - Resulting depreciated charges feed directly into `SecurityDepositEscrowLedger.MoveOutSettlementStatement`.
  3. **Documentation Assets**:
     - Updated [`docs/DOMAIN_ANALYSIS.md`](file:///home/prosubodh/projects/sthanori/docs/DOMAIN_ANALYSIS.md) (Section 9).
     - Updated [`docs/BUSINESS_REQUIREMENTS.md`](file:///home/prosubodh/projects/sthanori/docs/BUSINESS_REQUIREMENTS.md) (Module 17).

- **Rationale & Alternatives**:
  - *Depreciation Rigor*: Building asset depreciation directly into the domain model guarantees compliance with jurisdictional deposit laws and protects property managers from tenant litigation.
  - *Strategy Pattern*: Keeps dispute workflows and depreciation formulas modular and auditable.

- **Consequences**:
  - **Positive**: 100% legal compliance for deposit accounting; automated dispute tracking with statutory countdowns; seamless move-in to move-out condition diffing.
  - **Trade-offs**: Requires rich checklist modeling and photo asset links.

---

## ADR-017: Lease Guarantors, Corporate Master Leases, and Deposit Replacement Surety Programs

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Expanding tenant financial access and enterprise client onboarding requires modeling sophisticated guarantee and corporate lease structures:
  1. *Guarantor vs. Co-Signer Distinction*: Borderline applicants (students, international workers) require third-party credit enhancement. A Co-signer signs the lease and has full possessory rights, while a Guarantor signs an independent unilateral guarantee agreement with strictly zero tenancy/entry rights.
  2. *Corporate Master Leases*: Corporate entities (LLCs, hospitals, embassies) contract leases to house rotating employees. The corporate entity is the legal obligor paying master bills, while rotating human occupants reside in the space with credential turnover tracking.
  3. *Deposit Alternatives & Capital Unlocking*: Traditional multi-thousand-dollar cash deposits increase vacancy friction. Modern alternatives include commercial surety bonds (e.g. Rhino/Jetty with insurer claim submission and subrogation recovery) and in-house landlord waiver risk pools ($25/mo non-refundable fee).

- **Decision**:
  1. **New Aggregates & Value Objects**:
     - `LeaseGuarantorAggregate`: Encapsulates guarantor profile, unilateral guarantee contract, liability terms (`UNLIMITED_FINANCIAL`, `CAPPED_AMOUNT`, `TIME_BOUND`), and statutory default demand notices (`GuarantorDemandNotice`).
     - Corporate Lease Structure: Encapsulates `CorporateObligor` entity on `LeaseAgreementAggregate` with rotating `AuthorizedOccupantRecord` arrays and `OccupantRotationEvent` credential turnover workflows.
  2. **Configurable Strategy Extensions**:
     - `IDepositGuaranteeStrategy`:
       - `TraditionalEscrowDepositStrategy` (refundable cash in escrow bank account).
       - `ThirdPartySuretyBondStrategy` (bond certificate with insurer claims and subrogation tracking).
       - `InHouseWaiverPoolStrategy` (non-refundable monthly waiver fee pooling into landlord risk reserve).
  3. **Documentation Assets**:
     - Updated [`docs/DOMAIN_ANALYSIS.md`](file:///home/prosubodh/projects/sthanori/docs/DOMAIN_ANALYSIS.md) (Section 10).
     - Updated [`docs/BUSINESS_REQUIREMENTS.md`](file:///home/prosubodh/projects/sthanori/docs/BUSINESS_REQUIREMENTS.md) (Module 18).

- **Rationale & Alternatives**:
  - *Strategy Pattern*: Keeps surety providers behind domain ports, preventing external SDK lock-in.
  - *Entity Segregation*: Separating possessory tenants from financial guarantors prevents unlawful eviction or unauthorized entry claims.

- **Consequences**:
  - **Positive**: Full-spectrum market readiness for student housing, corporate executive suites, and modern deposit-free residential communities; legally sound guarantee contracts.
  - **Trade-offs**: Requires managing occupant turnover rosters and insurance claim lifecycles.

---

## ADR-018: Full-Spectrum Rental Domain Model Review, Invariant Formalization, and Multi-Currency Standardization

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  A systematic, module-by-module relentless questioning review across all 18 functional modules in [`docs/BUSINESS_REQUIREMENTS.md`](file:///home/prosubodh/projects/sthanori/docs/BUSINESS_REQUIREMENTS.md) and [`docs/DOMAIN_ANALYSIS.md`](file:///home/prosubodh/projects/sthanori/docs/DOMAIN_ANALYSIS.md) resolved critical real-world edge cases, operational boundaries, and internationalization requirements:
  1. *Spatial Hierarchy & Mutual Space Exclusion*: Pragmatic hybrid (`buildingBlock` string + `parentSpaceId` for co-living child rooms); strict aggregate validation preventing concurrent leases on parent units and child rooms.
  2. *Renter Identity & Onboarding*: Scoped unique email per workspace; automated default portal account provisioning (`sendInviteImmediately: true`) with deferred suppression for paper leases.
  3. *Proration Mechanics*: `IProrationStrategy` (`ActualCalendarDays` vs `Standard30Day`); configurable threshold (day 20) collecting full 1st month rent at inception with 2nd-month credit adjustment.
  4. *RUBS Vacancy Allocation*: `IRubsVacancyAllocationPolicy` defaulting to statutory `LandlordAbsorbsVacantSharePolicy`, protecting active renters from illegal empty-unit cost shifting.
  5. *Missing Meter Submissions*: `IMissingReadingPolicy` defaulting to `HistoricalAverageEstimatePolicy` (rolling 90-day daily average) with automated true-up on next verified reading.
  6. *Move-Out Settlement Holdback*: Legally compliant two-stage settlement (`InterimMoveOutStatement` within 14/21 days) with configurable `HoldbackSunsetExpiryPolicy` (default 60 days).
  7. *Ancillary Physical Inventory*: `AncillaryInventoryAssetAggregate` tracking finite physical parking/storage spaces with anti-double-booking guards and configurable mid-cycle proration (`IAncillaryProrationPolicy`).
  8. *Concession Clawbacks & Early-Bird Discounts*: `IConcessionClawbackPolicy` (`ProRataClawbackPolicy` default vs `FullClawbackPolicy`); dynamic early-bird discount expiration based on payment arrival timestamp.
  9. *Delinquency & Legal Holds*: Automatic engagement of `IsLegalHoldActive = true` upon statutory Notice to Pay or Quit service, rejecting partial payments to prevent accidental legal waiver.
  10. *Tax Engine Precision*: Configurable `TaxCalculationMode` (`TAX_EXCLUSIVE` vs `TAX_INCLUSIVE`) with canonical line-item Banker's Rounding (half-even) in minor units.
  11. *Roommate Split Invoicing Defaults*: `IRoommateDefaultPolicy` defaulting to `TargetedDefaulterPolicy` with joint co-tenant informational advisory notices.
  12. *Multi-Currency Mandate (USD & NPR)*: Mandatory Day-1 multi-currency architecture supporting `USD` and `NPR` (Nepalese Rupee) stored in minor currency units (cents/paisa integers); Western and Vedic (lakhs/crores) number formatting.
  13. *Payment Reversals & Unapplied Credits*: Immutable `PaymentReversalRecord` for NSF/bounced checks with automatic fee assessment and late fee re-evaluation; automated credit balance drawdowns.
  14. *Maintenance Cost Attribution & Owner Limits*: Evidence-gated tenant chargebacks with mandatory technician notes and 5-day review window; `AuthorizedMaintenanceLimit` on `PropertyOwnerAggregate`.
  15. *Deposit Escrow Interest & Move-In Baseline*: Configurable deposit interest (`NoDepositInterestPolicy` default); 7-day resident discovery window auto-locking Move-In inspections.
  16. *Mid-Cycle Tariffs & Corporate Capacity*: `ITariffEffectiveDatePolicy` with weighted day-count pro-rata splitting; corporate active occupant capacity bound to `RentableSpaceAggregate.MaxOccupants`.

- **Decision**:
  Codified all 16 architectural invariants into `docs/BUSINESS_REQUIREMENTS.md` (Modules 1–18) and `docs/DOMAIN_ANALYSIS.md` (Sections 1–10).

- **Rationale & Alternatives**:
  - Eliminates all operational, legal, and financial ambiguities prior to writing code.
  - Guarantees complete compliance with 12-factor cloud-native principles, Hexagonal Architecture, London School TDD, and multi-tenant PostgreSQL RLS.

- **Consequences**:
  - **Positive**: Zero ambiguity remains; comprehensive, battle-tested domain model ready for implementation; fully configured for international multi-currency operations (USD & NPR).
  - **Trade-offs**: Rich domain models with numerous strategy interfaces, fully tested via mockist TDD.

---

## ADR-019: Mandatory Bilingual Architecture (English & Nepali), Bikram Sambat (BS) Dual Calendar Engine, and Dual-Script Financial Documents

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Operating real estate portfolios across Nepal and international commercial markets mandates deep localization that transcends simple client-side string translations:
  1. *Mandatory Language Pair*: English (`en`) and Nepali (`ne` — नेपाली in Devanagari script) must be supported natively across all interfaces, notification templates (email/SMS), and error envelopes.
  2. *Dual Calendar Reality (Bikram Sambat BS vs. Gregorian AD)*: All government leases, municipal ward registrations, tax years, and local rental agreements in Nepal officially run on the **Bikram Sambat (BS)** calendar. Unlike the Gregorian calendar, Bikram Sambat months vary dynamically from 29 to 32 days based on solar transit. Leases in Nepal frequently mandate rent due on the 1st of the Bikram Sambat month (e.g. 1st of Baishakh).
  3. *Bilingual Legal & Tax Defensibility*: Invoices, payment receipts, and statutory eviction notices must satisfy both international corporate audits (English) and local municipal ward offices in Nepal (Devanagari Nepali).
  4. *Devanagari Numerals & Vedic Grouping*: NPR amounts require formatting in South Asian / Vedic comma notation (Lakhs: `1,00,000`, Crores: `1,00,00,000`) and optional Devanagari digit rendering (`रु. १,५०,०००.००`).

- **Decision**:
  1. **Core Language & Storage Invariants**:
     - English (`en`) and Nepali (`ne`) are locked as mandatory first-class system languages.
     - Database timestamps and aggregate dates remain strictly **ISO 8601 (UTC / Gregorian AD)** to maintain database portability and query efficiency.
  2. **Bikram Sambat Domain Adapter (`ICalendarAdapter`)**:
     - Introduce `ICalendarAdapter` encapsulating deterministic astronomical conversion between Gregorian (AD) and Bikram Sambat (BS, 1970–2100 BS).
     - Leases support configuring `BillingCycleAnchor`: `GREGORIAN_FIRST_OF_MONTH` or `BIKRAM_SAMBAT_FIRST_OF_MONTH`.
  3. **Bilingual Document Rendering**:
     - Financial documents support three layouts: `ENGLISH_ONLY`, `NEPALI_ONLY`, and `BILINGUAL_DUAL_COLUMN` (side-by-side English and Nepali line items).
  4. **Documentation Assets**:
     - Codified Module 19 in [`docs/BUSINESS_REQUIREMENTS.md`](file:///home/prosubodh/projects/sthanori/docs/BUSINESS_REQUIREMENTS.md).
     - Codified Section 11 in [`docs/DOMAIN_ANALYSIS.md`](file:///home/prosubodh/projects/sthanori/docs/DOMAIN_ANALYSIS.md).

- **Rationale & Alternatives**:
  - *Adapter Pattern*: Isolating Bikram Sambat conversion behind `ICalendarAdapter` protects Domain Core from external calendar calculation libraries and preserves database UTC standards.
  - *Dual-Column Layout*: Prevents managing separate conflicting document versions for international tenants and local municipal authorities.

- **Consequences**:
  - **Positive**: 100% native market readiness for Nepal and international operations; legally recognized documents for local ward offices; seamless dual calendar support.
  - **Trade-offs**: Requires bundling or implementing astronomical Bikram Sambat tables (1970–2100 BS) in an owned infrastructure adapter.

---

## ADR-020: 4-Phase Implementation Sequencing, MVP Boundary Definition, and 25 Single Deployable Units

- **Date**: 2026-09-14
- **Status**: Accepted
- **Context**: 
  Translating the 19 comprehensive business requirement modules into actionable, risk-mitigated development units required establishing a clear MVP boundary and end-to-end prioritization. Key architectural constraints:
  1. *Single Deployable Unit Requirement*: Every roadmap issue must represent a full-stack vertical slice delivering tangible business value on its own (never a decoupled technical horizontal layer like \"create DB schema\").
  2. *MVP Operational Anchor*: Identifying the core monetization loop for independent landlords without premature complexity from advanced commercial or multi-tiered utility models.
  3. *Sequential Dependency Graph*: Aligning dependencies so that each phase builds upon immutable, tested preceding aggregates.

- **Decision**:
  1. **MVP Scope (Phase 1: Issues #1 to #9)**:
     - Anchor Day-1 MVP strictly on the residential landlord operational loop: Property/Space Catalog (#1), Renter Directory (#2), Core Leases & Proration (#3), Multi-Currency & BS/AD Dual Calendar (#4), Direct Sub-Metering & Flat Utility Fee (#5), Security Deposit Escrow (#6), Monthly Invoicing & Late Fees (#7), Offline Payment Recording & Immutable Receipts (#8), and Landlord Operational Hub (#9).
  2. **Phase 2: Operations & Resident Portal (Issues #10 to #15)**:
     - Resident Self-Service Portal (#10), Renter Meter Photo Uploads & Verification (#11), Co-Living & Roommate Split Billing (#12), Maintenance Work Orders & Tenant Chargebacks (#13), Nepali Devanagari UI & Bilingual Documents (#14), and Delinquency Notices & Legal Holds (#15).
  3. **Phase 3: Inventory, Inspections & Disbursements (Issues #16 to #20)**:
     - Ancillary Physical Inventory (#16), Concessions & Early-Bird Incentives (#17), Condition Inspections & Useful-Life Depreciation (#18), Two-Stage Move-Out Utility Settlement (#19), and Property Owner Disbursements (#20).
  4. **Phase 4: Enterprise, Commercial & Online Payments (Issues #21 to #25)**:
     - Commercial Real Estate & RUBS (#21), Tax & VAT Engine (#22), Advanced Multi-Utility Tariffs (#23), Guarantors & Corporate Leases (#24), and Online Payment Gateways (#25).
  5. **Repository Synchronization**:
     - Created and pushed all 25 issues sequentially to GitHub repository \`prosubodh/sthanori\` (Issues #1 through #25) with \`phase:*\` and \`scope:deployable-unit\` labels.
     - Documented the canonical execution specification in [\`docs/PRIORITIZED_ISSUES_BACKLOG.md\`](file:///home/prosubodh/projects/sthanori/docs/PRIORITIZED_ISSUES_BACKLOG.md).

- **Rationale & Alternatives**:
  - *Slicing Strategy*: Vertical slices guarantee early user feedback, continuous deployment, and verifiable business value at every step.
  - *Strict YAGNI*: Keeps initial infrastructure lean while guaranteeing clean extension points for subsequent phases.

- **Consequences**:
  - **Positive**: Clear, immutable roadmap; zero ambiguity on Day-1 MVP vs post-MVP priorities; issues live in GitHub for tracking and sprint assignment.
  - **Trade-offs**: Requires disciplined execution of Phase 1 before branching into Phase 2 capabilities.












