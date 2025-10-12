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
[◀ March 2025 ▶]

CASH OVERVIEW
Total expected income: €3,344
Total expected expenses: €450
Money to assign: €453
Money left in bank: €1,247

[💡 No budget set? Copy Previous Month]  (appears only when all sections are empty)

--- EXPECTED INCOMES ---                          [+ Add Income]
[ ] Salary (Income) €2,944
[ ] Wife Contribution (Income) €400
(Empty state: "No expected incomes yet. Tap + to add one.")

--- EXPECTED INVOICES ---                         [+ Add Invoice]
[ ] Netflix (Subscriptions) €15
[ ] Car Insurance (Insurance) €138
(Empty state: "No expected invoices yet. Tap + to add one.")

--- BUDGETS ---                                   [+ Add Budget]
Groceries €500 | Spent: €220 (44%) | Left: €280
Fuel €180 | Spent: €150 (83%) | Left: €30
Shopping €200 | Spent: €450 (225%) | Left: -€250
(Empty state: "No budgets yet. Tap + to add one.")
```

**Interactions:**

- **Month Selector:** Tap arrows to navigate between months (past or future)
- **Copy Previous Month:** Button appears only when all sections are empty; copies all items from previous month
- **Mark/Unmark Paid (Incomes/Invoices):** Tap checkbox to toggle paid status; marking creates transaction, unmarking deletes it
- **Add Income:** Opens dialog with fields: Name (optional, uses category if empty), Category (dropdown from categories), Amount, Notes (optional)
- **Add Invoice:** Opens dialog with fields: Name (optional, uses category if empty), Category (dropdown from categories), Amount, Notes (optional)
- **Add Budget:** Opens dialog with fields: Category (dropdown from categories), Amount, Notes (optional)
- **Edit Items:** Tap any income/invoice/budget item to edit (same dialog as add)
- **Delete Items:** Swipe or long-press to delete any item
- **Empty States:** Each section shows helpful prompt when no items exist

---

### 2. Transactions View

**Purpose:** Master ledger of all financial activity

**Layout:**

```
[◀ January 2025 ▶]

--- UPCOMING (tap to collapse/expand) ---
Salary (Income) +€2,944
Netflix (Subscriptions) -€15
Car Insurance (Insurance) -€138

--- RECENT ---
Jan 15 - Grocery Shopping (Groceries) -€85.0
Jan 14 - Gas Station (Fuel) -€70.0
Jan 10 - Salary Payment (Income) +€2,944.0

[FAB: + Add Transaction]
```

**Interactions:**

- **Month Selector:** Navigate between months using arrows
- **Upcoming Section:** Tap header to collapse/expand; shows unpaid incomes, invoices, and upcoming transactions
- **Manual Entry:** Add transactions with category, amount, date, and status
- **Edit/Delete:** Tap pencil or trash icons on each transaction
- **Color Coding:** Green (+) for income, Red (-) for expenses
- **Amount Format:** Single decimal (e.g., €50.0), with + or - prefix

---

### 3. Categories & Settings View

**Purpose:** System configuration and category management

**Layout:**

```
[Categories] [Settings]

--- Categories Tab ---
ACTIVE CATEGORIES
[≡] Income [Edit] [Archive]
[≡] Insurance [Edit] [Archive]
[≡] Groceries+Fuel [Edit] [Archive]

ARCHIVED CATEGORIES
[ ] Car Loan [Restore] [Delete]

[+ Create Category]

--- Settings Tab ---

- App Passcode [Change]
- Starting Balance: [€1,500] [Edit]
- Export Data (CSV)
- Backup to Cloud

