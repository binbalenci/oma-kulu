-- Migration: Add Savings Feature Support
-- Date: 2025-01-XX
-- Description: Adds expected_savings table, enhances categories and transactions for savings functionality

-- ============================================================================
-- 1. Create expected_savings table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.expected_savings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category text NOT NULL,
  amount numeric NOT NULL,
  month text NOT NULL,
  target numeric,
  is_paid boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT expected_savings_pkey PRIMARY KEY (id),
  CONSTRAINT fk_expected_savings_category FOREIGN KEY (category) REFERENCES public.categories(name)
);

-- ============================================================================
-- 2. Update categories.type CHECK constraint to include 'saving'
-- ============================================================================
-- Drop the existing constraint
ALTER TABLE public.categories
  DROP CONSTRAINT IF EXISTS categories_type_check;

-- Add the new constraint with 'saving' included
ALTER TABLE public.categories
  ADD CONSTRAINT categories_type_check 
  CHECK (type = ANY (ARRAY['income'::text, 'expense'::text, 'saving'::text]));

-- ============================================================================
-- 3. Update transactions.source_type CHECK constraint to include 'savings'
-- ============================================================================
-- Drop the existing constraint (if it exists as a named constraint)
-- Note: The constraint may be unnamed, so we'll add one if needed
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_source_type_check'
  ) THEN
    ALTER TABLE public.transactions 
      DROP CONSTRAINT transactions_source_type_check;
  END IF;
END $$;

-- Add the new constraint with 'savings' included
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_source_type_check 
  CHECK (source_type IS NULL OR (source_type = ANY (ARRAY['income'::text, 'invoice'::text, 'savings'::text])));

-- ============================================================================
-- 4. Add savings-related columns to transactions table
-- ============================================================================
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS uses_savings_category text,
  ADD COLUMN IF NOT EXISTS savings_amount_used numeric;

-- Add foreign key constraint for uses_savings_category
ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS fk_transactions_uses_savings_category;

ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transactions_uses_savings_category 
  FOREIGN KEY (uses_savings_category) REFERENCES public.categories(name);

-- ============================================================================
-- 5. Create indexes for better query performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_expected_savings_month ON public.expected_savings(month);
CREATE INDEX IF NOT EXISTS idx_expected_savings_category ON public.expected_savings(category);
CREATE INDEX IF NOT EXISTS idx_transactions_uses_savings_category ON public.transactions(uses_savings_category);

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Summary of changes:
-- 1. Created expected_savings table for monthly savings contributions
-- 2. Updated categories.type to support 'saving' type
-- 3. Updated transactions.source_type to support 'savings' source
-- 4. Added uses_savings_category and savings_amount_used columns to transactions
-- 5. Created indexes for better query performance

