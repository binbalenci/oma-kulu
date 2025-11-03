# Savings Feature - Complete Specification

## Overview

This feature adds a **Savings** system to Oma Kulu, allowing users to allocate money monthly toward future expenses (like car insurance, car service, travel funds, etc.). Savings accumulate over time and can be used to pay for expenses when they occur.

**Key Concept:** Savings are like reverse budgets - you allocate money monthly, it accumulates, and you use it when the actual expense occurs.

---

## Core Principles

1. **Savings as Expected Expenses:** Savings items count in "Remaining to assign" calculation (reduce available money)
2. **Balance Accumulation:** When Savings item is marked as paid, money goes to savings balance (tracked per category)
3. **Balance Usage:** When actual expense occurs, user can use savings balance to pay (partially or fully)
4. **One Target Per Category:** Each savings category has one target amount that persists across months
5. **Balance Cap:** Savings balance cannot go negative (caps at 0)

---

## Database Schema Changes

### 1. New Table: `expected_savings`

```typescript
{
  id: UUID (primary key)
  category: TEXT (references categories.name where type='saving')
  amount: NUMERIC (planned contribution amount for this month)
  month: TEXT (YYYY-MM format)
  target: NUMERIC (optional, target amount for this category - persists across months)
  is_paid: BOOLEAN (default: false)
  notes: TEXT (optional)
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

**Rules:**
- One Savings item per category per month (like Budgets)
- `target` field: If set, persists for that category across all months
- When adding new Savings item, if category has existing target, show it in dialog

### 2. Enhanced Transaction Table

```typescript
// Add to existing Transaction interface:
{
  // ... existing fields ...
  uses_savings_category?: TEXT (category name if using savings)
  savings_amount_used?: NUMERIC (amount used from savings balance)
}
```

### 3. Enhanced Category Table

```typescript
// Add to existing Category interface:
{
  // ... existing fields ...
  type: 'income' | 'expense' | 'saving'  // NEW: third type
}
```

### 4. New Table: `savings_balances` (or calculate on-the-fly)

**Option A: Store balance in database**
```typescript
{
  category: TEXT (primary key, references categories.name)
  balance: NUMERIC (current balance)
  target: NUMERIC (optional, target amount)
  last_updated: TIMESTAMPTZ
}
```

**Option B: Calculate on-the-fly**
- Balance = Sum of all transactions where `source_type = 'savings'` AND `category = X`
- Minus: Sum of all transactions where `uses_savings_category = X` AND `savings_amount_used > 0`
- Formula: `contributions - payments_using_savings`

**Recommendation:** Option B (calculate on-the-fly) to avoid sync issues.

---

## Calculation Logic

### Savings Balance Calculation

```typescript
// For a given savings category:
const contributions = transactions
  .filter(t => t.source_type === 'savings' && t.category === categoryName)
  .reduce((sum, t) => sum + Math.abs(t.amount), 0);

const payments = transactions
  .filter(t => t.uses_savings_category === categoryName && t.savings_amount_used)
  .reduce((sum, t) => sum + (t.savings_amount_used || 0), 0);

const balance = Math.max(0, contributions - payments); // Cap at 0
```

### Total Savings Balance

```typescript
// Sum of all savings category balances
const totalSavings = categories
  .filter(c => c.type === 'saving')
  .reduce((sum, cat) => sum + getSavingsBalance(cat.name), 0);
```

### "Remaining to Assign" Calculation

```typescript
const expectedIncome = currentIncomes.reduce((sum, i) => sum + i.amount, 0);
const expectedExpenses = currentInvoices.reduce((sum, i) => sum + i.amount, 0);
const totalAllocated = currentBudgets.reduce((sum, b) => sum + b.allocated_amount, 0);
const totalSavings = currentSavings.reduce((sum, s) => sum + s.amount, 0); // NEW

