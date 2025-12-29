-- =====================================================
-- FIX SHARING RLS POLICIES
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Ensure document_shares table exists (if not created before)
CREATE TABLE IF NOT EXISTS public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('read', 'write')),
  shared_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- 2. Enable RLS on document_shares
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- 3. Policies for document_shares
DROP POLICY IF EXISTS "Users can view shares for own documents" ON public.document_shares;
CREATE POLICY "Users can view shares for own documents" ON public.document_shares
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.documents WHERE id = document_id
    ) OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Owners can manage shares" ON public.document_shares;
CREATE POLICY "Owners can manage shares" ON public.document_shares
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.documents WHERE id = document_id
    )
  );

-- 4. FIX DOCUMENT SELECT POLICY
-- Drop the old owner-only policy
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;

-- Create a new policy that allows owners AND collaborators
CREATE POLICY "Users can view owned or shared documents" ON public.documents
  FOR SELECT USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.document_shares 
      WHERE document_id = public.documents.id 
      AND user_id = auth.uid()
    )
  );

-- 5. FIX DOCUMENT UPDATE POLICY (allow collaborators with 'write' permission)
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
CREATE POLICY "Users can update owned or shared documents" ON public.documents
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.document_shares 
      WHERE document_id = public.documents.id 
      AND user_id = auth.uid()
      AND permission = 'write'
    )
  );
