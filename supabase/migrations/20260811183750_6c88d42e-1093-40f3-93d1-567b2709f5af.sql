-- Novos valores de enum
ALTER TYPE public.topic_status ADD VALUE IF NOT EXISTS 'estudado';
ALTER TYPE public.topic_status ADD VALUE IF NOT EXISTS 'dominado';
ALTER TYPE public.review_rule_mode ADD VALUE IF NOT EXISTS 'hibrida';
ALTER TYPE public.study_type ADD VALUE IF NOT EXISTS 'videoaula';
ALTER TYPE public.study_type ADD VALUE IF NOT EXISTS 'leitura';
ALTER TYPE public.study_type ADD VALUE IF NOT EXISTS 'outro';

DO $$ BEGIN
  CREATE TYPE public.topic_importance AS ENUM ('alta','media','baixa');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Conteúdos (topics)
ALTER TABLE public.topics
  ADD COLUMN IF NOT EXISTS importance public.topic_importance NOT NULL DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS mastery_level integer;

CREATE INDEX IF NOT EXISTS topics_user_archived_idx ON public.topics (user_id, archived_at);
CREATE INDEX IF NOT EXISTS topics_user_area_idx ON public.topics (user_id, area_id);

-- Questões
ALTER TABLE public.question_sessions
  ADD COLUMN IF NOT EXISTS exam_board text,
  ADD COLUMN IF NOT EXISTS void_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration_minutes integer;

CREATE INDEX IF NOT EXISTS question_sessions_user_topic_idx ON public.question_sessions (user_id, topic_id);

-- Revisões
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS method text,
  ADD COLUMN IF NOT EXISTS duration_minutes integer,
  ADD COLUMN IF NOT EXISTS questions_total integer,
  ADD COLUMN IF NOT EXISTS questions_correct integer,
  ADD COLUMN IF NOT EXISTS mastery_level integer,
  ADD COLUMN IF NOT EXISTS change_origin text,
  ADD COLUMN IF NOT EXISTS previous_scheduled_for date;

CREATE INDEX IF NOT EXISTS reviews_user_topic_idx ON public.reviews (user_id, topic_id);

-- Uma única revisão pendente por conteúdo
CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_open_per_topic_idx
  ON public.reviews (user_id, topic_id)
  WHERE topic_id IS NOT NULL AND status IN ('pendente','atrasada');