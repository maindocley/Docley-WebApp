-- =============================================
-- Blog Posts Table for Docley
-- Run this in Supabase SQL Editor
-- =============================================

-- Create posts table for blog
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,  -- Stores TipTap HTML (TEXT type = unlimited length)
    cover_image TEXT,
    tags TEXT,
    published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add index for faster slug lookups
CREATE INDEX idx_posts_slug ON public.posts(slug);

-- Add index for published posts filtering
CREATE INDEX idx_posts_published ON public.posts(published);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published posts
CREATE POLICY "Anyone can read published posts"
ON public.posts FOR SELECT
USING (published = true);

-- Policy: Service role can do everything (for NestJS backend)
CREATE POLICY "Service role has full access"
ON public.posts
USING (auth.role() = 'service_role');
