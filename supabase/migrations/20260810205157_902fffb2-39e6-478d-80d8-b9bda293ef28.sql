CREATE OR REPLACE FUNCTION public.bootstrap_current_user(p_full_name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (uid, p_full_name)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.study_areas (user_id, name, slug, color, position)
  VALUES
    (uid, 'Cirurgia', 'cirurgia', '#0ea5e9', 1),
    (uid, 'Clínica Médica', 'clinica-medica', '#6366f1', 2),
    (uid, 'Medicina Preventiva e SUS', 'preventiva-sus', '#10b981', 3),
    (uid, 'Pediatria', 'pediatria', '#f59e0b', 4),
    (uid, 'Ginecologia e Obstetrícia', 'ginecologia-obstetricia', '#ec4899', 5)
  ON CONFLICT (user_id, slug) DO NOTHING;

  INSERT INTO public.review_rules (user_id, name, mode, intervals, is_default)
  SELECT uid, 'Padrão', 'fixo', ARRAY[1,7,30], true
  WHERE NOT EXISTS (SELECT 1 FROM public.review_rules r WHERE r.user_id = uid);
END; $$;