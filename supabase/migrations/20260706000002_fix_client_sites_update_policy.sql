-- SECURITY FIX: remove permissive update policy on client_sites_saas.
--
-- The live database had `auth_update_any` (UPDATE, authenticated, USING true)
-- which let ANY logged-in user edit ANY client site. This restores per-owner
-- updates and adds a platform_admins allowlist for super-admin access.
--
-- Applied to the linked project manually on 2026-07-06 via `supabase db query`
-- (matching how prior migrations were applied); kept here for the record.

CREATE TABLE IF NOT EXISTS platform_admins (
  email      TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No policies on purpose: service role + SECURITY DEFINER fn only.
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_platform_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM platform_admins WHERE lower(email) = lower(auth.jwt() ->> 'email')) $$;

DROP POLICY IF EXISTS "auth_update_any" ON client_sites_saas;
DROP POLICY IF EXISTS "auth_update_own" ON client_sites_saas;
CREATE POLICY "auth_update_own"
  ON client_sites_saas FOR UPDATE
  TO authenticated
  USING     (lower(email) = lower(auth.jwt() ->> 'email') OR is_platform_admin())
  WITH CHECK (lower(email) = lower(auth.jwt() ->> 'email') OR is_platform_admin());

-- Platform admins can read every site (incl. non-active) in admin tooling.
DROP POLICY IF EXISTS "auth_read_admin" ON client_sites_saas;
CREATE POLICY "auth_read_admin"
  ON client_sites_saas FOR SELECT
  TO authenticated
  USING (is_platform_admin());