const moneyToAssign = expectedIncome - expectedExpenses - totalAllocated - totalSavings;
```

**Note:** Savings items count whether `is_paid` is true or false (money is allocated either way).

### "In Bank" Calculation

```typescript
// Only includes transactions with date <= today AND status === 'paid'
const monthTransactions = transactions.filter((t) => {
  const d = new Date(t.date + "T00:00:00");
  return d >= monthStart && d <= monthEnd && d <= today && t.status === "paid";
});

// Calculate income portion (excluding savings contributions and savings-covered portions)
const totalIncome = monthTransactions
  .filter(t => t.amount > 0 && t.source_type !== 'savings') // Exclude savings contributions
  .reduce((sum, t) => sum + t.amount, 0);

// Calculate expense portion (only count portion NOT covered by savings)
const totalExpenses = monthTransactions
  .filter(t => t.amount < 0)
  .reduce((sum, t) => {
    const amount = Math.abs(t.amount);
    const savingsUsed = t.savings_amount_used || 0;
    // Only count portion from income (not covered by savings)
    return sum + (amount - savingsUsed);
  }, 0);

const actualInBank = totalIncome - totalExpenses;
```

**Rules:**
- Savings contributions (`source_type: 'savings'`) reduce "In Bank" (money left bank)
- Transactions fully covered by savings: €0 deducted from "In Bank"
- Transactions partially covered: Only remainder (not covered by savings) deducted from "In Bank"
- Transactions using savings: The `savings_amount_used` portion doesn't count toward "In Bank" reduction

---

## UI Changes

### 1. Home Tab (Budget View)

#### Cash Overview Section

**Current Layout:**
```
Line 1: Income | Expenses | Remaining | In Bank
```

**New Layout:**
```
Line 1: Income | Expenses | Remaining
Line 2: In Bank | Savings Balances
```

**Implementation:**
- Create two rows in `overviewCompact` container
- Line 1: 3 items (Income, Expenses, Remaining)
- Line 2: 2 items (In Bank, Savings Balances)
- Same styling as current overview items
- "Savings Balances" shows total of all savings category balances

#### New Savings Section

**Placement:** Between "Budgets" and "Expected Invoices" sections

**Header:**
```
--- SAVINGS ---                          [+ Add Savings]
```

**Item Display (Similar to Budget Cards):**
```
┌─────────────────────────────────────┐
│ 🚗 Car Insurance (Insurance)         │ [Edit] [Delete]
│ Balance: €150 | Target: €414 |       │
│ Monthly: €138                         │
│ [Progress Bar: 36%]                   │
└─────────────────────────────────────┐
```

**Card Information:**
- Category emoji and name
- Balance: Current savings balance (€0 if not paid yet)
- Target: Target amount (if set, shows "Target: €X", else no target)
- Monthly: Amount planned this month (`amount` field)
- Progress Bar: `balance / target` if target exists, else hidden

**Item States:**
- Unpaid: Shows checkbox, appears in Upcoming section
- Paid: Checkbox checked, balance shown, contributes to savings balance

**Add/Edit Dialog Fields:**
1. Category (dropdown - only saving type categories)
2. Amount (planned contribution for this month)
3. Target (optional - if category has existing target, show it, allow editing)
4. Notes (optional)

**Target Handling:**
- When saving, if target is set, update category's target (persist across months)
- When opening add dialog for existing category, pre-fill target if exists
- One target per category (not per month)

#### Section Order:
1. Expected Incomes
2. Expected Invoices
3. Budgets
4. **Savings** (NEW)
5. (existing sections continue...)

---

### 2. Transactions Tab

#### New Savings Section

**Placement:** Between "Upcoming" and "Incomes" sections

**Header:**
```
--- SAVINGS (tap to collapse/expand) ---
```

**Content:**
- Shows only Savings items marked as paid for current month
- Same card style as Upcoming items
- Shows: Name, Category, Amount, Status badge

**Transactions Using Savings:**
- Appear in "Incomes" or "Expenses" sections (not in Savings section)
- Display with badge/indicator showing savings usage
- Tap to see breakdown

#### Transaction Display Enhancement

**For transactions using savings:**

**Fully Covered by Savings:**
```
┌─────────────────────────────────────┐
│ Car Insurance Payment               │
│ MMM dd - [Category Badge]           │
│                                      │
│ €0.00                                │ [Edit] [Delete]
│ 💰 €150 from Car Insurance savings   │
└─────────────────────────────────────┘
```

**Partially Covered:**
```
┌─────────────────────────────────────┐
│ Car Service Payment                  │
│ MMM dd - [Category Badge]           │
│                                      │
│ €50.00                               │ [Edit] [Delete]
│ 💰 €200 from Car Insurance savings   │
└─────────────────────────────────────┘
```

**Implementation:**
- Main amount: Portion from income (not covered by savings)
- Badge/indicator: "💰 Savings Used" (tappable)
- Tap badge → Show breakdown dialog: "€X from [Category] savings, €Y from income"

**No Savings Used:**
- Display normally (no changes)

---

### 3. Expected Invoice Enhancement

#### Add/Edit Dialog

**New Field: "Use Savings" (optional)**

**Position:** After Category field, before Amount field

**UI:**
```
Use Savings: [Dropdown: None ▼]
             Options:
             - None (default)
             - Car Insurance (€150)
             - Car Service (€80)
             - [Other categories with balance > 0]
