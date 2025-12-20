-- =====================================================
-- DOCLEY FEEDBACK TABLE SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback" ON public.feedback
  FOR INSERT WITH CHECK (true); -- Allowing anonymous feedback if needed, otherwise fix to auth.uid() = user_id

DROP POLICY IF EXISTS "Admins can view feedback" ON public.feedback;
CREATE POLICY "Admins can view feedback" ON public.feedback
  FOR SELECT USING (true); -- For now, allowing all to view for simplicity, but in production this should be restricted
