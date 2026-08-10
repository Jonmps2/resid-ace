-- ENUMS
CREATE TYPE public.topic_priority AS ENUM ('P1','P2','P3','P4');
CREATE TYPE public.topic_status AS ENUM ('nao_iniciado','em_andamento','concluido','revisar');
CREATE TYPE public.study_type AS ENUM ('teoria','questoes','revisao','resumo','aula','flashcards');
CREATE TYPE public.session_status AS ENUM ('planejada','em_andamento','concluida','cancelada');
CREATE TYPE public.review_status AS ENUM ('pendente','concluida','atrasada','cancelada');
CREATE TYPE public.review_result AS ENUM ('ruim','regular','bom','otimo');
CREATE TYPE public.review_rule_mode AS ENUM ('fixo','desempenho');
CREATE TYPE public.event_type AS ENUM ('estudo','revisao','simulado','descanso','outro');
CREATE TYPE public.event_status AS ENUM ('planejado','concluido','cancelado');
CREATE TYPE public.goal_period AS ENUM ('diario','semanal','mensal');
CREATE TYPE public.goal_metric AS ENUM ('horas','questoes','topicos','revisoes','acertos');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  exam_date date,
  weekly_hours_goal numeric(5,1) NOT NULL DEFAULT 25 CHECK (weekly_hours_goal >= 0),
  weekly_questions_goal integer NOT NULL DEFAULT 300 CHECK (weekly_questions_goal >= 0),
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- STUDY AREAS
CREATE TABLE public.study_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  slug text NOT NULL,
  color text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);