```

**Behavior:**
- Default: None
- Dropdown shows: "Category Name (€Balance)" format
- Only shows categories with balance > 0
- When selected: Shows amount available

**When Invoice Marked as Paid:**
- If "Use Savings" selected:
  - Calculate: `savings_amount_used = min(transaction_amount, savings_balance)`
  - Create transaction with:
    - `amount: -invoice_amount` (full amount)
    - `uses_savings_category: selected_category`
    - `savings_amount_used: calculated_amount`
  - Reduce savings balance
- If "Use Savings" is None:
  - Create transaction normally (no savings used)

---

### 4. Transaction Dialog Enhancement

**New Field: "Use Savings" (optional)**

**Position:** After Category field, before Amount field

**UI:** Same as Expected Invoice enhancement

**When Saving Transaction:**
- If "Use Savings" selected:
  - Calculate savings portion and income portion
  - Store in transaction record
  - Reduce savings balance
  - Display with savings indicator

---

### 5. Reports Tab

#### New Layout

**Current:** Single section showing category spending

**New:** Two sections

```
--- SPENDINGS REPORT ---
[Existing category spending cards]

--- SAVINGS TRACKING ---
[Savings categories with balance > 0]
[Collapsed: Categories with balance = 0]
```

#### Savings Tracking Section

**Active Savings (Balance > 0):**
- Shows all savings categories with balance > 0
- Card displays:
  - Category emoji, name
  - Balance: €X
  - Target: €Y (if set)
  - Progress: X% (if target exists)
  - Monthly contributions this month
  - Payments using savings this month

**Inactive Savings (Balance = 0):**
- Collapsed by default
- Expandable section
- Shows categories that have been used but have no balance
- Or categories that were added but never contributed to
- Shows: Category name, "Balance: €0"

**Sorting:**
- Active: Sort by balance (descending)
- Inactive: Sort by category name

---

## User Flows

### Flow 1: Setting Up Monthly Savings

1. Navigate to Home tab
2. Tap "+ Add Savings"
3. Select category (e.g., "Car Insurance")
4. Enter amount: €138
5. Set target (optional): €414 (if not already set)
6. Add notes (optional)
7. Save
8. Item appears in Savings section
9. "Remaining to assign" decreases by €138
10. Item appears in Upcoming section (Transactions tab)

### Flow 2: Contributing to Savings

1. Navigate to Home tab
2. Find Savings item: "Car Insurance €138"
3. Tap checkbox to mark as paid
4. Transaction created: -€138 (source_type: 'savings')
5. "In Bank" decreases by €138
6. Savings balance for "Car Insurance" increases by €138
7. Item shows balance: "Balance: €138"
8. Item appears in Savings section (Transactions tab)

### Flow 3: Using Savings for Expense

**Option A: From Expected Invoice**

1. Add Expected Invoice: "Car Insurance €414"
2. In dialog, select "Use Savings: Car Insurance (€138)"
3. Save invoice
4. Mark invoice as paid
5. Transaction created: -€414
   - `uses_savings_category: "Car Insurance"`
   - `savings_amount_used: 138`
6. "In Bank" decreases by €276 (414 - 138)
7. Savings balance decreases from €138 to €0
8. Transaction shows: "€276.00" with "💰 €138 from Car Insurance savings"

**Option B: From Manual Transaction**

1. Navigate to Transactions tab
2. Tap "+" to add transaction
3. Select category: "Car Insurance"
4. Enter amount: €414
5. Select "Use Savings: Car Insurance (€138)"
6. Save
7. Transaction created with savings usage
8. Same logic as Option A

### Flow 4: Viewing Savings Progress

1. Navigate to Reports tab
2. Scroll to "Savings Tracking" section
3. View active savings (balance > 0):
   - See all categories with current balance
   - See progress toward target
   - See monthly activity
4. Expand "Inactive Savings" to see categories with €0 balance

---

## Data Access Layer

### New Functions in `lib/database.ts`

```typescript
// Load expected savings for a month
export async function loadSavings(month?: string): Promise<ExpectedSavings[]>

