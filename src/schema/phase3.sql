-- Enable RLS on all tables
-- (Note: users table already exists from Phase 2)

-- 1. JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL, -- JSearch API job_id for deduplication
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(3) DEFAULT 'USD',
  employment_type TEXT,
  remote_allowed BOOLEAN DEFAULT FALSE,
  description TEXT,
  required_skills TEXT[],
  apply_url TEXT NOT NULL,
  source TEXT DEFAULT 'jsearch',
  raw_data JSONB, -- store complete API response
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'posted'
  ai_content_generated BOOLEAN DEFAULT FALSE,
  ai_thread_primary TEXT,
  ai_thread_reply TEXT,
  ai_model_used TEXT,
  posted_to_x BOOLEAN DEFAULT FALSE,
  posted_at TIMESTAMP,
  x_tweet_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  activity_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- 4. JOB FETCH CONFIG TABLE
CREATE TABLE IF NOT EXISTS job_fetch_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  search_query TEXT NOT NULL,
  location TEXT,
  remote_only BOOLEAN DEFAULT TRUE,
  employment_types TEXT[],
  salary_min INTEGER,
  date_posted VARCHAR(20), -- 'all', 'today', 'week', 'month'
  num_results INTEGER DEFAULT 10,
  last_run_at TIMESTAMP,
  last_run_results_count INTEGER,
  last_run_new_jobs INTEGER,
  last_run_duplicates INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_job_id ON jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_to_x ON jobs(posted_to_x);

CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_settings_user_key ON settings(user_id, setting_key);

CREATE INDEX IF NOT EXISTS idx_job_fetch_config_user_id ON job_fetch_config(user_id);
CREATE INDEX IF NOT EXISTS idx_job_fetch_config_default ON job_fetch_config(is_default) WHERE is_default = TRUE;

-- RLS POLICIES
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_fetch_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated user full access
DROP POLICY IF EXISTS "Allow authenticated user full access to jobs" ON jobs;
CREATE POLICY "Allow authenticated user full access to jobs" ON jobs
  FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated user full access to activities" ON activities;
CREATE POLICY "Allow authenticated user full access to activities" ON activities
  FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated user full access to settings" ON settings;
CREATE POLICY "Allow authenticated user full access to settings" ON settings
  FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated user full access to job_fetch_config" ON job_fetch_config;
CREATE POLICY "Allow authenticated user full access to job_fetch_config" ON job_fetch_config
  FOR ALL TO authenticated USING (true);
