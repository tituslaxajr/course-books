-- Shepherd's Curriculum — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS progress (
  course_id        TEXT        NOT NULL,
  session_number   INTEGER     NOT NULL,
  completed        BOOLEAN     NOT NULL DEFAULT FALSE,
  completed_at     TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (course_id, session_number)
);

CREATE TABLE IF NOT EXISTS course_notes (
  course_id  TEXT        PRIMARY KEY,
  body       TEXT        NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_reflections (
  course_id      TEXT        NOT NULL,
  session_number INTEGER     NOT NULL,
  prompt_key     TEXT        NOT NULL,
  prompt_text    TEXT        NOT NULL,
  body           TEXT        NOT NULL DEFAULT '',
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (course_id, session_number, prompt_key)
);

CREATE TABLE IF NOT EXISTS research_drafts (
  course_id      TEXT        NOT NULL,
  session_number INTEGER     NOT NULL,
  task_key       TEXT        NOT NULL,
  task_text      TEXT        NOT NULL,
  title          TEXT        NOT NULL DEFAULT '',
  body           TEXT        NOT NULL DEFAULT '',
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (course_id, session_number, task_key)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id              BIGSERIAL   PRIMARY KEY,
  course_id       TEXT        NOT NULL,
  session_number  INTEGER     NOT NULL,
  score           INTEGER     NOT NULL,
  total_questions INTEGER     NOT NULL,
  answers_json    JSONB       NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable Row Level Security on all tables (single-user personal app).
-- If you add auth later, re-enable RLS and add policies.
ALTER TABLE progress           DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_notes       DISABLE ROW LEVEL SECURITY;
ALTER TABLE reading_reflections DISABLE ROW LEVEL SECURITY;
ALTER TABLE research_drafts    DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts      DISABLE ROW LEVEL SECURITY;
