# Oma Kulu - Complete App Specification

## Core Philosophy

Oma Kulu ("My Expense" in Estonian) transforms manual spreadsheet tracking into an intuitive monthly financial planning system. The app shifts from reactive transaction logging to proactive allocation planning, mirroring the user's mental model of monthly "buckets" while solving critical pain points of payment tracking and category flexibility.

## Key Principles

- **Planning-First:** The budget view is the primary workspace, not historical reports
- **Two Critical Numbers:** "Amount Left to Assign" and "Actual Amount Left" always visible
- **Payment Tracking:** Expected invoices move from planning to history with one tap
- **Flexible Consistency:** Categories evolve with life changes while maintaining historical integrity
- **Multi-Month Planning:** Work on any month's budget with easy template copying

---

## Views & Components

### 1. Budget View (Primary Home Screen)

**Purpose:** Monthly planning and tracking workspace - the digital equivalent of spreadsheet monthly tabs

**Layout:**

```
[March 2025 ◀ ▶] [Copy Previous Month]

CASH FLOW
Planned to Assign: €453
Actual in Bank: €1,247

--- EXPECTED ITEMS ---

[▶] INCOME (Planned: €3,344)
[ ] Salary €2,944
[ ] Wife Contribution €400

[▶] INSURANCE (Planned: €423)
[ ] Car Insurance (P&C) €138
[ ] Home Insurance (If) €285

[▼] SUBSCRIPTIONS (Planned: €27)
[✅] Netflix €15
[ ] Spotify €12
[+] (Add item)

--- FREE-RANGE BUDGETS ---

CATEGORY ALLOCATED SPENT REMAINING
Groceries €500 €220 €280 [Edit]
Fuel €180 €150 €30 [Edit]
Shopping €200 €450 -€250 [Edit]
[+ Add Budget Category]

[FAB: Add Expected Income/Invoice]
```

**Interactions:**

- **Month Selector:** Tap to work on any month (past or future)
- **Copy Previous Month:** One-tap template copying for quick setup
- **Expand/Collapse:** Tap `[▶]/[▼]` to show/hide category items
- **Mark Paid:** Tap `[ ]` to mark expected items as paid (auto-creates transaction with today's date)
- **Edit Amounts:** Tap any amount to modify
- **Add Items:** `[+]` adds new expected items to specific categories
- **Edit Budgets:** Tap `[Edit]` to modify free-range allocations

---

### 2. Transactions View

**Purpose:** Master ledger of all financial activity

**Layout:**

```
Transactions
[Search Bar]
[Filter: All | Upcoming | Income | Expense]

--- UPCOMING ---
Feb 28 - Car Insurance (P&C) -€138
Feb 25 - Spotify Subscription -€12
Feb 20 - Salary €2,944

--- RECENT ---
Today - MARKED PAID: Netflix -€15
Feb 27 - S-Market Groceries -€85
Feb 25 - Gas Station Neste -€70

[+] Add Transaction
```

**Interactions:**

- **Manual Entry:** Add transactions with category assignment
- **Status Filter:** View only upcoming, only income, etc.
- **Search:** Find transactions by description
- **Swipe Actions:** Edit or delete transactions
- **Upcoming Items:** Mirror of unpaid expected items from Budget View

---

### 3. Categories & Settings View

**Purpose:** System configuration and category management

**Layout:**

```
[Categories] [Templates] [Settings]

--- Categories Tab ---
ACTIVE CATEGORIES
[≡] Income [Edit] [Archive]
[≡] Insurance [Edit] [Archive]
[≡] Groceries+Fuel [Edit] [Archive]

ARCHIVED CATEGORIES
[ ] Car Loan [Restore] [Delete]

[+ Create Category]

--- Templates Tab ---
Salary
Type: Expected Income
Category: Income
Typical Amount: €2,944
[Edit] [Disable]

[+ Create Template]

--- Settings Tab ---

- App Passcode [Change]
- Starting Balance: [€1,500] [Edit]
- Export Data (CSV)
- Backup to Cloud

```

---

## User Flows

### Monthly Budget Setup

1.  Tap month selector -> choose next month
2.  Tap "**Copy Previous Month**" -> confirm template copy
3.  Review and adjust expected incomes/invoices
4.  Allocate "**Amount Left to Assign**" to free-range budgets
5.  Budget is ready for the month

### Daily Invoice Management

1.  Receive bill -> appears in Budget View "**Expected Items**"
2.  Tap checkbox `[ ]` to mark as paid
3.  Item moves to Transactions "**Recent**" with today's date
4.  "**Actual Amount Left**" updates automatically

### Spending Tracking

1.  Make purchase -> go to Transactions View
2.  Tap `[+]` -> enter amount, category, description
3.  Free-range budget "**Spent**" column updates in real-time
4.  Monitor "**Remaining**" amounts throughout month

### Category Evolution

1.  Life change requires new category -> Categories View
2.  Create new category or restore archived one
3.  Category available for next month's budget setup
4.  Historical data maintains original categorization

---

## Key User Stories

- As a user, I want to **mark expected invoices as paid** so they automatically move to my transaction history
- As a user, I want to see **how much money I have left to assign** after accounting for all planned expenses
- As a user, I want to **copy last month's budget template** to quickly set up next month's plan
- As a user, I want to **work on future months' budgets** to plan for irregular income and expenses
- As a user, I want to **archive categories** I no longer use while keeping their historical data
- As a user, I want to see both my **planned financial status and actual bank balance** at a glance
