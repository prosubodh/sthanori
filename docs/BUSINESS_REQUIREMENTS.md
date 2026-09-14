# Comprehensive Business Requirements Document (`BUSINESS_REQUIREMENTS.md`)

## 1. Document Overview & System Objectives

**Product Name**: Sthanori Multi-Tenant Real Estate & Rental Billing Platform  
**Target Audience**: Independent Landlords, Property Management Companies, Co-living Operators, and Commercial Property Owners.  
**Core Mission**: Provide an automated, mathematically rigorous, and auditable platform for managing properties, rentable spaces, resident leases, utility metering, recurring rental invoicing, roommate split billing, maintenance chargebacks, owner disbursements, delinquency repayment plans, and move-out security deposit reconciliations.

---

## 2. User Roles & Permission Matrix

| Role | Scope | Permissions |
| :--- | :--- | :--- |
| **Landlord / Company Admin** | Tenant Workspace | Full administrative control: configure properties, leases, utility billing rules, pricing plans, staff access, tax rules, and financial ledgers. |
| **Property Manager** | Assigned Properties | Manage units, draft and activate leases, verify meter submissions, issue invoices, record payments, manage work orders, and issue legal notices. |
| **Property Owner (Investor)**| Owned Properties | Read-only portal access to property occupancy rates, maintenance expense reports, and monthly Owner Disbursement statements. |
| **Field Inspector / Technician** | Assigned Properties | Record utility sub-meter readings, log inspection notes, complete maintenance work orders, and upload damage photos. |
| **Renter (Resident / Occupant / Client)** | Self / Active Leases | Read-only access to own lease terms, upload meter readings with photo proof, download itemized invoices, view utility breakdowns, submit maintenance tickets, and download payment receipts. |

---

## 3. Functional Requirements (FR)

### Module 1: Property & Rentable Space Management
- **FR-1.1**: The system must support creating properties classified as `RESIDENTIAL_MULTIFAMILY`, `SINGLE_FAMILY`, `CO_LIVING`, `COMMERCIAL`, or `MIXED_USE`.
- **FR-1.2**: Each property must encompass one or more `RentableSpace` entities (Apartments, Rooms, Suites) with an optional `buildingBlock` designation (e.g. "Tower A", "Building 2") to support campuses without relational overhead.
- **FR-1.3**: Spaces must store square footage, floor level, max occupancy, base rent, and operational status (`VACANT`, `OCCUPIED`, `MAINTENANCE`, `RESERVED`).
- **FR-1.4**: In co-living or sub-divided commercial suites, the system must allow grouping child spaces under a parent unit via an optional `parentSpaceId` (e.g. "Bedroom 2" under "Apartment 4B") while preserving direct leasability.
- **FR-1.5**: The system must enforce a strict mutual-exclusion invariant between parent units and child spaces:
  - Activating a lease on a parent unit strictly requires that all child spaces are vacant with zero overlapping leases.
  - Activating a lease on any child space strictly blocks activating an overlapping lease on the parent unit.



### Module 2: Renter & Identity Directory
- **FR-2.1**: The system must maintain profiles for renting parties, classified by `RenterType` (`RESIDENTIAL_RESIDENT`, `CO_LIVING_OCCUPANT`, `COMMERCIAL_CLIENT`).
- **FR-2.2**: Profiles must store contact info (email, phone), identification/tax numbers (for commercial clients), and emergency contacts.
- **FR-2.3**: Email must be strictly unique per landlord workspace (`tenantId`), allowing renters to be linkable to multiple leases over time to maintain cumulative payment credibility and history.
- **FR-2.4**: The system must enforce an automated yet flexible portal onboarding hybrid:
  - By default, creating a `RenterProfile` automatically provisions a pending portal account and dispatches an activation invitation email (`sendInviteImmediately: true`).
  - Landlords can optionally suppress immediate dispatch (`sendInviteImmediately: false`) for bulk legacy imports or offline paper leases, preserving the ability to trigger portal invitations later on demand.
  - When the resident activates their invite, their global login credentials (`UserId`) bind to their workspace `RenterProfileId`.


