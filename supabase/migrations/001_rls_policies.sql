-- NeTrix RLS Policies
-- Each table gets row-level security policies matching the permission scopes
-- defined in apps/web/src/server/permissions/index.ts

-- ============================================================================
-- users
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Everyone can read their own user row
CREATE POLICY users_read_own ON users
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Campus-visible users are readable by any authenticated user
CREATE POLICY users_read_campus ON users
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM academic_profiles
    WHERE academic_profiles.user_id = users.id
    AND academic_profiles.visibility = 'campus'
  ));

-- ============================================================================
-- academic_profiles
-- ============================================================================
ALTER TABLE academic_profiles ENABLE ROW LEVEL SECURITY;

-- User can read their own profile
CREATE POLICY academic_profiles_read_own ON academic_profiles
  FOR SELECT
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = academic_profiles.user_id
  ));

-- Campus-visible profiles are readable by any authenticated user
CREATE POLICY academic_profiles_read_campus ON academic_profiles
  FOR SELECT
  USING (visibility = 'campus');

-- User can write their own profile
CREATE POLICY academic_profiles_write_own ON academic_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = academic_profiles.user_id
  ));

CREATE POLICY academic_profiles_update_own ON academic_profiles
  FOR UPDATE
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = academic_profiles.user_id
  ));

-- ============================================================================
-- academic_portraits
-- ============================================================================
ALTER TABLE academic_portraits ENABLE ROW LEVEL SECURITY;

CREATE POLICY academic_portraits_read_own ON academic_portraits
  FOR SELECT
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = academic_portraits.user_id
  ));

CREATE POLICY academic_portraits_write_own ON academic_portraits
  FOR INSERT
  WITH CHECK (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = academic_portraits.user_id
  ));

CREATE POLICY academic_portraits_update_own ON academic_portraits
  FOR UPDATE
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = academic_portraits.user_id
  ));

-- ============================================================================
-- posts
-- ============================================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY posts_read_published_campus ON posts
  FOR SELECT
  USING (status = 'published' AND visibility = 'campus');

CREATE POLICY posts_read_own ON posts
  FOR SELECT
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = posts.author_id
  ));

CREATE POLICY posts_create_own ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = posts.author_id
  ));

CREATE POLICY posts_update_own ON posts
  FOR UPDATE
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = posts.author_id
  ));

-- ============================================================================
-- resource_items
-- ============================================================================
ALTER TABLE resource_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY resource_items_read_all ON resource_items
  FOR SELECT
  USING (curation_status IN ('seeded', 'featured'));

-- ============================================================================
-- recommendations
-- ============================================================================
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY recommendations_read_own ON recommendations
  FOR SELECT
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = recommendations.recipient_user_id
  ));

CREATE POLICY recommendations_write_own ON recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = recommendations.recipient_user_id
  ));

CREATE POLICY recommendations_update_own ON recommendations
  FOR UPDATE
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = recommendations.recipient_user_id
  ));

-- ============================================================================
-- connection_requests
-- ============================================================================
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY connection_requests_read_involved ON connection_requests
  FOR SELECT
  USING (
    auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = connection_requests.requester_id)
    OR
    auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = connection_requests.recipient_id)
  );

CREATE POLICY connection_requests_create_own ON connection_requests
  FOR INSERT
  WITH CHECK (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = connection_requests.requester_id
  ));

CREATE POLICY connection_requests_update_recipient ON connection_requests
  FOR UPDATE
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = connection_requests.recipient_id
  ));

-- ============================================================================
-- connections
-- ============================================================================
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY connections_read_involved ON connections
  FOR SELECT
  USING (
    auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = connections.user_a_id)
    OR
    auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = connections.user_b_id)
  );

-- ============================================================================
-- message_threads
-- ============================================================================
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY message_threads_read_participant ON message_threads
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM connections
    WHERE connections.id = message_threads.connection_id
    AND (
      auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = connections.user_a_id)
      OR
      auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = connections.user_b_id)
    )
  ));

-- ============================================================================
-- messages
-- ============================================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_read_thread_participant ON messages
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM message_threads
    JOIN connections ON connections.id = message_threads.connection_id
    WHERE message_threads.id = messages.thread_id
    AND (
      auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = connections.user_a_id)
      OR
      auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = connections.user_b_id)
    )
  ));

CREATE POLICY messages_create_own ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = messages.sender_id
  ));

-- ============================================================================
-- ai_jobs
-- ============================================================================
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_jobs_read_own ON ai_jobs
  FOR SELECT
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = ai_jobs.created_by
  ));

CREATE POLICY ai_jobs_write_own ON ai_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = ai_jobs.created_by
  ));

CREATE POLICY ai_jobs_update_own ON ai_jobs
  FOR UPDATE
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = ai_jobs.created_by
  ));

-- ============================================================================
-- event_logs
-- ============================================================================
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_logs_read_own ON event_logs
  FOR SELECT
  USING (auth.uid() = (
    SELECT auth_user_id FROM users WHERE users.id = event_logs.actor_id
  ));

CREATE POLICY event_logs_create_own ON event_logs
  FOR INSERT
  WITH CHECK (
    actor_id IS NULL
    OR
    auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = event_logs.actor_id)
  );
