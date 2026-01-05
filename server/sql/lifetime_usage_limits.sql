ALTER TABLE public.usage
ADD COLUMN IF NOT EXISTS ai_diagnostic_count INTEGER DEFAULT 0;

ALTER TABLE public.usage
ADD COLUMN IF NOT EXISTS ai_upgrade_count INTEGER DEFAULT 0;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

CREATE OR REPLACE FUNCTION public.consume_document(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.usage (user_id)
  VALUES (user_id_param)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.usage
  SET document_count = COALESCE(document_count, 0) + 1,
      updated_at = now()
  WHERE user_id = user_id_param
    AND COALESCE(document_count, 0) < 2
  RETURNING document_count INTO new_count;

  IF new_count IS NULL THEN
    RAISE EXCEPTION 'Document limit reached' USING ERRCODE = 'P0001';
  END IF;

  RETURN new_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_ai_diagnostic(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.usage (user_id)
  VALUES (user_id_param)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.usage
  SET ai_diagnostic_count = COALESCE(ai_diagnostic_count, 0) + 1,
      updated_at = now()
  WHERE user_id = user_id_param
    AND COALESCE(ai_diagnostic_count, 0) < 2
  RETURNING ai_diagnostic_count INTO new_count;

  IF new_count IS NULL THEN
    RAISE EXCEPTION 'AI diagnostic limit reached' USING ERRCODE = 'P0001';
  END IF;

  RETURN new_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_ai_upgrade(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.usage (user_id)
  VALUES (user_id_param)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.usage
  SET ai_upgrade_count = COALESCE(ai_upgrade_count, 0) + 1,
      updated_at = now()
  WHERE user_id = user_id_param
    AND COALESCE(ai_upgrade_count, 0) < 2
  RETURNING ai_upgrade_count INTO new_count;

  IF new_count IS NULL THEN
    RAISE EXCEPTION 'AI upgrade limit reached' USING ERRCODE = 'P0001';
  END IF;

  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_document(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_document(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_ai_diagnostic(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_diagnostic(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_ai_upgrade(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_upgrade(uuid) TO service_role;