// Save expected savings item
export async function saveSavings(savings: ExpectedSavings): Promise<boolean>

// Delete expected savings item
export async function deleteSavings(id: string): Promise<boolean>

// Calculate savings balance for a category
export async function getSavingsBalance(category: string): Promise<number>

// Get all savings categories with balance > 0
export async function getActiveSavingsCategories(): Promise<Array<{category: string, balance: number, target?: number}>>
```

### Enhanced Transaction Functions

```typescript
// When saving transaction with savings usage:
// - Calculate savings_amount_used
// - Reduce savings balance
// - Store both in transaction record
```

---

## Type Definitions

### New Types in `lib/types.ts`

```typescript
export interface ExpectedSavings {
  id: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM
  target?: number; // Optional target amount (persists across months)
  is_paid: boolean;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// Enhanced Transaction
export interface Transaction {
  // ... existing fields ...
  uses_savings_category?: string; // Category name if using savings
  savings_amount_used?: number; // Amount used from savings balance
}

// Enhanced Category
export interface Category {
  // ... existing fields ...
  type: 'income' | 'expense' | 'saving'; // NEW: third type
}
```

---

## UI Components

### New Components Needed

1. **SavingsCard** (similar to BudgetCard)
   - Shows category, balance, target, monthly amount
   - Progress bar if target exists
   - Edit/Delete actions

2. **SavingsBalanceIndicator**
   - Badge showing savings usage in transactions
   - Tappable for breakdown dialog

3. **SavingsDropdown**
   - Dropdown for selecting savings category
   - Shows balance in format: "Category (€X)"
   - Only shows categories with balance > 0

### Enhanced Components

1. **TransactionItem** (in Transactions tab)
   - Show savings indicator if transaction uses savings
   - Tap indicator for breakdown

2. **CashOverview** (in Home tab)
   - Two-row layout
   - Add "Savings Balances" item

---

## Edge Cases & Validation

### 1. Savings Balance Going Negative

**Rule:** Balance caps at 0, never goes negative

**Implementation:**
```typescript
const newBalance = Math.max(0, currentBalance - savingsAmountUsed);
```

**UI:** If transaction amount > available balance:
- Use full available balance
- Remaining comes from income (reduces "In Bank")

### 2. Target Persistence

**Rule:** One target per category, persists across months

**Implementation:**
- When saving Savings item with target, store target in category metadata or separate table
- When opening add dialog, check if category has existing target
- Pre-fill target field if exists

### 3. Multiple Savings Items Same Category

**Rule:** One Savings item per category per month (like Budgets)

**Validation:** Check if category already has Savings item for current month before saving

### 4. Category Type Migration

**Rule:** Categories can be type 'income', 'expense', or 'saving'

**Migration:** Existing categories remain 'income' or 'expense', new saving categories created separately

### 5. Deleting Savings Category

**Rule:** If category is deleted, handle orphaned savings items and balances

**Options:**
- Prevent deletion if category has savings items
- Or: Allow deletion, mark savings items as "orphaned"

---

## Testing Scenarios

### Scenario 1: Full Savings Usage
1. Create Savings item: €100
2. Mark as paid → Balance = €100
3. Create transaction: €100, use savings
4. Verify: Balance = €0, "In Bank" unchanged, transaction shows "€0.00" with savings indicator

### Scenario 2: Partial Savings Usage
1. Create Savings item: €100
2. Mark as paid → Balance = €100
3. Create transaction: €150, use savings
4. Verify: Balance = €0, "In Bank" decreases by €50, transaction shows "€50.00" with savings indicator

### Scenario 3: Multiple Contributions
1. Create Savings item in Jan: €100, mark paid → Balance = €100
2. Create Savings item in Feb: €100, mark paid → Balance = €200
3. Create transaction in Mar: €150, use savings
4. Verify: Balance = €50, "In Bank" unchanged, transaction shows "€0.00" with savings indicator

### Scenario 4: Target Tracking
1. Create Savings item with target: €500
2. Mark paid multiple months
3. Verify: Reports shows progress toward €500 target

---

## Implementation Checklist

### Database
- [ ] Create `expected_savings` table
- [ ] Add `type: 'saving'` support to categories
- [ ] Add `uses_savings_category` and `savings_amount_used` to transactions
- [ ] Create migration scripts

### Types
- [ ] Add `ExpectedSavings` interface
- [ ] Enhance `Transaction` interface
- [ ] Enhance `Category` interface

### Database Functions
- [ ] `loadSavings(month?)`
- [ ] `saveSavings(savings)`
- [ ] `deleteSavings(id)`
- [ ] `getSavingsBalance(category)`
- [ ] `getActiveSavingsCategories()`

### Home Tab
- [ ] Update Cash Overview to two-row layout
- [ ] Add "Savings Balances" to overview
- [ ] Move "In Bank" to line 1
- [ ] Add Savings section (between Budgets and Expected Invoices)
- [ ] Create SavingsCard component
- [ ] Add Savings add/edit dialog
- [ ] Implement mark/unmark paid
- [ ] Update "Remaining to assign" calculation
- [ ] Update "In Bank" calculation

### Transactions Tab
- [ ] Add Savings section (show paid savings items)
- [ ] Enhance transaction display with savings indicator
- [ ] Add "Use Savings" field to transaction dialog
- [ ] Implement savings usage logic

### Expected Invoice Dialog
- [ ] Add "Use Savings" dropdown field
- [ ] Implement savings usage when marking as paid

### Reports Tab
- [ ] Add "Spendings Report" heading to existing section
- [ ] Add "Savings Tracking" section
- [ ] Implement active/inactive savings display
- [ ] Add progress tracking for savings with targets

### Categories Tab
- [ ] Add "saving" as third category type
- [ ] Update category creation to support saving type
- [ ] Filter categories by type in appropriate dropdowns

---

## Notes for Implementation

1. **Target Storage:** Consider storing target in a separate `category_targets` table or in category metadata
2. **Balance Calculation:** Calculate on-the-fly for accuracy, cache if needed for performance
3. **Transaction History:** All savings-related transactions remain in transaction list for audit trail
4. **UI Consistency:** Follow existing patterns (Incomes/Invoices/Budgets) for Savings section
5. **Error Handling:** Validate savings balance before allowing usage
6. **Empty States:** Add appropriate empty states for Savings section
7. **Logging:** Log all savings operations (contribution, usage, balance changes)

---

## Future Enhancements (Not in Initial Implementation)

- Monthly auto-allocation for savings (recurring contributions)
- Savings goal notifications
- Savings performance analytics
- Transfer between savings categories
- Savings interest/returns tracking

---

**End of Specification**

