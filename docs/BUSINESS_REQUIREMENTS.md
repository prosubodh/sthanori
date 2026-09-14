# Comprehensive Business Requirements Document (`BUSINESS_REQUIREMENTS.md`)

## 1. Document Overview & System Objectives

**Product Name**: Sthanori Multi-Tenant Real Estate & Rental Billing Platform  
**Target Audience**: Independent Landlords, Property Management Companies, Co-living Operators, and Commercial Property Owners.  
**Core Mission**: Provide an automated, mathematically rigorous, and auditable platform for managing properties, rentable spaces, resident leases, utility metering, recurring rental invoicing, roommate split billing, maintenance chargebacks, owner disbursements, and move-out security deposit reconciliations.

---

## 2. User Roles & Permission Matrix

| Role | Scope | Permissions |
| :--- | :--- | :--- |
| **Landlord / Company Admin** | Tenant Workspace | Full administrative control: configure properties, leases, utility billing rules, pricing plans, staff access, and financial ledgers. |
| **Property Manager** | Assigned Properties | Manage units, draft and activate leases, record meter readings, issue invoices, record payments, and manage work orders. |
| **Property Owner (Investor)**| Owned Properties | Read-only portal access to property occupancy rates, maintenance expense reports, and monthly Owner Disbursement statements. |
| **Field Inspector / Technician** | Assigned Properties | Record utility sub-meter readings, log inspection notes, complete maintenance work orders, and upload damage photos. |
| **Renter (Resident / Occupant / Client)** | Self / Active Leases | Read-only access to own lease terms, download itemized invoices, view utility consumption breakdowns, submit maintenance tickets, and download payment receipts. |

---

## 3. Functional Requirements (FR)

### Module 1: Property & Rentable Space Management
- **FR-1.1**: The system must support creating properties classified as `RESIDENTIAL_MULTIFAMILY`, `SINGLE_FAMILY`, `CO_LIVING`, `COMMERCIAL`, or `MIXED_USE`.
- **FR-1.2**: Each property must encompass one or more `RentableSpace` entities (Apartments, Rooms, Suites).
- **FR-1.3**: Spaces must store square footage, floor level, max occupancy, base rent, and operational status (`VACANT`, `OCCUPIED`, `MAINTENANCE`, `RESERVED`).
- **FR-1.4**: In co-living mode, the system must allow grouping multiple private rooms under a single common apartment unit sharing common areas.

### Module 2: Renter & Identity Directory
- **FR-2.1**: The system must maintain profiles for renting parties, classified by `RenterType` (`RESIDENTIAL_RESIDENT`, `CO_LIVING_OCCUPANT`, `COMMERCIAL_CLIENT`).
- **FR-2.2**: Profiles must store contact info (email, phone), identification/tax numbers (for commercial clients), and emergency contacts.
- **FR-2.3**: Renters must be linkable to multiple leases over time to preserve tenant history and payment credibility.

### Module 3: Lease Lifecycle & Stepped Escalation
- **FR-3.1**: The system must enforce the state machine: `DRAFT` $\to$ `PENDING_APPROVAL` $\to$ `ACTIVE` $\to$ `UNDER_NOTICE` $\to$ `EXPIRED` / `MONTH_TO_MONTH` $\to$ `TERMINATED` $\to$ `CLOSED`.
- **FR-3.2**: A space cannot be leased if its status is `OCCUPIED` during the requested lease date range.
- **FR-3.3**: Leases must support `RentEscalationSchedule`: scheduling future rent changes on specific effective dates across multi-year contracts.
- **FR-3.4**: When a lease starts mid-month, the system must automatically calculate prorated rent using the configured `IProrationStrategy` (Actual days in month vs 30-day standard).
- **FR-3.5**: The system must support an automated 60/90-day Renewal Proposal workflow allowing renters to accept, decline, or counter proposed lease revisions.

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

### Module 5: Rental Invoicing & Roommate Split Billing
- **FR-5.1**: The system must support automated generation of recurring monthly invoices X days prior to the billing due date.
- **FR-5.2**: The system must support 3 distinct roommate billing strategies via `IRoommateBillingStrategy`:
  1. **Joint & Several Split Invoicing**: Generates individualized invoices per roommate based on configured split percentages, while preserving joint legal liability on the master lease.
  2. **Single Master Invoice**: Consolidates the unit onto one invoice, allowing roommates to submit partial payments.
  3. **Individual Room Leases**: Direct independent invoices per private bedroom lease.
- **FR-5.3**: Invoices must support configurable layout:
  - **Unified Monthly Invoice**: Consolidating base rent, itemized utilities, and recurring fees.
  - **Separate Utility Invoice**: Dispatched independently when municipal utility bills arrive out-of-cycle.
- **FR-5.4**: When an invoice remains unpaid past the due date plus grace period, late fees must be assessed via the active `ILateFeeStrategy` (Flat, Percentage, Daily Accruing, or None).

### Module 6: Payment Recording & Allocation Waterfall
- **FR-6.1**: The system must support recording offline payments (Cash, Check, Wire Transfer, Money Order) with reference numbers and payment dates.
- **FR-6.2**: When partial payments are recorded, funds must be allocated according to the active `IPaymentAllocationStrategy`:
  - **FIFO Waterfall (Default)**: Clears oldest outstanding invoice first, prioritizing Rent $\to$ Utilities $\to$ Maintenance Chargebacks $\to$ Late Fees.
  - **Proportional Allocation**: Allocates funds pro-rata across all unpaid line items.
  - **Strict Full Payment**: Withholds funds in an unapplied credit balance until full invoice balance is satisfied.
- **FR-6.3**: Every recorded payment must generate an immutable `PaymentReceipt` displaying remaining balance.

### Module 7: Maintenance Work Orders & Cost Attribution
- **FR-7.1**: The system must support the maintenance ticket lifecycle: `SUBMITTED` $\to$ `DISPATCHED` $\to$ `IN_PROGRESS` $\to$ `COMPLETED` $\to$ `CLOSED`.
- **FR-7.2**: Maintenance costs must be attributed to either:
  - **`LANDLORD_EXPENSE`**: Operating cost deducted from property revenue / owner distribution.
  - **`TENANT_CHARGEBACK`**: Negligence/damage cost appended directly as a line item on the renter's subsequent rental invoice.

### Module 8: Property Owner Management & Disbursements
- **FR-8.1**: The system must support properties owned by third-party investors with configured Management Fee rules (e.g. 8% of collected rent or flat monthly rate).
- **FR-8.2**: The system must generate monthly **Owner Disbursement Statements**:  
  $\text{Disbursement Amount} = \text{Gross Rent Collected} - \text{Management Fees} - \text{Owner Maintenance Expenses}$.

### Module 9: Security Deposit Escrow & Move-Out Settlement
- **FR-9.1**: The system must track multiple deposit categories (Security, Pet, Key/Access, Advance Last Month Rent) held in designated escrow bank accounts.
- **FR-9.2**: The system must support optional statutory annual interest accrual credited to the renter or settled at move-out.
- **FR-9.3**: Upon lease termination, the system must provide an itemized Move-Out Settlement workflow deducting unpaid rent, utilities, cleaning, and repair damages, generating a formal statement with net refund / balance due.

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
6. **Lease Rollover**: Leases reaching expiration date without notice automatically transition to `MONTH_TO_MONTH` status, continuing automated invoice generation unless explicitly terminated.