### Module 3: Lease Lifecycle & Stepped Escalation
- **FR-3.1**: The system must enforce the state machine: `DRAFT` $\to$ `PENDING_APPROVAL` $\to$ `ACTIVE` $\to$ `UNDER_NOTICE` $\to$ `EXPIRED` / `MONTH_TO_MONTH` $\to$ `TERMINATED` $\to$ `CLOSED`.
- **FR-3.2**: A space cannot be leased if its status is `OCCUPIED` during the requested lease date range.
- **FR-3.3**: Leases must support `RentEscalationSchedule`: scheduling future rent changes on specific effective dates across multi-year contracts.
- **FR-3.4**: When a lease starts mid-month, the system must calculate prorated rent via `IProrationStrategy`:
  - `ActualCalendarDaysProrationStrategy` (Default): $\text{Daily Rate} = \text{Monthly Rent} / \text{Actual Days in Calendar Month}$.
  - `Standard30DayProrationStrategy`: $\text{Daily Rate} = \text{Monthly Rent} / 30$.
- **FR-3.5**: The system must enforce a configurable `ProrationCollectionRule`:
  - If move-in occurs on or before day $N$ of the month (default: 20th): bill the prorated fraction for the initial partial month.
  - If move-in occurs after day $N$: collect the full 1st month rent at signing and apply the prorated credit/adjustment to month 2 (mitigating move-in default risk).
- **FR-3.6**: The system must support an automated 60/90-day Renewal Proposal workflow allowing renters to accept, decline, or counter proposed lease revisions.


### Module 4: Utility Metering, CAM & Anomaly Verification
- **FR-4.1**: The system must support 5 distinct utility calculation strategies:
  1. **Direct Sub-Meter**: $(CurrentReading - PreviousReading) \times RatePerUnit$.
  2. **Equal Split**: Master bill divided equally among active renters in the property (ideal for Co-living).
  3. **RUBS by Square Footage**: $MasterBill \times (SpaceSqFt / TotalSqFt)$.
  4. **RUBS by Occupancy**: $MasterBill \times (SpaceOccupants / TotalOccupants)$.
  5. **Flat Monthly Fee**: Static recurring add-on.
- **FR-4.2**: The system must support Common Area Maintenance (CAM) / House Utility configurations:
  - Landlord Absorption (default).
  - Common Area Deduction Percentage (e.g. 10% deducted from Master Bill before RUBS split).
  - Itemized CAM surcharge on invoices.
- **FR-4.3**: The system must enforce `IMeterValidationPolicy`:
  - Flag any reading where $Reading_{curr} < Reading_{prev}$ unless an explicit `MeterResetEvent` is documented.
  - Automatically flag consumption exceeding 200% of rolling 3-reading average as `FLAGGED_SPIKE`, holding invoice dispatch until supervisor confirmation.
- **FR-4.4**: The system must support configurable RUBS vacancy handling via `IRubsVacancyAllocationPolicy`:
  - `LandlordAbsorbsVacantSharePolicy` (Default / Statutory Standard): Proportional utility share of any vacant/unleased space is absorbed by the property owner as an operating expense, guaranteeing active renters are never surcharged for empty units.
  - `ActiveOccupantsPoolTotalBillPolicy`: Distributes 100% of the bill exclusively across active occupied units (opt-in for co-living houses where lease contracts permit).


### Module 5: Renter Meter Photo Submission & Verification
- **FR-5.1**: Renters must be able to submit their own utility sub-meter readings via mobile/web UI with mandatory photo evidence of the meter display.
- **FR-5.2**: The system must provide a verification dashboard for landlords/property managers to review the photo and reading.
- **FR-5.3**: State transitions: `SUBMITTED` $\to$ `UNDER_REVIEW` $\to$ `VERIFIED` / `DISPUTED` $\to$ `INVOICED`.
- **FR-5.4**: If the landlord lives nearby or conducts physical inspections, the landlord/technician can enter verified readings directly.
- **FR-5.5**: The system must enforce `IMissingReadingPolicy` when submission deadlines expire:
  - `HistoricalAverageEstimatePolicy` (Default): Automatically generates an estimated reading tagged as `ESTIMATED` based on rolling 90-day daily consumption, unblocking invoicing, with automated variance reconciliation (true-up) on the subsequent cycle when an actual reading is verified.
  - `HoldInvoicingUntilInspectedPolicy`: Blocks generating the utility line item and creates an urgent technician inspection work order.


