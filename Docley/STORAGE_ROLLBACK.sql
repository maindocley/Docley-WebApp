-- =====================================================
-- STORAGE ROLLBACK: MOVE TO DATABASE
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add missing columns to documents table
-- This will store the Base64 representation of documents and layout settings
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS file_content TEXT,
ADD COLUMN IF NOT EXISTS margins JSONB DEFAULT '{"top": 96, "bottom": 96, "left": 96, "right": 96}'::jsonb,
ADD COLUMN IF NOT EXISTS header_text TEXT DEFAULT '';

-- 2. Optional: Clean up storage artifacts if not needed (manual step recommended)
-- TRUNCATE storage.objects CASCADE; -- WARNING: Destructive
