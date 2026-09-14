#!/usr/bin/env bash
set -euo pipefail

# Ensure gh is authenticated
if ! gh auth status >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) is not authenticated."
  echo "Please authenticate using: gh auth login"
  echo "Or provide GH_TOKEN in your environment."
  exit 1
fi

REPO="prosubodh/sthanori"
echo "Creating 25 prioritized issues in $REPO..."

create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"

  echo "==> Creating: $title"
  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    --label "$labels"
}

# Ensure labels exist
LABELS=(
  "phase:mvp,0e8a16,Day-1 MVP Core"
  "phase:2-operations,1d76db,Phase 2 Operations & Resident Portal"
  "phase:3-expansion,5319e7,Phase 3 Inventory & Inspections"
  "phase:4-enterprise,b60205,Phase 4 Enterprise & Commercial"
  "scope:deployable-unit,0052cc,Single Deployable Unit"
)

for label_spec in "${LABELS[@]}"; do
  IFS="," read -r name color desc <<< "$label_spec"
  gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" --force 2>/dev/null || true
done

# Phase 1: MVP Core
create_issue \
  "[P1-MVP-01] Property & Rentable Space Catalog (Residential Units)" \
  "### Business Value & Tangible Outcome
Enables landlords to configure residential properties and rentable spaces (apartments, studios, single-family units) with base rent, square footage, occupancy limits, and operational status (\`VACANT\`, \`OCCUPIED\`, \`MAINTENANCE\`, \`RESERVED\`). Provides real-time asset inventory tracking.

### Single Deployable Unit Scope
- Domain Entities: \`PropertyAggregate\`, \`RentableSpaceAggregate\`.
- NestJS API: CRUD endpoints for Properties and Rentable Spaces with tenant RLS isolation.
- Web UI: Property and Space management views with real-time vacancy status indicators.
- Sibling Unit Tests & API Acceptance Tests verifying tenant isolation and space invariants.

### Functional Invariants
- \`FR-1.1\`: Properties classified as \`RESIDENTIAL_MULTIFAMILY\` or \`SINGLE_FAMILY\`.
- \`FR-1.2\`: Spaces encompass optional \`buildingBlock\` designation (e.g. \"Building A\").
- \`FR-1.3\`: Spaces store square footage, floor level, max occupants, base rent, and status.
- Spaces cannot be set to \`VACANT\` while an active lease is in effect.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 1 (FR-1.1 - FR-1.3)
- ADR: \`memory.md\` ADR-004, ADR-006, ADR-011, ADR-012" \
  "phase:mvp,scope:deployable-unit"

create_issue \
  "[P1-MVP-02] Renter & Resident Profile Directory" \
  "### Business Value & Tangible Outcome
Centralized directory of residents with validated contact info and emergency details, establishing the counterparty profile required for leasing while preserving cross-lease payment credibility.

### Single Deployable Unit Scope
- Domain Entity: \`RenterProfileAggregate\`.
- NestJS API: Endpoints to create, update, search, and view renter profiles scoped to \`tenantId\`.
- Web UI: Renter Directory list with search, contact details, emergency contacts, and credit balance overview.
- Validation: Strict unique email per workspace (\`tenantId\`) and Zod schema validations.

### Functional Invariants
- \`FR-2.1\`: Classified as \`RESIDENTIAL_RESIDENT\`.
- \`FR-2.2\`: Stores contact info (email, phone), identification, emergency contacts.
- \`FR-2.3\`: Email strictly unique per \`tenantId\`, allowing linking to multiple leases over time.
- Encapsulates \`CreditBalance\` and \`IsLegalHoldActive\` flags.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 2 (FR-2.1 - FR-2.3)
- ADR: \`memory.md\` ADR-004, ADR-012, ADR-018" \
  "phase:mvp,scope:deployable-unit"

create_issue \
  "[P1-MVP-03] Core Residential Lease Agreement & Rent Proration Engine" \
  "### Business Value & Tangible Outcome
Legally binding lease agreement lifecycle (\`DRAFT\` -> \`ACTIVE\` -> \`TERMINATED\`), calculating exact mid-month proration (actual calendar days vs standard 30-day) and day-20 rule, guaranteeing zero revenue loss at move-in.

### Single Deployable Unit Scope
- Domain Model: \`LeaseAgreementAggregate\` state machine.
- Strategy: \`IProrationStrategy\` (\`ActualCalendarDays\` and \`Standard30Day\`) + \`ProrationCollectionRule\`.
- NestJS API: Lease drafting, date validation, proration calculation preview, and activation endpoints.
- Web UI: Interactive Lease Creation Wizard with instant proration preview and active lease overview.
- Automated status synchronization: Activating a lease transitions the associated \`RentableSpace\` to \`OCCUPIED\`.

### Functional Invariants
- \`FR-3.1\`: Enforces state transitions (\`DRAFT\` -> \`ACTIVE\` -> \`TERMINATED\`).
- \`FR-3.2\`: Space cannot be leased if status is \`OCCUPIED\` during requested dates.
- \`FR-3.4\`: Mid-month proration calculation strategies.
- \`FR-3.5\`: Day 20 move-in collection rule (1st month full vs prorated initial).

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 3 (FR-3.1, FR-3.2, FR-3.4, FR-3.5)
- ADR: \`memory.md\` ADR-007, ADR-012, ADR-018" \
  "phase:mvp,scope:deployable-unit"

create_issue \
  "[P1-MVP-04] Multi-Currency (USD/NPR) & Bikram Sambat (BS/AD) Dual Calendar Core" \
  "### Business Value & Tangible Outcome
Delivers complete mathematical financial precision in minor units (cents/paisa integers) with Western and Vedic formatting, plus anchoring recurring rental billing cycles to the 1st of Bikram Sambat months (essential for Nepal property leasing).

### Single Deployable Unit Scope
- Domain Port: \`ICalendarAdapter\` for deterministic Gregorian (AD) <-> Bikram Sambat (BS) conversion.
- Value Objects: Multi-currency Money value object storing positive integers in minor units (ISO-4217 USD & NPR).
- Formatting Engine: Western comma formatting (\`100,000.00\`) and South Asian / Vedic formatting (\`1,00,000.00\` lakhs/crores).
- Application: Lease billing cycle anchoring to \`GREGORIAN_FIRST_OF_MONTH\` or \`BIKRAM_SAMBAT_FIRST_OF_MONTH\`.

### Functional Invariants
- \`FR-12.6\`: Multi-currency stored strictly as minor-unit positive integers (no floating-point math).
- \`FR-19.1 - FR-19.3\`: Dual calendar support; database UTC ISO-8601 storage with BS conversion.
- \`FR-19.5\`: Localized number and currency formatting for USD and NPR.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 12 (FR-12.6), Module 19 (FR-19.1 - FR-19.3, FR-19.5)
- ADR: \`memory.md\` ADR-018, ADR-019" \
  "phase:mvp,scope:deployable-unit"

create_issue \
  "[P1-MVP-05] Direct Utility Sub-Metering & Flat Fee Ledger" \
  "### Business Value & Tangible Outcome
Landlords can input utility sub-meter readings (electricity/water) and configure flat recurring utility fees, preventing decreasing-reading errors and automatically calculating monthly consumption charges.

### Single Deployable Unit Scope
- Domain Model: \`UtilityMeterAggregate\` and direct calculation strategy (\`Current - Previous * Rate\`).
- Policy: \`IMeterValidationPolicy\` verifying non-decreasing readings.
- NestJS API: Meter registration for spaces and reading entry endpoint.
- Web UI: Direct meter reading input table with automatic consumption preview and validation alerts.

### Functional Invariants
- \`FR-4.1 (#1, #5)\`: Direct sub-meter calculation and flat monthly recurring utility fee.
- \`FR-4.3\`: Decreasing reading rejection unless explicit meter reset is documented.
- Line items generated feed directly into monthly invoice preparation.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 4 (FR-4.1, FR-4.3)
- ADR: \`memory.md\` ADR-012, ADR-014, ADR-018" \
  "phase:mvp,scope:deployable-unit"

create_issue \
  "[P1-MVP-06] Security Deposit Escrow Ledger & Move-In Collection" \
  "### Business Value & Tangible Outcome
Fiduciary tracking of required and collected tenant security deposits in segregated escrow ledgers, and generating baseline move-out deposit deduction and refund reconciliation statements.

### Single Deployable Unit Scope
- Domain Model: \`SecurityDepositEscrowLedger\` linked to \`LeaseAgreementAggregate\`.
- NestJS API: Record deposit payment, view escrow ledger balance, and execute move-out settlement statement.
- Web UI: Deposit management tab on lease details with move-out deduction calculator and refund statement generator.

### Functional Invariants
- \`FR-15.1\`: Track required deposit vs paid deposit in escrow ledger.
- \`FR-15.2\`: Default \`NoDepositInterestPolicy\` (clean non-interest baseline for Day-1 MVP).
- \`FR-15.3\`: Move-out settlement workflow deducting unpaid rent, utilities, and repairs to calculate net refund or balance due.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 15 (FR-15.1 - FR-15.3)
- ADR: \`memory.md\` ADR-012, ADR-018" \
  "phase:mvp,scope:deployable-unit"

create_issue \
  "[P1-MVP-07] Recurring Monthly Rental Invoicing & Late Fee Engine" \
  "### Business Value & Tangible Outcome
Automated generation of itemized monthly rental invoices combining base rent, sub-metered/flat utilities, and fixed recurring add-ons (pet rent, parking), with automated late fee calculation post-grace period.

### Single Deployable Unit Scope
- Domain Model: \`RentalInvoiceAggregate\` with immutable line items.
- Services: Recurring monthly invoice generation job, \`ILateFeeStrategy\` evaluator (grace period clock + flat/percentage late fee).
- NestJS API: Invoices query, manual cycle trigger, and invoice PDF/JSON view endpoints.
- Web UI: Invoices ledger table with status chips (\`DRAFT\`, \`ISSUED\`, \`PAID\`, \`OVERDUE\`), itemized breakdown drawer, and printable invoice template.

### Functional Invariants
- \`FR-7.1, FR-7.2\`: Attached lease add-ons (pet rent, parking) generate recurring invoice lines.
- \`FR-11.1\`: Automated recurring monthly invoice generation.
- \`FR-11.3\`: Unified monthly invoice layout.
- \`FR-11.4\`: Late fee assessment post-due date + grace period.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 7 (FR-7.1, FR-7.2), Module 11 (FR-11.1, FR-11.3, FR-11.4)
- ADR: \`memory.md\` ADR-012, ADR-014, ADR-018" \
  "phase:mvp,scope:deployable-unit"

create_issue \
  "[P1-MVP-08] Offline Payment Recording & Immutable Receipt Issuance" \
  "### Business Value & Tangible Outcome
Records all incoming payments (Cash, Check, Bank Wire, Mobile Wallet/eSewa/Khalti reference numbers), executes FIFO allocation across unpaid items, updates invoice balances, and issues tamper-proof receipts.

### Single Deployable Unit Scope
- Domain Model: \`PaymentReceipt\` aggregate, \`IPaymentAllocationStrategy\` (FIFO Waterfall).
- Credit Management: Automatic drawdown of overpayments stored in \`RenterProfile.CreditBalance\`.
- NestJS API: Payment recording endpoint with transaction reference, receipt query.
- Web UI: \"Record Payment\" modal with real-time balance preview and printable/downloadable payment receipt view.

### Functional Invariants
- \`FR-12.1\`: Support recording Cash, Check, Wire Transfer, and Mobile Wallet references.
- \`FR-12.2\`: FIFO allocation waterfall clearing oldest invoice lines first (Rent -> Utilities -> Add-ons -> Late Fees).
- \`FR-12.3\`: Immutable \`PaymentReceipt\` generation.
- \`FR-12.5\`: Unapplied credit balance drawdown against oldest open balances.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 12 (FR-12.1 - FR-12.3, FR-12.5)
- ADR: \`memory.md\` ADR-012, ADR-018" \
  "phase:mvp,scope:deployable-unit"

create_issue \
  "[P1-MVP-09] Landlord Operational Hub & Financial Summary Exports" \
  "### Business Value & Tangible Outcome
Single-pane-of-glass dashboard displaying real-time portfolio occupancy, outstanding overdue receivables, recent payment receipts, and one-click PDF/CSV statement exports.

### Single Deployable Unit Scope
- Presentation / Frontend: Landlord Executive Dashboard view in \`apps/web\`.
- Backend Aggregations: Optimized summary endpoints (total units, occupancy %, active leases, unpaid invoices count, total overdue receivables in operating currency).
- Financial Exporting: CSV and printable summary export of monthly rent rolls and aged accounts receivables.
- Verification: End-to-end acceptance test covering the complete Day-1 MVP user journey.

### Functional Invariants
- Enforces multi-tenant RLS scoping on all dashboard aggregations.
- Sub-second dashboard loading (<200ms p95).
- Completes the Day-1 MVP milestone for Sthanori.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Section 2, Section 4 (NFR-1, NFR-3, NFR-4)
- ADR: \`memory.md\` ADR-010, ADR-011, ADR-018" \
  "phase:mvp,scope:deployable-unit"

# Phase 2: Operations & Resident Experience
create_issue \
  "[P2-OPS-10] Self-Service Resident Web Portal" \
  "### Business Value & Tangible Outcome
Residents can securely log into their private dashboard to view lease terms, download itemized monthly invoices, inspect utility breakdowns, and access historical payment receipts.

### Single Deployable Unit Scope
- Authentication: Resident invitation activation flow binding global \`UserId\` to workspace \`RenterProfileId\`.
- Authorization: Renter role guard ensuring residents can only read their own leases, invoices, and receipts.
- Web UI: Dedicated Resident Portal layout with tabs for Active Lease, Invoices & Payments, and Profile.

### Functional Invariants
- \`FR-2.4\`: Onboarding hybrid flow with secure invitation tokens.
- Cross-tenant and cross-renter access strictly blocked at the application boundary.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 2 (FR-2.4)
- ADR: \`memory.md\` ADR-005, ADR-012, ADR-018" \
  "phase:2-operations,scope:deployable-unit"

create_issue \
  "[P2-OPS-11] Renter Utility Meter Photo Submission & Verification Dashboard" \
  "### Business Value & Tangible Outcome
Renters can upload sub-meter dial photos directly via mobile/web UI, and landlords review and verify readings with an automated rolling 90-day fallback estimation for missing submissions.

### Single Deployable Unit Scope
- Domain Model: \`MeterReadingSubmissionAggregate\`.
- File Storage: Photo proof upload via owned \`IObjectStoragePort\`.
- Application Policies: \`SpikeDetectionPolicy\` (>200% rolling average alert) and \`HistoricalAverageEstimatePolicy\` for missing submissions.
- UI: Renter mobile photo submission form + Landlord verification queue dashboard.

### Functional Invariants
- \`FR-5.1\`: Mandatory photo evidence for renter submissions.
- \`FR-5.2, FR-5.3\`: Landlord verification workflow (\`SUBMITTED\` -> \`VERIFIED\` / \`FLAGGED_SPIKE\` -> \`INVOICED\`).
- \`FR-5.5\`: Rolling 90-day daily consumption estimate on missed deadlines with automated next-cycle true-up.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 5 (FR-5.1 - FR-5.5), Module 4 (FR-4.3)
- ADR: \`memory.md\` ADR-014, ADR-018" \
  "phase:2-operations,scope:deployable-unit"

create_issue \
  "[P2-OPS-12] Co-Living Shared Housing & Roommate Split Invoicing" \
  "### Business Value & Tangible Outcome
Enables co-living operators to lease private bedrooms within parent apartments, enforcing mutual space exclusion, and generating individual split invoices per roommate with targeted defaulter policies.

### Single Deployable Unit Scope
- Domain Hierarchy: Parent-child \`RentableSpace\` nesting with mutual lease exclusion invariant.
- Billing Strategy: \`IRoommateBillingStrategy\` (\`JointSeveralSplitInvoiceStrategy\`, \`SingleMasterInvoiceStrategy\`, \`IndividualRoomLeaseStrategy\`).
- Policy: \`IRoommateDefaultPolicy\` (\`TargetedDefaulterPolicy\` assessing late fees to delinquent roommate with co-tenant advisory).
- UI: Space hierarchy tree viewer and Roommate split percentage configuration.

### Functional Invariants
- \`FR-1.4, FR-1.5\`: Activating a lease on parent blocks child spaces and vice-versa.
- \`FR-11.2\`: Individualized sub-invoices based on configured split percentages summing to 100%.
- \`FR-11.5\`: Targeted late fees and collection notices.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 1 (FR-1.4, FR-1.5), Module 11 (FR-11.2, FR-11.5)
- ADR: \`memory.md\` ADR-013, ADR-018" \
  "phase:2-operations,scope:deployable-unit"

create_issue \
  "[P2-OPS-13] Maintenance Work Orders & Evidence-Gated Tenant Chargebacks" \
  "### Business Value & Tangible Outcome
End-to-end maintenance ticketing with status tracking (\`SUBMITTED\` -> \`DISPATCHED\` -> \`COMPLETED\`), contractor invoice attachment, and 5-day evidence-gated tenant damage chargebacks.

### Single Deployable Unit Scope
- Domain Model: \`MaintenanceWorkOrderAggregate\` with cost attribution (\`LANDLORD_EXPENSE\` vs \`TENANT_CHARGEBACK\`).
- Workflow: Evidence-gated tenant chargebacks requiring contractor invoices, parts/labor receipts, and technician diagnosis notes.
- Review Window: 5-business-day resident dispute review window before charge commits to rental invoice.
- UI: Maintenance ticket submission form (for residents & staff) + Manager dispatch & chargeback modal.

### Functional Invariants
- \`FR-13.1\`: Ticket lifecycle (\`SUBMITTED\` -> \`DISPATCHED\` -> \`IN_PROGRESS\` -> \`COMPLETED\` -> \`CLOSED\`).
- \`FR-13.2, FR-13.3\`: Converting to \`TENANT_CHARGEBACK\` strictly requires attachments and enforces 5-day review period.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 13 (FR-13.1 - FR-13.3)
- ADR: \`memory.md\` ADR-013, ADR-018" \
  "phase:2-operations,scope:deployable-unit"

create_issue \
  "[P2-OPS-14] Full Nepali Devanagari UI & Bilingual Dual-Column Financial Documents" \
  "### Business Value & Tangible Outcome
Full Nepali Devanagari UI language toggle and side-by-side bilingual (English & Nepali) invoices and receipts to satisfy local municipal ward registration and tax compliance in Nepal.

### Single Deployable Unit Scope
- Frontend i18n: Language switch (\`en\` / \`ne\`) with persistent preference and Devanagari script translations.
- Financial Documents: Bilingual dual-column invoice and receipt layout rendering English and Nepali side-by-side.
- Number Formatting: Vedic grouping with optional Devanagari numerals (\`०, १, २, ३...\`).

### Functional Invariants
- \`FR-19.1\`: English and Nepali localization across UI, notifications, and error envelopes.
- \`FR-19.4\`: Bilingual Dual-Column layout satisfying municipal ward standards.
- \`FR-19.5\`: Devanagari numerals and Vedic comma grouping.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 19 (FR-19.1, FR-19.4, FR-19.5)
- ADR: \`memory.md\` ADR-019" \
  "phase:2-operations,scope:deployable-unit"

create_issue \
  "[P2-OPS-15] Delinquency Arrears Notices, Legal Holds & Repayment Plans" \
  "### Business Value & Tangible Outcome
Automated rent reminder notifications, statutory \"Notice to Pay or Quit\" generation, partial payment legal holds to protect eviction filings, and structured installment debt repayment plans.

### Single Deployable Unit Scope
- Automated Reminders: Cron task dispatching payment reminders (3 days prior, due date, grace period expiry).
- Statutory Notices: \"Notice to Pay or Quit\" generation with itemized arrears and statutory cure deadlines.
- Enforcement Guard: \`IsLegalHoldActive\` flag blocking partial payments during active legal notices.
- Repayment Plans: \`RepaymentPlanAggregate\` scheduling monthly arrears installments alongside ongoing rent.

### Functional Invariants
- \`FR-9.1, FR-9.2\`: Automated reminder schedules and formal statutory notices.
- \`FR-9.3, FR-9.5\`: Repayment plan tracking; default trigger upon missed installment.
- \`FR-9.4\`: Legal hold strictly rejects partial payments.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 9 (FR-9.1 - FR-9.5)
- ADR: \`memory.md\` ADR-014, ADR-018" \
  "phase:2-operations,scope:deployable-unit"

# Phase 3: Expansion & Physical Asset Inventory
create_issue \
  "[P3-EXP-16] Ancillary Inventory Asset Management (Parking & Storage)" \
  "### Business Value & Tangible Outcome
Manages finite physical assets (assigned parking spots, storage lockers) with anti-double-booking invariant enforcement, inventory status, and mid-cycle proration policies.

### Single Deployable Unit Scope
- Domain Model: \`AncillaryInventoryAssetAggregate\` tracking spot identifiers (e.g. \"P-14\", \"Locker 3B\").
- Policies: \`IAncillaryProrationPolicy\` (\`ProratedDaysPolicy\` vs \`FullMonthFeePolicy\`).
- Invariant: Prevents assigning an already occupied or maintenance asset to another active lease.
- UI: Physical asset catalog and allocation drawer on lease creation.

### Functional Invariants
- \`FR-7.4\`: Finite physical add-on inventory tracking and anti-double-booking enforcement.
- \`FR-7.5\`: Mid-cycle proration calculation for ancillary services.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 7 (FR-7.4, FR-7.5)
- ADR: \`memory.md\` ADR-014, ADR-018" \
  "phase:3-expansion,scope:deployable-unit"

create_issue \
  "[P3-EXP-17] Concession Schedules & Early-Bird Payment Incentives" \
  "### Business Value & Tangible Outcome
Supports upfront free months, amortized net effective rent discounts with early-termination clawback recovery, and automatic early-bird payment discount validation.

### Single Deployable Unit Scope
- Domain Model: \`ConcessionSchedule\` on leases.
- Clawback Policies: \`IConcessionClawbackPolicy\` (\`ProRataClawbackPolicy\` and \`FullClawbackPolicy\`).
- Early-Bird Incentives: Invoicing displays conditional discount with payment timestamp verification against deadline.
- UI: Concession setup on lease wizard and invoice net-effective rent display.

### Functional Invariants
- \`FR-8.1, FR-8.2\`: Upfront concessions and monthly amortized concessions displaying Gross vs Net rent.
- \`FR-8.3\`: Clawback calculation upon unauthorized early lease termination.
- \`FR-8.4\`: Early-bird discount validation based on payment timestamp.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 8 (FR-8.1 - FR-8.4)
- ADR: \`memory.md\` ADR-014, ADR-018" \
  "phase:3-expansion,scope:deployable-unit"

create_issue \
  "[P3-EXP-18] Move-In/Move-Out Inspections & Useful-Life Asset Depreciation Engine" \
  "### Business Value & Tangible Outcome
Room-by-room digital condition walkthrough checklists with timestamped photos, 7-day acceptance auto-lock, and IRS/HUD straight-line useful life depreciation capping tenant repair damage deductions.

### Single Deployable Unit Scope
- Domain Model: \`ConditionInspectionAggregate\`, \`AssetDepreciationSchedule\` catalog.
- Workflow: Baseline comparison diffing Move-Out condition against Move-In condition.
- Calculation: Straight-line monthly depreciation capping maximum allowable tenant damage charges.
- UI: Digital walkthrough checklist with photo upload and e-signatures.

### Functional Invariants
- \`FR-17.1, FR-17.2\`: Digital walkthroughs capturing condition ratings, cleanliness, and timestamped photos.
- \`FR-17.4\`: IRS/HUD straight-line useful life depreciation calculation.
- \`FR-17.5\`: Depreciated deductions feed directly into move-out deposit statements.
- \`FR-17.7\`: Automated 7-day resident discovery window auto-locking Move-In baselines.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 17 (FR-17.1 - FR-17.7)
- ADR: \`memory.md\` ADR-016, ADR-018" \
  "phase:3-expansion,scope:deployable-unit"

create_issue \
  "[P3-EXP-19] Two-Stage Move-Out Utility Escrow Settlement & Sunset Expiry" \
  "### Business Value & Tangible Outcome
Legally compliant two-stage deposit settlement releasing initial refunds within statutory deadlines (14-21 days) while holding utility escrow, followed by automated true-up upon municipal bill arrival with sunset refund protection.

### Single Deployable Unit Scope
- Domain Strategy: \`TemporaryEscrowHoldbackStrategy\` implementing two-stage settlement.
- Stage 1: \`InterimMoveOutStatement\` disbursing known deposit refunds within statutory windows.
- Stage 2: \`FinalMoveOutStatement\` reconciling true-up when final municipal bill arrives.
- Sunset Policy: \`HoldbackSunsetExpiryPolicy\` automatically forfeiting holdback to renter if bill is not entered before deadline.

### Functional Invariants
- \`FR-6.1 (#3)\`: Temporary escrow holdback strategy.
- \`FR-6.2\`: Two-stage settlement lifecycle with configurable sunset expiry (default: 60 days).

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 6 (FR-6.1, FR-6.2)
- ADR: \`memory.md\` ADR-014, ADR-018" \
  "phase:3-expansion,scope:deployable-unit"

create_issue \
  "[P3-EXP-20] Third-Party Property Owner Management & Monthly Disbursements" \
  "### Business Value & Tangible Outcome
Enables property management agencies to manage investor-owned properties, enforce authorized maintenance spending limits, calculate management fee commissions, and generate monthly net disbursement statements.

### Single Deployable Unit Scope
- Domain Model: \`PropertyOwnerAggregate\` with banking details, operating currency, and management fee rules.
- Policy: \`AuthorizedMaintenanceLimit\` gating non-emergency work orders above threshold.
- Disbursement Engine: Monthly statement calculating \`Gross Rent - Management Fees - Maintenance Expenses\`.
- UI: Investor Owner portal view and monthly disbursement statement generation.

### Functional Invariants
- \`FR-14.1\`: Configured management fee percentage or flat fee.
- \`FR-14.2\`: Monthly owner disbursement statement generation.
- \`FR-14.3\`: Automated \`PENDING_OWNER_APPROVAL\` gate for repairs exceeding authorized limit.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 14 (FR-14.1 - FR-14.3)
- ADR: \`memory.md\` ADR-013, ADR-018" \
  "phase:3-expansion,scope:deployable-unit"

# Phase 4: Commercial Real Estate, Advanced Tariffs & Enterprise Billing
create_issue \
  "[P4-ENT-21] Commercial Real Estate, RUBS Allocation & CAM Surcharges" \
  "### Business Value & Tangible Outcome
Supports commercial suites, multi-party RUBS utility formulas (by square footage and occupancy count), landlord absorption of vacant shares, and itemized CAM expense surcharges.

### Single Deployable Unit Scope
- Commercial Space Support: \`COMMERCIAL_SUITE\` space types with commercial client metadata.
- Utility Strategies: RUBS by SqFt, RUBS by Occupancy, and CAM calculation strategies.
- Vacancy Allocation: \`IRubsVacancyAllocationPolicy\` defaulting to statutory \`LandlordAbsorbsVacantSharePolicy\`.
- UI: Master bill entry and RUBS apportionment calculation review.

### Functional Invariants
- \`FR-1.1\`: \`COMMERCIAL\` and \`MIXED_USE\` property classifications.
- \`FR-4.1 (#2, #3, #4)\`: Equal split, RUBS SqFt, and RUBS Occupancy formulas.
- \`FR-4.2\`: CAM landlord absorption, deduction percentage, and itemized surcharges.
- \`FR-4.4\`: Active renters never surcharged for vacant spaces under statutory default.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 1 (FR-1.1), Module 4 (FR-4.1, FR-4.2, FR-4.4)
- ADR: \`memory.md\` ADR-012, ADR-013, ADR-018" \
  "phase:4-enterprise,scope:deployable-unit"

create_issue \
  "[P4-ENT-22] Tax, VAT & Municipal Levies Engine" \
  "### Business Value & Tangible Outcome
Line-item taxability evaluation (exempt residential vs taxable commercial/ancillary), tax-exclusive and tax-inclusive modes, and minor-currency banker's rounding to eliminate penny drift.

### Single Deployable Unit Scope
- Domain Strategy: \`ITaxCalculationStrategy\` evaluating taxability per line item.
- Modes: \`TAX_EXCLUSIVE\` and \`TAX_INCLUSIVE\` tax modes.
- Rounding Engine: Banker's Rounding (Half-Even) in minor currency units guaranteeing zero penny drift.
- UI: Workspace/Property tax configuration and invoice tax summary display.

### Functional Invariants
- \`FR-10.1\`: Line-item tax evaluation (exempt residential, taxable commercial, municipal surcharges).
- \`FR-10.2\`: Per-property or per-workspace tax mode configuration.
- \`FR-10.3\`: Exact line-item Banker's Rounding in cents/paisa.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 10 (FR-10.1 - FR-10.3)
- ADR: \`memory.md\` ADR-014, ADR-018" \
  "phase:4-enterprise,scope:deployable-unit"

create_issue \
  "[P4-ENT-23] Advanced Multi-Utility Tariffs, Sewer Baselining & EV Charging" \
  "### Business Value & Tangible Outcome
Multi-tier inclining block tariffs, two-part fixed/volumetric tariffs, time-of-use rate schedules, winter quarter average (WQA) sewer baselining, EV charging multi-factor rates, and cascading meter line-loss audits (>5%).

### Single Deployable Unit Scope
- Domain Aggregate: \`UtilityTariffAggregate\` modeling tiers, TOU windows, and seasonal rates.
- Sewer Strategies: \`ISewerCalculationStrategy\` including Winter Quarter Average (WQA).
- EV Charging: Multi-factor pricing (energy + session fee + idle dwell penalty).
- Cascading Hierarchy: Master -> Sub-meter trees with automated line-loss variance detection (>5%).

### Functional Invariants
- \`FR-16.1\`: Inclining block, two-part, and time-of-use tariff evaluations.
- \`FR-16.2\`: WQA sewer baselining protecting irrigation usage.
- \`FR-16.3\`: EV charging dwell penalty enforcement.
- \`FR-16.4\`: Cascading meter tree line-loss auditing (>5% trigger).

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 16 (FR-16.1 - FR-16.6)
- ADR: \`memory.md\` ADR-015, ADR-018" \
  "phase:4-enterprise,scope:deployable-unit"

create_issue \
  "[P4-ENT-24] Lease Guarantors, Corporate Master Leases & Surety Bond Programs" \
  "### Business Value & Tangible Outcome
Supports third-party financial guarantors (with legal demand notices), corporate master leases with rotating employee rosters and capacity bounds, and deposit alternatives (surety bonds & monthly waiver pools).

### Single Deployable Unit Scope
- Guarantors: \`LeaseGuarantorAggregate\` with liability caps and default demand notices.
- Corporate Leases: Corporate obligor entity with rotating authorized occupants and capacity limits.
- Deposit Alternatives: \`IDepositGuaranteeStrategy\` (\`ThirdPartySuretyBondStrategy\` and \`InHouseWaiverPoolStrategy\`).
- UI: Guarantor agreement form and corporate occupant roster manager.

### Functional Invariants
- \`FR-18.1, FR-18.2\`: Guarantor modeling with zero tenancy/possessory rights.
- \`FR-18.4, FR-18.6\`: Corporate leases with rotating occupants bounded by space max occupancy.
- \`FR-18.5\`: Surety bond and in-house waiver pool deposit alternatives.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 18 (FR-18.1 - FR-18.6)
- ADR: \`memory.md\` ADR-017, ADR-018" \
  "phase:4-enterprise,scope:deployable-unit"

create_issue \
  "[P4-ENT-25] Online Payment Gateways, Webhook Ingestion & Dishonored Payment Reversals" \
  "### Business Value & Tangible Outcome
Live card and bank transfer processing via payment gateways with HMAC-verified webhooks, automated receipt generation, and immutable NSF payment reversal handling with chargeback fees.

### Single Deployable Unit Scope
- Gateway Port: \`IBillingAdapter\` encapsulating payment providers.
- Webhooks: Timing-safe HMAC verification and idempotent event ledger.
- Reversal Workflow: Immutable \`PaymentReversalRecord\` re-opening invoice lines, adding NSF chargeback fee, and re-evaluating late fee clock.
- Resident UI: Online checkout sheet for paying rental invoices.

### Functional Invariants
- \`FR-12.4\`: Immutable payment reversal workflow for bounced checks/ACH returns.
- Standardized commercial error envelopes (402, 429).
- Full auditability across all transactions.

### References
- BRD: \`docs/BUSINESS_REQUIREMENTS.md\` Module 12 (FR-12.4)
- ADR: \`memory.md\` ADR-001, ADR-004, ADR-018" \
  "phase:4-enterprise,scope:deployable-unit"

echo "All 25 prioritized issues processed successfully!"