### Module 6: Move-Out Final Utility Settlement
- **FR-6.1**: The system must support three move-out utility settlement strategies via `IFinalUtilitySettlementStrategy`:
  1. **Final Physical Meter Reading**: Reading taken on move-out day multiplied by active tariff rate; billed immediately.
  2. **Historical Daily Average**: Daily average of prior 90 days multiplied by days occupied in the partial move-out month.
  3. **Temporary Escrow Holdback**: Retains a fixed holdback (e.g. $150) in deposit escrow until the municipal bill arrives, then settles true-up and refunds remainder.
- **FR-6.2**: When using `TemporaryEscrowHoldbackStrategy`, the system must enforce a legally compliant two-stage settlement lifecycle:
  - **Stage 1 (`InterimMoveOutStatement`)**: Disburses all known deposit refunds within statutory deadlines (14–21 days) while segregating the utility holdback in escrow.
  - **Stage 2 (`FinalMoveOutStatement`)**: Automatically calculates true-up when the municipal bill arrives, disbursing remaining funds or issuing a supplementary balance invoice for any shortfall.
  - **Configurable Sunset Expiry**: Governed by `HoldbackSunsetExpiryPolicy` with a configurable window (e.g. 30, 45, 60, or 90 days, default: 60 days); if the landlord fails to enter the utility bill before expiry, the remaining holdback is automatically forfeited and refunded in full to the resident.


### Module 7: Ancillary Recurring Services Ledger (Add-ons)
- **FR-7.1**: Leases must support attaching zero or more recurring ancillary add-ons:
  - Assigned Parking (Carport, Underground, EV Charging Station with metered rate)
  - Pet Rent (monthly per pet)
  - Storage Lockers / Units
  - Valet Trash & Pest Control
- **FR-7.2**: Recurring add-ons automatically generate itemized lines on the monthly invoice.
- **FR-7.3**: Support one-off incidental charges: Key fob replacement, lockout fees, NSF returned check fees.
- **FR-7.4**: Finite physical add-ons (Parking spaces, Storage units) must be modeled via `AncillaryInventoryAssetAggregate` to track unique spot identifiers (e.g. "P-14", "Locker 3B"), status (`VACANT`, `ASSIGNED`, `MAINTENANCE`), and prevent concurrent double-allocation across leases.
- **FR-7.5**: Mid-cycle addition or removal of add-ons must support configurable billing via `IAncillaryProrationPolicy`:
  - `ProratedDaysPolicy` (Default): Automatically calculates daily proration for the partial activation month using `IProrationStrategy`.
  - `FullMonthFeePolicy`: Charges the full calendar month fee regardless of the day added.


### Module 8: Concessions, Amortized Discounts & Early-Bird Incentives
- **FR-8.1**: The system must support **Upfront Concessions** (e.g. "1st month free") where the discount is fully applied to the initial invoice.
- **FR-8.2**: The system must support **Amortized Concessions** (e.g. $1,200 annual discount spread as $100/mo) displaying both Gross Contract Rent and Net Effective Rent on invoices.
- **FR-8.3**: Concessions must support early-termination recovery via `IConcessionClawbackPolicy`:
  - `ProRataClawbackPolicy` (Default): Calculates clawback proportional to the unserved lease period ($\text{ReceivedConcession} \times \frac{\text{UnservedDays}}{\text{TotalLeaseDays}}$).
  - `FullClawbackPolicy`: Re-bills 100% of granted concessions upon early breach or unauthorized lease abandonment.
