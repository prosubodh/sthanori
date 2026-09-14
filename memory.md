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
