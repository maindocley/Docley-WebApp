-- Add subscription tracking fields for Whop Integration
ALTER TABLE public.usage 
ADD COLUMN IF NOT EXISTS whop_membership_id TEXT,
ADD COLUMN IF NOT EXISTS whop_customer_id TEXT,
ADD COLUMN IF NOT EXISTS processed_events TEXT[] DEFAULT '{}';

-- Index for faster membership lookups
CREATE INDEX IF NOT EXISTS idx_usage_whop_membership_id ON public.usage(whop_membership_id);

-- Ensure the subscription_tier defaults to 'free'
ALTER TABLE public.usage ALTER COLUMN subscription_tier SET DEFAULT 'free';