- **FR-8.4**: The system must support **Early-Bird Payment Discounts** (e.g. $25 discount if rent is paid on or before the 28th):
  - Invoices display the conditional discount and expiration deadline.
  - Payment ingestion validates the payment timestamp: if paid within the incentive window, the discount is committed to balance the invoice in full; after the deadline, the discount is revoked and full gross rent is due.


### Module 9: Delinquency, Legal Notices & Installment Repayment Plans
- **FR-9.1**: The system must dispatch automated reminder schedules: 3 days before due, on due date, and day after grace period expiration.
- **FR-9.2**: The system must generate formal statutory legal notices: "Notice to Pay or Quit" with itemized arrears and statutory cure deadlines.
- **FR-9.3**: The system must track **Installment Repayment Plans** (`RepaymentPlanAggregate`) allowing delinquent renters to pay debt in monthly installments alongside active rent.
- **FR-9.4**: The system must enforce automated **Legal Hold Protection** (`IsLegalHoldActive`):
  - Formally serving a statutory Notice to Pay or Quit automatically engages `IsLegalHoldActive = true` on the lease/renter profile.
  - While active, payment gateways and online resident portals strictly reject any partial payment transaction; only 100.00% full settlement of demanded arrears is accepted, eliminating the legal risk of accidental notice waiver.
- **FR-9.5**: The system must enforce strict breach handling on `RepaymentPlanAggregate`: missing any scheduled installment past the grace period immediately transitions status to `DEFAULTED` and alerts property management to resume eviction filings.



### Module 10: Tax, VAT & Municipal Levies Engine
- **FR-10.1**: The system must support `ITaxCalculationStrategy` evaluating taxability on a line-item basis:
  - Long-term residential rent: Tax-exempt ($0\%$).
  - Commercial rent & CAM: Taxable at configured VAT/Sales Tax percentage.
  - Ancillary parking/storage: Taxable or exempt based on local municipal rules.
  - Utility user taxes: Surcharges applied to designated utility line items.
- **FR-10.2**: The system must support configurable `TaxCalculationMode` (`TAX_EXCLUSIVE` default vs. `TAX_INCLUSIVE`) configured per property or workspace.
- **FR-10.3**: The system must enforce canonical **Line-Item Rounding via Banker's Rounding (Half-Even)** in minor currency units: each line item permanently stores its exact `TaxAmount` in cents, guaranteeing $\text{Total Invoice Tax} \equiv \sum \text{LineItem.TaxAmount}$ with zero penny drift.


### Module 11: Rental Invoicing & Roommate Split Billing
- **FR-11.1**: The system must support automated generation of recurring monthly invoices X days prior to the billing due date.
- **FR-11.2**: The system must support 3 distinct roommate billing strategies via `IRoommateBillingStrategy`:
  1. **Joint & Several Split Invoicing**: Generates individualized invoices per roommate based on configured split percentages, while preserving joint legal liability on the master lease.
  2. **Single Master Invoice**: Consolidates the unit onto one invoice, allowing roommates to submit partial payments.
  3. **Individual Room Leases**: Direct independent invoices per private bedroom lease.
- **FR-11.3**: Invoices must support configurable layout:
  - **Unified Monthly Invoice**: Consolidating base rent, itemized utilities, and recurring fees.
  - **Separate Utility Invoice**: Dispatched independently when municipal utility bills arrive out-of-cycle.
- **FR-11.4**: When an invoice remains unpaid past the due date plus grace period, late fees must be assessed via the active `ILateFeeStrategy` (Flat, Percentage, Daily Accruing, or None).
- **FR-11.5**: The system must enforce configurable roommate default handling via `IRoommateDefaultPolicy`:
  - `TargetedDefaulterPolicy` (Default): When one roommate defaults under split invoicing, late fees assess strictly against the delinquent roommate's sub-invoice; urgent collection notices target the defaulter, while an informational courtesy notice is sent to paying co-tenants regarding joint household liability.
  - `SharedHouseholdSurchargePolicy`: Late fee is split evenly or assessed against the master unit balance.


