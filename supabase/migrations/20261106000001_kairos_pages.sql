-- Kairos Award, Phase 1: module pages + locked award levels.
--
-- Applied by hand to the shared project (tlkgnmmnurixfedlogpm) on 2026-11-06.
-- This file is the record. Never run `supabase db push` on this project.
--
-- 1. kairos_pages: one page per client site per module (1 = Our Story,
--    2 = Our Work, 3 = Community). Sections are JSON, same shape as the
--    tpms-demo landing-page builder.
-- 2. Access: the public reads only published pages of active sites whose
--    module is unlocked. Only the site owner or a platform admin can read
--    drafts or write, and only for unlocked modules.
-- 3. Award levels (bonus_page_allocation, kairos_award_saved_tier) can no
--    longer be changed by a signed-in client. Before this, the
--    client_sites_saas update policy let owners change any column on their
--    own row, including their own Kairos level.

create table if not exists public.kairos_pages (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.client_sites_saas(id) on delete cascade,
  module_slot smallint not null check (module_slot between 1 and 3),
  title       text not null default '',
  menu_label  text not null default '',
  sections    jsonb not null default '[]'::jsonb,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (site_id, module_slot)
);

alter table public.kairos_pages enable row level security;

-- Owner (site email matches the signed-in email) or platform admin.
create or replace function public.can_manage_site(p_site_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from client_sites_saas s
    where s.id = p_site_id
      and (lower(s.email) = lower(auth.jwt() ->> 'email') or is_platform_admin())
  );
$$;

-- Module is unlocked when the site's award level reaches its slot.
create or replace function public.kairos_module_unlocked(p_site_id uuid, p_slot smallint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from client_sites_saas s
    where s.id = p_site_id and s.bonus_page_allocation >= p_slot
  );
$$;

-- Published page, active site, unlocked module.
create or replace function public.kairos_page_is_public(p_site_id uuid, p_slot smallint, p_published boolean) returns boolean
language sql stable security definer set search_path = public as $$
  select p_published and exists (
    select 1 from client_sites_saas s
    where s.id = p_site_id and s.status = 'active' and s.bonus_page_allocation >= p_slot
  );
$$;

create policy "Public can read published kairos pages"
  on public.kairos_pages for select to anon, authenticated
  using (kairos_page_is_public(site_id, module_slot, published));

create policy "Owners and admins can read their kairos pages"
  on public.kairos_pages for select to authenticated
  using (can_manage_site(site_id));

create policy "Owners and admins can add kairos pages"
  on public.kairos_pages for insert to authenticated
  with check (can_manage_site(site_id) and kairos_module_unlocked(site_id, module_slot));

create policy "Owners and admins can edit kairos pages"
  on public.kairos_pages for update to authenticated
  using (can_manage_site(site_id))
  with check (can_manage_site(site_id) and kairos_module_unlocked(site_id, module_slot));

create policy "Owners and admins can delete kairos pages"
  on public.kairos_pages for delete to authenticated
  using (can_manage_site(site_id));

create or replace function public.kairos_pages_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger kairos_pages_touch
  before update on public.kairos_pages
  for each row execute function public.kairos_pages_touch();

-- Lock award levels: a signed-in client can't change them. Platform admins,
-- server functions (service role) and direct SQL still can.
create or replace function public.protect_kairos_award_columns() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'authenticated'
     and not is_platform_admin()
     and (new.bonus_page_allocation is distinct from old.bonus_page_allocation
          or new.kairos_award_saved_tier is distinct from old.kairos_award_saved_tier) then
    raise exception 'Only mytCreative can change a Kairos Award level';
  end if;
  return new;
end;
$$;

create trigger protect_kairos_award_columns
  before update on public.client_sites_saas
  for each row execute function public.protect_kairos_award_columns();
