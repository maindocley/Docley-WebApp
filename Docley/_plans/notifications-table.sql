-- =====================================================
-- DOCLEY NOTIFICATIONS TABLE SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means all admins
  type TEXT NOT NULL CHECK (type IN ('user_signup', 'document_created', 'document_upgraded', 'document_exported', 'feedback_submitted', 'user_banned', 'user_unbanned', 'system_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB, -- Store additional data like user_id, document_id, etc.
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON public.notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (true); -- Admins can see all notifications

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Allow system to create notifications

DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
CREATE POLICY "Admins can update notifications" ON public.notifications
  FOR UPDATE USING (true); -- Admins can mark as read

-- Function to create notification on user signup
CREATE OR REPLACE FUNCTION notify_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, metadata)
  VALUES (
    'user_signup',
    'New User Signup',
    'A new user has signed up: ' || NEW.email,
    jsonb_build_object('user_id', NEW.id, 'email', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user signup
DROP TRIGGER IF EXISTS on_user_signup_notify ON auth.users;
CREATE TRIGGER on_user_signup_notify
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_signup();

-- Function to create notification on document creation
CREATE OR REPLACE FUNCTION notify_document_created()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
  
  INSERT INTO public.notifications (type, title, message, metadata)
  VALUES (
    'document_created',
    'New Document Created',
    user_email || ' created a new document: ' || NEW.title,
    jsonb_build_object('user_id', NEW.user_id, 'document_id', NEW.id, 'title', NEW.title, 'document_type', NEW.document_type)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for document creation
DROP TRIGGER IF EXISTS on_document_created_notify ON public.documents;
CREATE TRIGGER on_document_created_notify
  AFTER INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION notify_document_created();

-- Function to create notification on feedback submission
CREATE OR REPLACE FUNCTION notify_feedback_submitted()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, metadata)
  VALUES (
    'feedback_submitted',
    'New Feedback Submitted',
    'A user submitted feedback' || CASE WHEN NEW.rating IS NOT NULL THEN ' with ' || NEW.rating || ' stars' ELSE '' END,
    jsonb_build_object('feedback_id', NEW.id, 'user_id', NEW.user_id, 'rating', NEW.rating)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for feedback submission
DROP TRIGGER IF EXISTS on_feedback_submitted_notify ON public.feedback;
CREATE TRIGGER on_feedback_submitted_notify
  AFTER INSERT ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION notify_feedback_submitted();

