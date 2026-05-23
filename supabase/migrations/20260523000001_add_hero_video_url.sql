-- Add hero_video_url to client_sites_saas
-- Run in Supabase dashboard → SQL Editor, or via `supabase db push`

ALTER TABLE client_sites_saas
  ADD COLUMN IF NOT EXISTS hero_video_url TEXT;