CREATE INDEX study_areas_user_idx ON public.study_areas(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_areas TO authenticated;
GRANT ALL ON public.study_areas TO service_role;
ALTER TABLE public.study_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "study_areas_select_own" ON public.study_areas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "study_areas_insert_own" ON public.study_areas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_areas_update_own" ON public.study_areas FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_areas_delete_own" ON public.study_areas FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER study_areas_updated_at BEFORE UPDATE ON public.study_areas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SUBJECTS
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id uuid NOT NULL REFERENCES public.study_areas(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  description text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (area_id, name)
);
CREATE INDEX subjects_user_idx ON public.subjects(user_id);
CREATE INDEX subjects_area_idx ON public.subjects(area_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subjects_select_own" ON public.subjects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "subjects_insert_own" ON public.subjects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subjects_update_own" ON public.subjects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subjects_delete_own" ON public.subjects FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TOPICS
CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  area_id uuid REFERENCES public.study_areas(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (length(btrim(title)) > 0),
  description text,
  priority public.topic_priority NOT NULL DEFAULT 'P2',
  status public.topic_status NOT NULL DEFAULT 'nao_iniciado',
  estimated_minutes integer CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0),
  planned_date date,
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX topics_user_idx ON public.topics(user_id);
CREATE INDEX topics_area_idx ON public.topics(area_id);
CREATE INDEX topics_subject_idx ON public.topics(subject_id);
CREATE INDEX topics_planned_date_idx ON public.topics(user_id, planned_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topics TO authenticated;
GRANT ALL ON public.topics TO service_role;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics_select_own" ON public.topics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "topics_insert_own" ON public.topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "topics_update_own" ON public.topics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "topics_delete_own" ON public.topics FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- STUDY SESSIONS
CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  area_id uuid REFERENCES public.study_areas(id) ON DELETE SET NULL,
  title text,
  started_at timestamptz NOT NULL DEFAULT now(),
  net_minutes integer NOT NULL DEFAULT 0 CHECK (net_minutes >= 0),
  study_type public.study_type NOT NULL DEFAULT 'teoria',
  notes text,
  status public.session_status NOT NULL DEFAULT 'concluida',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX study_sessions_user_started_idx ON public.study_sessions(user_id, started_at DESC);
CREATE INDEX study_sessions_topic_idx ON public.study_sessions(topic_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions TO authenticated;
GRANT ALL ON public.study_sessions TO service_role;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "study_sessions_select_own" ON public.study_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "study_sessions_insert_own" ON public.study_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_sessions_update_own" ON public.study_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_sessions_delete_own" ON public.study_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER study_sessions_updated_at BEFORE UPDATE ON public.study_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- QUESTION SESSIONS
CREATE TABLE public.question_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  area_id uuid REFERENCES public.study_areas(id) ON DELETE SET NULL,
  title text,
  source text,
  total_questions integer NOT NULL CHECK (total_questions > 0),
  correct_count integer NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  wrong_count integer GENERATED ALWAYS AS (total_questions - correct_count) STORED,
  accuracy numeric(5,2) GENERATED ALWAYS AS (round((correct_count::numeric * 100) / NULLIF(total_questions,0), 2)) STORED,
  performed_at date NOT NULL DEFAULT current_date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT question_sessions_correct_lte_total CHECK (correct_count <= total_questions)
);
CREATE INDEX question_sessions_user_date_idx ON public.question_sessions(user_id, performed_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_sessions TO authenticated;
GRANT ALL ON public.question_sessions TO service_role;
ALTER TABLE public.question_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "question_sessions_select_own" ON public.question_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "question_sessions_insert_own" ON public.question_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "question_sessions_update_own" ON public.question_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "question_sessions_delete_own" ON public.question_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER question_sessions_updated_at BEFORE UPDATE ON public.question_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- REVIEW RULES
CREATE TABLE public.review_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Padrão',
  mode public.review_rule_mode NOT NULL DEFAULT 'fixo',
  intervals integer[] NOT NULL DEFAULT ARRAY[1,7,30],
  performance_bands jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX review_rules_user_idx ON public.review_rules(user_id);
CREATE UNIQUE INDEX review_rules_one_default_idx ON public.review_rules(user_id) WHERE is_default;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_rules TO authenticated;
GRANT ALL ON public.review_rules TO service_role;
ALTER TABLE public.review_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review_rules_select_own" ON public.review_rules FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "review_rules_insert_own" ON public.review_rules FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "review_rules_update_own" ON public.review_rules FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "review_rules_delete_own" ON public.review_rules FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER review_rules_updated_at BEFORE UPDATE ON public.review_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES public.review_rules(id) ON DELETE SET NULL,
  title text,
  review_number integer NOT NULL DEFAULT 1 CHECK (review_number > 0),
  scheduled_for date NOT NULL,
  completed_at timestamptz,
  result public.review_result,
  status public.review_status NOT NULL DEFAULT 'pendente',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reviews_user_sched_idx ON public.reviews(user_id, scheduled_for);
CREATE INDEX reviews_topic_idx ON public.reviews(topic_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_own" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PLANNER EVENTS
CREATE TABLE public.planner_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  review_id uuid REFERENCES public.reviews(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (length(btrim(title)) > 0),
  event_type public.event_type NOT NULL DEFAULT 'estudo',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  status public.event_status NOT NULL DEFAULT 'planejado',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT planner_events_time_order CHECK (ends_at IS NULL OR ends_at >= starts_at)
);
CREATE INDEX planner_events_user_start_idx ON public.planner_events(user_id, starts_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planner_events TO authenticated;
GRANT ALL ON public.planner_events TO service_role;
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "planner_events_select_own" ON public.planner_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "planner_events_insert_own" ON public.planner_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "planner_events_update_own" ON public.planner_events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "planner_events_delete_own" ON public.planner_events FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER planner_events_updated_at BEFORE UPDATE ON public.planner_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- GOALS
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id uuid REFERENCES public.study_areas(id) ON DELETE SET NULL,
  title text,
  period public.goal_period NOT NULL DEFAULT 'semanal',
  metric public.goal_metric NOT NULL DEFAULT 'horas',
  target_value numeric(10,2) NOT NULL CHECK (target_value > 0),
  current_value numeric(10,2) NOT NULL DEFAULT 0 CHECK (current_value >= 0),
  starts_on date NOT NULL DEFAULT current_date,
  ends_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT goals_period_order CHECK (ends_on IS NULL OR ends_on >= starts_on)
);
CREATE INDEX goals_user_idx ON public.goals(user_id, period);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_select_own" ON public.goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "goals_insert_own" ON public.goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update_own" ON public.goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_delete_own" ON public.goals FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BOOTSTRAP: profile + 5 áreas (idempotente)
CREATE OR REPLACE FUNCTION public.bootstrap_current_user(p_full_name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

REVOKE ALL ON FUNCTION public.bootstrap_current_user(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_current_user(text) TO authenticated;