# Business Requirements Document (`BUSINESS_REQUIREMENTS.md`)

## 1. Document Overview & System Objectives

**Product Name**: Sthanori Multi-Tenant Real Estate & Rental Billing Platform  
**Target Audience**: Independent Landlords, Property Management Companies, Co-living Operators, and Commercial Property Owners.  
**Core Mission**: Provide an automated, mathematically rigorous, and auditable platform for managing properties, rentable spaces, resident leases, utility metering, recurring rental invoicing, and move-out security deposit reconciliations.

---

## 2. User Roles & Permission Matrix

| Role | Scope | Permissions |
| :--- | :--- | :--- |
| **Landlord / Company Admin** | Tenant Workspace | Full administrative control: configure properties, leases, utility billing rules, pricing plans, staff access, and financial ledgers. |
| **Property Manager** | Assigned Properties | Manage units, draft and activate leases, record meter readings, issue invoices, and record payments. |
| **Field Inspector / Technician** | Assigned Properties | Record utility sub-meter readings, log inspection notes, and upload move-in/out damage reports with photo evidence. |
| **Renter (Resident / Occupant / Client)** | Self / Active Leases | Read-only access to own lease terms, download itemized invoices, view utility consumption breakdowns, and download payment receipts. |

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

### Module 3: Lease Lifecycle Management
- **FR-3.1**: The system must enforce the state machine: `DRAFT` $\to$ `PENDING_APPROVAL` $\to$ `ACTIVE` $\to$ `UNDER_NOTICE` $\to$ `EXPIRED` / `MONTH_TO_MONTH` $\to$ `TERMINATED` $\to$ `CLOSED`.
- **FR-3.2**: A space cannot be leased if its status is `OCCUPIED` during the requested lease date range.
- **FR-3.3**: Leases must record monthly base rent, billing day of month (e.g. 1st), grace period days, and security deposit terms.
- **FR-3.4**: When a lease starts mid-month, the system must automatically calculate prorated rent using the configured `IProrationStrategy` (Actual days in month vs 30-day standard).

### Module 4: Utility Metering & Calculation Engine
- **FR-4.1**: The system must support 5 distinct utility calculation strategies:
  1. **Direct Sub-Meter**: $(CurrentReading - PreviousReading) \times RatePerUnit$.
  2. **Equal Split**: Master bill divided equally among active renters in the property (ideal for Co-living).
  3. **RUBS by Square Footage**: $MasterBill \times (SpaceSqFt / TotalSqFt)$.
  4. **RUBS by Occupancy**: $MasterBill \times (SpaceOccupants / TotalOccupants)$.
  5. **Flat Monthly Fee**: Static recurring add-on.
- **FR-4.2**: For sub-metered utilities, the system must record reading dates, meter values, and validate that current readings are $\ge$ previous readings unless a meter reset flag is confirmed.
- **FR-4.3**: Master utility bills must be assignable to a billing period and automatically partitioned across active spaces according to each space's assigned utility strategy.

### Module 5: Rental Invoicing & Billing Cycles
- **FR-5.1**: The system must support automated generation of recurring monthly invoices X days prior to the billing due date.
- **FR-5.2**: Invoices must support configurable layout:
  - **Unified Monthly Invoice**: Consolidating base rent, itemized utilities, and recurring fees.
  - **Separate Utility Invoice**: Dispatched independently when municipal utility bills arrive out-of-cycle.
- **FR-5.3**: Invoices must transition across statuses: `DRAFT` $\to$ `ISSUED` $\to$ `PARTIALLY_PAID` $\to$ `PAID` $\to$ `OVERDUE` $\to$ `VOIDED`.
- **FR-5.4**: When an invoice remains unpaid past the due date plus grace period, the system must calculate and append late fees via the active `ILateFeeStrategy` (Flat, Percentage, Daily Accruing, or None).

### Module 6: Payment Recording & Allocation Waterfall
- **FR-6.1**: The system must support recording offline payments (Cash, Check, Wire Transfer, Money Order) with reference numbers and payment dates.
- **FR-6.2**: When partial payments are recorded, funds must be allocated according to the active `IPaymentAllocationStrategy`:
  - **FIFO Waterfall (Default)**: Clears oldest outstanding invoice first, prioritizing Rent $\to$ Utilities $\to$ Late Fees.
  - **Proportional Allocation**: Allocates funds pro-rata across all unpaid line items.
  - **Strict Full Payment**: Withholds funds in an unapplied credit balance until full invoice balance is satisfied.
- **FR-6.3**: Every recorded payment must generate an immutable `PaymentReceipt` displaying remaining balance.

### Module 7: Security Deposit Escrow & Move-Out Settlement
- **FR-7.1**: The system must track security deposit collection at lease inception and maintain its escrow ledger.
- **FR-7.2**: Upon lease termination, the system must provide a Move-Out Reconciliation workflow allowing itemized deductions for:
  - Unpaid rent arrears
  - Outstanding utility balances
  - Physical damages and repair costs with supporting invoices/photos
  - Cleaning fees
- **FR-7.3**: The system must generate a formal **Move-Out Settlement Statement** calculating:  
  $NetRefund = DepositHeld - TotalDeductions$. If deductions exceed deposit, a final balance invoice is generated.

---

## 4. Non-Functional Requirements (NFR)

- **NFR-1 (Multi-Tenancy & Data Isolation)**: Every query, mutation, and background job must strictly scope to `tenantId`. Enforced at the PostgreSQL Row-Level Security (RLS) kernel layer.
- **NFR-2 (Financial Precision & Currency Representation)**: All monetary figures must be stored strictly as integers in the lowest minor currency unit (e.g. cents) with an ISO-4217 currency code. Floating-point math for money is strictly prohibited.
- **NFR-3 (Auditability & Immutability)**: Invoices, payment receipts, and deposit deduction statements must be append-only and immutable once issued. Corrections must roll forward via credit memos or adjustments.
- **NFR-4 (Performance & Response SLAs)**: Sub-second read response times ($p95 < 200ms$ for API queries) and fast application startup ($< 3s$) ensuring 12-factor cloud-native disposability.
- **NFR-5 (Test Coverage & Reliability)**: Enforce 100.00% unit and acceptance test coverage with zero tolerance for flaky tests.

---

## 5. Edge Cases & Boundary Specifications

1. **Mid-Cycle Move-In with Variable Month Lengths**: February (28/29 days) vs March (31 days). Handled by `IProrationStrategy` selecting between actual calendar days or standard 30-day commercial month.
2. **Sub-Meter Replacement / Rollover**: When a mechanical meter reaches 99,999 and rolls over to 00,001 or is physically replaced, the system requires an explicit `MeterResetEvent` with old meter final reading and new meter baseline reading.
3. **Overpayments & Account Credit**: If a renter pays more than the total balance due, the surplus must be held in a tenant credit ledger and automatically applied to the subsequent billing cycle.
4. **Roommate Departure in Co-Living**: When one roommate leaves a shared unit mid-month, utility splits must recalculate dynamically based on active occupant day-counts.
5. **Lease Rollover**: Leases reaching expiration date without notice automatically transition to `MONTH_TO_MONTH` status, continuing automated invoice generation unless explicitly terminated.
