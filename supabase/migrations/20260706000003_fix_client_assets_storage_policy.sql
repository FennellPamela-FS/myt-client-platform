-- SECURITY FIX: client-assets storage bucket had no owner check.
--
-- "Authenticated users can upload/update client-assets" allowed ANY logged-in
-- user to INSERT or UPDATE any object in the bucket, regardless of path —
-- i.e. any client could overwrite another client's logo/hero/about/gallery
-- images (paths are `<category>/<site.id>[_<slot>].<ext>`, uuid embedded in
-- the filename, not a folder segment storage RLS can key off directly).
--
-- Applied to the linked project manually on 2026-07-06 via `supabase db
-- query` (matching how prior migrations were applied); kept here for record.

CREATE OR REPLACE FUNCTION owns_client_asset(object_name text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM client_sites_saas s
    WHERE s.id::text = substring(object_name from '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})')
      AND (lower(s.email) = lower(auth.jwt() ->> 'email') OR is_platform_admin())
  );
$$;

DROP POLICY IF EXISTS "Authenticated users can upload to client-assets" ON storage.objects;
CREATE POLICY "Owners can upload to client-assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-assets' AND owns_client_asset(name));

DROP POLICY IF EXISTS "Authenticated users can update client-assets" ON storage.objects;
CREATE POLICY "Owners can update client-assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING     (bucket_id = 'client-assets' AND owns_client_asset(name))
  WITH CHECK (bucket_id = 'client-assets' AND owns_client_asset(name));

-- Public read is unchanged ("Public can read client-assets") — required so
-- live client sites can render these images without authentication.