```

---

## User Flows

### Monthly Budget Setup

1.  Navigate to next month using month selector arrows
2.  Tap "**Copy Previous Month**" button (if sections are empty)
3.  Add expected incomes (Salary, etc.) - tap "+ Add Income"
4.  Add expected invoices (Netflix, Insurance, etc.) - tap "+ Add Invoice"
5.  Add budgets for variable expenses (Groceries, Fuel, etc.) - tap "+ Add Budget"
6.  Monitor "**Money to assign**" to ensure all income is allocated

### Daily Income/Invoice Management

1.  Expected income or invoice appears in Budget View
2.  Tap checkbox `[ ]` next to item to mark as paid
3.  Transaction automatically created with today's date
4.  "**Money left in bank**" updates automatically
5.  Item remains visible but checked off for the month

### Spending Tracking

1.  Make purchase -> go to Transactions View
2.  Tap `[+]` -> enter amount, category, description
3.  Return to Budget View to see budget "**Spent**" and percentage
4.  Monitor "**Left**" amounts and progress bars throughout month
5.  Budget items show visual indicators (green/yellow/red) based on % used

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

---

## Data Architecture

### Storage System

**Database:** Supabase (PostgreSQL)
**Authentication:** None (single-user app with passcode protection)
**Access Control:** Open RLS policies (all operations allowed)

### Data Models

#### 1. Expected Incomes

```typescript
{
  id: UUID (primary key)
  name: TEXT (optional - defaults to category name if empty)
  category: TEXT (references categories.name)
  amount: NUMERIC (positive number)
  month: TEXT (YYYY-MM format)
  is_paid: BOOLEAN (default: false)
  notes: TEXT (optional, for additional context)
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

**Note:** If `name` is empty, the app uses the `category` value for display.

#### 2. Expected Invoices

```typescript
{
  id: UUID (primary key)
  name: TEXT (optional - defaults to category name if empty)
  category: TEXT (references categories.name)
  amount: NUMERIC (positive number)
  month: TEXT (YYYY-MM format)
  is_paid: BOOLEAN (default: false)
  notes: TEXT (optional, for additional context)
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

**Note:** If `name` is empty, the app uses the `category` value for display.

#### 3. Budgets

```typescript
{
  id: UUID (primary key)
  category: TEXT (references categories.name)
  allocated_amount: NUMERIC
  month: TEXT (YYYY-MM format)
  notes: TEXT (optional, for additional context)
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

**Note:** `spent_amount` is calculated in real-time from transactions, not stored in the database.

#### 4. Transactions

```typescript
{
  id: UUID (primary key)
  amount: NUMERIC (positive for income, negative for expenses)
  description: TEXT
  date: DATE (ISO format: YYYY-MM-DD)
  category: TEXT
  status: TEXT ('upcoming' | 'paid')
  created_at: TIMESTAMPTZ
}
```

#### 5. Categories

```typescript
{
  id: UUID (primary key)
  name: TEXT
  type: TEXT ('income' | 'expense')
  icon: TEXT (optional, emoji or icon name)
  color: TEXT (optional, hex color)
  is_visible: BOOLEAN (default: true)
  order_index: INT (optional, for sorting)
  created_at: TIMESTAMPTZ
}
```

#### 6. App Settings

```typescript
{
  id: INT2 (primary key)
  passcode_hash: TEXT (optional)
  starting_balance: NUMERIC (default: 0)
  updated_at: TIMESTAMPTZ
}
```

### Data Access Layer

**Module:** `lib/database.ts`
**Pattern:** Async functions using Supabase client
**Error Handling:** Try-catch with console logging, returns empty arrays/defaults on error

**Key Functions:**

- `loadIncomes(month)` - Fetch expected incomes for a month
- `saveIncome(income)` - Insert or update income
- `deleteIncome(id)` - Delete income by ID
- `loadInvoices(month)` - Fetch expected invoices for a month
- `saveInvoice(invoice)` - Insert or update invoice
- `deleteInvoice(id)` - Delete invoice by ID
- `loadBudgets(month)` - Fetch budgets for a month
- `saveBudget(budget)` - Insert or update budget
- `deleteBudget(id)` - Delete budget by ID
- `loadTransactions()` - Fetch all transactions ordered by date
- `saveTransaction(tx)` - Insert or update transaction
- `deleteTransaction(id)` - Delete transaction by ID
- `loadCategories()` - Fetch visible categories ordered by index
- `saveCategory(cat)` - Insert or update category
- `deleteCategory(id)` - Delete category by ID
- `loadSettings()` - Fetch app settings (single row)
- `saveSettings(settings)` - Update app settings

**Compatibility Layer:** `lib/storage.ts` re-exports database functions to maintain backward compatibility with existing components.
