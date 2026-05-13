-- Migration: create client_sites_saas
-- Stores per-client site data for the standalone React platform.
-- generated_copy = AI-produced content (immutable after generation)
-- custom_edits   = client's manual changes (overlaid on top at render time)

CREATE TABLE IF NOT EXISTS client_sites_saas (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id    TEXT        NOT NULL UNIQUE,
  email          TEXT        NOT NULL,
  business_name  TEXT        NOT NULL DEFAULT '',
  slug           TEXT        NOT NULL UNIQUE,
  custom_domain  TEXT,
  theme          TEXT        NOT NULL DEFAULT 'professional'
    CHECK (theme IN ('professional', 'creative', 'wellness', 'luxury', 'minimalist')),
  industry       TEXT        NOT NULL DEFAULT '',
  generated_copy JSONB,
  custom_edits   JSONB       NOT NULL DEFAULT '{}',
  status         TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'inactive')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_sites_saas_slug        ON client_sites_saas (slug);
CREATE INDEX IF NOT EXISTS idx_client_sites_saas_location_id ON client_sites_saas (location_id);
CREATE INDEX IF NOT EXISTS idx_client_sites_saas_email       ON client_sites_saas (email);

-- RLS
ALTER TABLE client_sites_saas ENABLE ROW LEVEL SECURITY;

-- Public can read active sites (for the public-facing SitePage)
CREATE POLICY "public_read_active"
  ON client_sites_saas FOR SELECT
  USING (status = 'active');

-- Authenticated users can read and update their own site
CREATE POLICY "auth_read_own"
  ON client_sites_saas FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "auth_update_own"
  ON client_sites_saas FOR UPDATE
  TO authenticated
  USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');
