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
