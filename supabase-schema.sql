-- ============================================================
-- ALE 출석부 Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 전체 복사 후 실행
-- ============================================================

-- 1. 테이블 생성

CREATE TABLE IF NOT EXISTS programs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participants (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  program_id  UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  ended_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS attendance (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  program_id      UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('present', 'absent', 'early_leave')),
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, date)
);

CREATE TABLE IF NOT EXISTS journals (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id  UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  content     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, date)
);

-- 2. RLS (Row Level Security) 활성화

ALTER TABLE programs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance   ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals     ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책: 로그인한 사용자가 자신의 데이터만 접근

CREATE POLICY "Users manage own programs"
  ON programs FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users manage own participants"
  ON participants FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users manage own attendance"
  ON attendance FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users manage own journals"
  ON journals FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
