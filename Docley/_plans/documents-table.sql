-- =====================================================
-- DOCLEY DOCUMENTS TABLE SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  upgraded_content TEXT,
  content_html TEXT,
  academic_level TEXT NOT NULL DEFAULT 'undergraduate' CHECK (academic_level IN ('undergraduate', 'postgraduate', 'masters', 'phd')),
  citation_style TEXT NOT NULL DEFAULT 'APA 7th Edition' CHECK (citation_style IN ('APA 7th Edition', 'MLA 9th Edition', 'Harvard', 'Chicago')),
  document_type TEXT NOT NULL DEFAULT 'Essay' CHECK (document_type IN ('Essay', 'Research Paper', 'Thesis', 'Case Study', 'Report')),
  word_count INTEGER DEFAULT 0,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'diagnosed', 'upgraded', 'exported')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON public.documents(deleted_at) WHERE deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

-- RLS Policies
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate word count
CREATE OR REPLACE FUNCTION calculate_word_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple word count: split by whitespace
  NEW.word_count = array_length(regexp_split_to_array(COALESCE(NEW.content, ''), '\s+'), 1);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-calculating word count
DROP TRIGGER IF EXISTS calculate_documents_word_count ON public.documents;
CREATE TRIGGER calculate_documents_word_count
  BEFORE INSERT OR UPDATE OF content ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION calculate_word_count();