### Module 12: Payment Recording & Allocation Waterfall
- **FR-12.1**: The system must support recording offline payments (Cash, Check, Wire Transfer, Money Order) with reference numbers and payment dates.
- **FR-12.2**: When partial payments are recorded, funds must be allocated according to the active `IPaymentAllocationStrategy`:
  - **FIFO Waterfall (Default)**: Clears oldest outstanding invoice first, prioritizing Rent $\to$ Utilities $\to$ Ancillary Services $\to$ Maintenance Chargebacks $\to$ Late Fees.
  - **Proportional Allocation**: Allocates funds pro-rata across all unpaid line items.
  - **Strict Full Payment**: Withholds funds in an unapplied credit balance until full invoice balance is satisfied.
- **FR-12.3**: Every recorded payment must generate an immutable `PaymentReceipt` displaying allocated amounts and remaining balance.
- **FR-12.4**: The system must enforce an immutable **Payment Reversal Workflow** for dishonored payments (NSF bounced checks, ACH returns, credit card chargebacks):
  - Generates an immutable `PaymentReversalRecord` referencing the original receipt.
  - Re-opens invoice line item balances to `OVERDUE`.
  - Appends a configurable `NsfChargebackFee` ($35 / NPR 500 default) as an incidental fee.
  - Retroactively evaluates the late fee clock based on the reversal event.
- **FR-12.5**: The system must enforce automated **Unapplied Credit Drawdown**: overpayment surpluses residing in `RenterProfile.CreditBalance` automatically draw down against the oldest open invoice upon cycle finalization, with itemized receipt auditing.
- **FR-12.6**: The system must enforce mandatory **Multi-Currency Support** keyed to ISO-4217 currency codes:
  - Mandatory support for **USD (United States Dollar)** and **NPR (Nepalese Rupee)** from Day 1.
  - All financial values stored strictly as positive integers in minor currency units (cents for USD, paisa for NPR; $1\text{ NPR} = 100\text{ paisa}$).
  - Number formatting must support both Western notation (`100,000.00`) and South Asian / Vedic numbering (`1,00,000.00` lakhs/crores) based on the active currency and locale.
  - Leases and invoices bind strictly to their property's configured operating currency; cross-currency portfolio rollups evaluate via `IExchangeRateProvider`.


### Module 13: Maintenance Work Orders & Cost Attribution
- **FR-13.1**: The system must support the maintenance ticket lifecycle: `SUBMITTED` $\to$ `DISPATCHED` $\to$ `IN_PROGRESS` $\to$ `COMPLETED` $\to$ `CLOSED`.
- **FR-13.2**: Maintenance costs must be attributed to either:
  - **`LANDLORD_EXPENSE`**: Operating cost deducted from property revenue / owner distribution.
  - **`TENANT_CHARGEBACK`**: Negligence/damage cost appended directly as a line item on the renter's subsequent rental invoice.
- **FR-13.3**: The system must enforce **Evidence-Gated Tenant Chargebacks**:
  - Converting a work order to `TENANT_CHARGEBACK` strictly requires attaching supporting vendor invoices, itemized parts/labor receipts, and technician diagnosis notes.
  - Provides a structured 5-business-day resident review window allowing the tenant to inspect documentation and submit a formal dispute before the line item commits to their monthly rental invoice.

### Module 14: Property Owner Management & Disbursements
- **FR-14.1**: The system must support properties owned by third-party investors with configured Management Fee rules (e.g. 8% of collected rent or flat monthly rate) and configured operating currency (USD or NPR).
- **FR-14.2**: The system must generate monthly **Owner Disbursement Statements**:  
  $\text{Disbursement Amount} = \text{Gross Rent Collected} - \text{Management Fees} - \text{Owner Maintenance Expenses}$.
- **FR-14.3**: The system must enforce **Owner Spending Limits**:
  - `PropertyOwnerAggregate` defines an `AuthorizedMaintenanceLimit` (e.g. $300 / NPR 25,000).
  - Routine non-emergency repairs exceeding the limit trigger an automated `PENDING_OWNER_APPROVAL` gate before technician dispatch, while emergency repairs bypass the limit to protect the physical property.


