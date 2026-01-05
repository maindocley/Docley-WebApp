CREATE OR REPLACE FUNCTION public.increment_usage(user_id_param uuid)
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
  RETURNING document_count INTO new_count;

  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid) TO service_role;
