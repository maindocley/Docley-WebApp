-- =====================================================
-- FIX RLS POLICY FOR DOCUMENT DELETION
-- Run this in your Supabase SQL Editor
-- =====================================================

-- The problem: The existing UPDATE policy likely enforces "deleted_at IS NULL" 
-- for both the current row and the resulting row. When we try to set
-- "deleted_at" to a timestamp (soft-delete), it violates this check.

-- Drop the old overly-restrictive update policy
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;

-- Create a new update policy that only checks for ownership
-- This allows setting deleted_at (soft-delete) without a 403 error.
CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Explicitly ensure the SELECT policy is also correct for soft-deleted rows
-- This policy ensures users only see non-deleted rows by default.
-- (This should already be correct, but we're re-applying it for safety)
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