### Module 15: Security Deposit Escrow & Move-Out Settlement
- **FR-15.1**: The system must track multiple deposit categories (Security, Pet, Key/Access, Advance Last Month Rent) held in designated escrow bank accounts.
- **FR-15.2**: Deposit interest is a **configurable feature** governed by `IDepositInterestPolicy`:
  - `NoDepositInterestPolicy` (Default): Deposits are non-interest-bearing; principal is held and settled with zero interest calculations (standard for Nepal, commercial leases, and private landlords).
  - `MoveOutCompoundingCreditPolicy`: Accrues statutory interest within the escrow ledger, paying out upon final move-out settlement.
  - `AnnualRentInvoiceCreditPolicy`: Automatically applies accrued interest as a credit memo on the 12th-month rental invoice.
- **FR-15.3**: Upon lease termination, the system must provide an itemized Move-Out Settlement workflow deducting unpaid rent, utilities (via move-out strategy), cleaning, and repair damages, generating a formal statement with net refund / balance due.

### Module 16: Multi-Utility Tariff Engine & Cascading Meter Trees
- **FR-16.1**: The system must support advanced tariff structures via `ITariffEvaluationStrategy`:
  - Single flat unit rate.
  - Inclining block tariffs (IBT) with multi-tier thresholds.
  - Two-part tariffs combining fixed monthly readiness fees with volumetric charges.
  - Time-of-Use (TOU) schedules distinguishing peak, mid-peak, and off-peak rate windows.
  - Seasonal multipliers for summer peak versus winter baseline periods.
- **FR-16.2**: The system must model sewer/wastewater charges via `ISewerCalculationStrategy`:
  - Direct percentage of clean water consumption.
  - Winter Quarter Average (WQA) seasonal baseline capping sewer volume during non-irrigation periods.
  - Flat municipal monthly sewer fees.
- **FR-16.3**: The system must support EV charging billing via `IEvChargingTariffStrategy` combining metered energy (kWh), connection session fees, and post-charge parking idle dwell penalties.
- **FR-16.4**: The system must support cascading meter hierarchies (Master Meter $\to$ Building Sub-stations $\to$ Unit & CAM Sub-meters) with automated line-loss variance auditing ($>5\%$ discrepancy trigger).
- **FR-16.5**: The system must support configurable solar net-metering and master bill reconciliation via `IUtilityDiscrepancyStrategy` (`LandlordAbsorptionStrategy` vs. `ProportionalPassThroughStrategy`).
- **FR-16.6**: The system must support mid-cycle tariff changes via configurable `ITariffEffectiveDatePolicy`:
  - `WeightedDayCountProRataPolicy` (Default): Evaluates consumption proportionally across days elapsed under each tariff rate window.
  - `ReadingDateRatePolicy`: Prices entire consumption against the tariff active on the reading date.

### Module 17: Move-In/Move-Out Inspections & Wear-and-Tear Depreciation
- **FR-17.1**: The system must support digital condition inspection walkthroughs (`MOVE_IN`, `MID_LEASE_PERIODIC`, `MOVE_OUT`) structured by room areas and sub-element checklists.
- **FR-17.2**: Inspections must capture conditions (`EXCELLENT`, `GOOD`, `FAIR`, `POOR`, `DAMAGED`), cleanliness notes, and timestamped photo evidence.
- **FR-17.3**: The system must support e-signatures with review time windows and tenant dispute/rebuttal workflows.
- **FR-17.4**: The system must enforce an IRS/HUD-aligned `AssetDepreciationSchedule` evaluating straight-line monthly depreciation for damaged finishes/appliances, legally bounding tenant chargebacks to remaining useful life value.
- **FR-17.5**: The system must provide automated Move-Out diffing (comparing move-out condition against move-in baseline) and feed itemized depreciated deductions directly into `SecurityDepositEscrowLedger.MoveOutSettlementStatement`.
- **FR-17.6**: The system must support `DamageDisputeAggregate` tracking formal renter rebuttals with statutory response clocks (14–21 days) and automated credit memo adjustments.
- **FR-17.7**: The system must enforce an automated **7-Day Resident Discovery Window** for Move-In Inspections: if no counter-photos or disputes are filed by the tenant within 7 days of key receipt, the inspection automatically locks to `MUTUALLY_ACCEPTED_LOCKED` as the permanent baseline.


### Module 18: Lease Guarantors, Corporate Master Leases & Deposit Alternatives
- **FR-18.1**: The system must support `LeaseGuarantorAggregate` modeling third-party financial guarantors (separate from co-signers) who hold zero tenancy/possessory rights.
- **FR-18.2**: Guarantor agreements must support configurable liability terms: `UNLIMITED_FINANCIAL`, `CAPPED_AMOUNT`, or `TIME_BOUND`.
- **FR-18.3**: The system must generate formal legal **Guarantor Demand Notices** upon primary resident arrears defaults.
- **FR-18.4**: The system must support Corporate Master Leases where a legal corporate obligor holds the lease and pays invoices, while rotating authorized occupants reside in the space with credential turnover tracking.
- **FR-18.5**: The system must support three deposit guarantee models via `IDepositGuaranteeStrategy`:
  - `TraditionalEscrowDepositStrategy` (refundable cash held in escrow).
  - `ThirdPartySuretyBondStrategy` (bond certificate with insurer claim submission and statutory subrogation tracking).
  - `InHouseWaiverPoolStrategy` (non-refundable monthly waiver fee pooling into a landlord self-insurance reserve).
- **FR-18.6**: The system must enforce physical space capacity bounds on corporate leases:
  - Active occupants whose date ranges overlap must not exceed `RentableSpaceAggregate.MaxOccupants`.
  - Configurable policy: `HardCapacityBlockPolicy` (default, blocks over-occupancy) vs. `PermissiveWithOverageSurchargePolicy` (allows additional occupants with automatic monthly surcharge).

---





## 4. Non-Functional Requirements (NFR)

- **NFR-1 (Multi-Tenancy & Data Isolation)**: Every query, mutation, and background job must strictly scope to `tenantId`. Enforced at the PostgreSQL Row-Level Security (RLS) kernel layer.
- **NFR-2 (Financial Precision & Currency Representation)**: All monetary figures must be stored strictly as integers in the lowest minor currency unit (e.g. cents) with an ISO-4217 currency code. Floating-point math for money is strictly prohibited.
- **NFR-3 (Auditability & Immutability)**: Invoices, payment receipts, work order financial logs, and deposit deduction statements must be append-only and immutable once issued. Corrections must roll forward via credit memos or adjustments.
- **NFR-4 (Performance & Response SLAs)**: Sub-second read response times ($p95 < 200ms$ for API queries) and fast application startup ($< 3s$) ensuring 12-factor cloud-native disposability.
- **NFR-5 (Test Coverage & Reliability)**: Enforce 100.00% unit and acceptance test coverage with zero tolerance for flaky tests.

---

## 5. Edge Cases & Boundary Specifications

1. **Mid-Cycle Move-In with Variable Month Lengths**: February (28/29 days) vs March (31 days). Handled by `IProrationStrategy` selecting between actual calendar days or standard 30-day commercial month.
2. **Sub-Meter Replacement / Rollover**: When a mechanical meter reaches 99,999 and rolls over to 00,001 or is physically replaced, the system requires an explicit `MeterResetEvent` with old meter final reading and new meter baseline reading.
3. **Consumption Spikes & Leaks**: When consumption exceeds 200% of rolling 3-reading average, system holds invoice generation until supervisor verification.
4. **Overpayments & Account Credit**: If a renter pays more than the total balance due, the surplus must be held in a tenant credit ledger and automatically applied to the subsequent billing cycle.
5. **Roommate Mid-Month Departure in Co-Living**: When one roommate leaves a shared unit mid-month, utility splits must recalculate dynamically based on active occupant day-counts.
6. **Eviction Payment Interception**: When `IsLegalHoldActive` is flagged on a delinquent lease, partial online or automated payments are blocked to prevent legal waiver of active eviction proceedings.
