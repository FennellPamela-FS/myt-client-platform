/**
 * Kairos Award — premium module pages.
 *
 * Each unlocked module is one extra page on the client's site, built from
 * sections (same idea as the tpms-demo landing-page builder). Pages live in
 * `kairos_pages`; database rules make sure only the site owner or a platform
 * admin can edit them, and visitors only see published pages of unlocked
 * modules. See supabase/migrations/20261106000001_kairos_pages.sql.
 */
import { supabase } from './supabase';
import { isPlatformHost } from './hosts';
import type { SiteBranding } from '../types/database';

// ─── Sections ────────────────────────────────────────────────────────────────

export type KairosPhoto = { url: string; caption: string };
export type KairosStat = { value: string; label: string };

export type KairosSection =
  | { id: string; type: 'hero'; headline: string; subheadline: string; imageUrl: string }
  | { id: string; type: 'text'; heading: string; body: string }
  | { id: string; type: 'image_text'; heading: string; body: string; imageUrl: string; imageAlt: string; imagePosition: 'left' | 'right' }
  | { id: string; type: 'photo_gallery'; heading: string; photos: KairosPhoto[] }
  | { id: string; type: 'stats'; heading: string; items: KairosStat[] }
  | { id: string; type: 'video'; heading: string; url: string; caption: string }
  | { id: string; type: 'cta_banner'; heading: string; body: string; buttonText: string; buttonUrl: string };

export type KairosSectionType = KairosSection['type'];

export const SECTION_META: { type: KairosSectionType; label: string; description: string }[] = [
  { type: 'hero',          label: 'Banner',        description: 'Large headline at the top, with an optional background photo' },
  { type: 'text',          label: 'Text',          description: 'A heading and paragraphs' },
  { type: 'image_text',    label: 'Photo + Text',  description: 'A photo beside a heading and paragraphs' },
  { type: 'photo_gallery', label: 'Photo Gallery', description: 'Up to 8 photos in a grid' },
  { type: 'stats',         label: 'Numbers',       description: '2 to 4 numbers with short labels' },
  { type: 'video',         label: 'Video',         description: 'A YouTube or Vimeo video' },
  { type: 'cta_banner',    label: 'Invitation',    description: 'A closing invitation with a button' },
];

export function sectionLabel(type: KairosSectionType): string {
  return SECTION_META.find(m => m.type === type)?.label ?? type;
}

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function newSection(type: KairosSectionType): KairosSection {
  const id = newId();
  switch (type) {
    case 'hero':          return { id, type, headline: '', subheadline: '', imageUrl: '' };
    case 'text':          return { id, type, heading: '', body: '' };
    case 'image_text':    return { id, type, heading: '', body: '', imageUrl: '', imageAlt: '', imagePosition: 'left' };
    case 'photo_gallery': return { id, type, heading: '', photos: [{ url: '', caption: '' }, { url: '', caption: '' }, { url: '', caption: '' }] };
    case 'stats':         return { id, type, heading: '', items: [{ value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }] };
    case 'video':         return { id, type, heading: '', url: '', caption: '' };
    case 'cta_banner':    return { id, type, heading: '', body: '', buttonText: 'Get in touch', buttonUrl: '#contact' };
  }
}

// ─── Modules ─────────────────────────────────────────────────────────────────

export type KairosModule = { slot: 1 | 2 | 3; path: string; title: string; menuLabel: string };

export const KAIROS_MODULES: KairosModule[] = [
  { slot: 1, path: 'our-story', title: 'Our Story', menuLabel: 'Our Story' },
  { slot: 2, path: 'our-work',  title: 'Our Work',  menuLabel: 'Our Work' },
  { slot: 3, path: 'community', title: 'Community', menuLabel: 'Community' },
];

/** Modules whose pages are built. Phase 1 = Our Story only. */
export const KAIROS_LIVE_SLOTS: number[] = [1];

export function kairosModule(slot: number): KairosModule | undefined {
  return KAIROS_MODULES.find(m => m.slot === slot);
}

/** Starter layout: headings only — the client writes every word. */
export function starterSections(slot: number, ctaText?: string): KairosSection[] {
  if (slot !== 1) return [newSection('hero')];
  const hero = newSection('hero') as Extract<KairosSection, { type: 'hero' }>;
  hero.headline = 'Our Story';
  const start = newSection('text') as Extract<KairosSection, { type: 'text' }>;
  start.heading = 'How it started';
  const why = newSection('image_text') as Extract<KairosSection, { type: 'image_text' }>;
  why.heading = 'Why we do this work';
  why.imagePosition = 'right';
  const gallery = newSection('photo_gallery') as Extract<KairosSection, { type: 'photo_gallery' }>;
  gallery.heading = 'Behind the scenes';
  const cta = newSection('cta_banner') as Extract<KairosSection, { type: 'cta_banner' }>;
  cta.heading = 'Ready to take the next step?';
  if (ctaText) cta.buttonText = ctaText;
  return [hero, start, why, gallery, cta];
}

// ─── Pages ───────────────────────────────────────────────────────────────────

export type KairosPage = {
  id?: string;
  site_id: string;
  module_slot: number;
  title: string;
  menu_label: string;
  sections: KairosSection[];
  published: boolean;
  updated_at?: string;
};

export type KairosNavLink = { label: string; href: string };

/** Links to this site's published Kairos pages (database rules hide locked or paused ones). */
export async function fetchKairosNavLinks(siteId: string, slug: string): Promise<KairosNavLink[]> {
  const { data, error } = await supabase
    .from('kairos_pages')
    .select('module_slot, menu_label, title')
    .eq('site_id', siteId)
    .eq('published', true)
    .order('module_slot');
  if (error || !data) return [];
  return (data as { module_slot: number; menu_label: string; title: string }[])
    .filter(p => KAIROS_LIVE_SLOTS.includes(p.module_slot))
    .map(p => ({
      label: p.menu_label || p.title || kairosModule(p.module_slot)?.menuLabel || 'More',
      href: kairosHref(slug, p.module_slot),
    }));
}

// ─── Addresses ───────────────────────────────────────────────────────────────

function onPlatformHost(): boolean {
  return typeof window !== 'undefined' && isPlatformHost(window.location.hostname);
}

/** Home page of the site: `/site/<slug>` on the platform, `/` on a custom domain. */
export function siteHomeHref(slug: string): string {
  return onPlatformHost() ? `/site/${slug}` : '/';
}

export function kairosHref(slug: string, slot: number): string {
  const path = kairosModule(slot)?.path ?? '';
  return onPlatformHost() ? `/site/${slug}/${path}` : `/${path}`;
}

/** Button links like "#contact" point at the home page's sections. */
export function resolveKairosLink(url: string, slug: string): string {
  const trimmed = url.trim();
  if (!trimmed) return `${siteHomeHref(slug)}#contact`;
  if (trimmed.startsWith('#')) return `${siteHomeHref(slug)}${trimmed}`;
  return trimmed;
}

// ─── Media ───────────────────────────────────────────────────────────────────

/** Uploads to client-assets with the site id in the file name (required by the owner-only storage rule). */
export async function uploadKairosImage(siteId: string, file: File): Promise<string | null> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `kairos/${siteId}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('client-assets').upload(path, file, { upsert: false });
  if (error) return null;
  return supabase.storage.from('client-assets').getPublicUrl(path).data.publicUrl;
}

export function videoEmbedUrl(url: string): string | null {
  const u = url.trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function isDarkTheme(theme: string): boolean {
  return theme === 'luxury' || theme === 'innovative';
}

/** Colors and fonts for a Kairos page, taken from the client's own branding. */
export function kairosPalette(branding: SiteBranding) {
  const dark = isDarkTheme(branding.theme);
  return {
    dark,
    bg: branding.backgroundColor || (dark ? '#0b0f14' : '#ffffff'),
    altBg: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
    text: branding.textColor || (dark ? '#f5f5f5' : '#111827'),
    muted: branding.mutedColor || (dark ? '#a3a3a3' : '#4b5563'),
    border: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
    displayFont: branding.fontDisplay ? `'${branding.fontDisplay}', serif` : undefined,
    bodyFont: branding.fontBody ? `'${branding.fontBody}', sans-serif` : undefined,
  };
}

/** True when a section has enough content to show visitors. */
export function sectionHasContent(s: KairosSection): boolean {
  switch (s.type) {
    case 'hero':          return !!s.headline.trim();
    case 'text':          return !!s.body.trim();
    case 'image_text':    return !!(s.body.trim() || s.imageUrl);
    case 'photo_gallery': return s.photos.some(p => p.url);
    case 'stats':         return s.items.some(i => i.value.trim());
    case 'video':         return !!s.url.trim();
    case 'cta_banner':    return !!(s.heading.trim() || s.body.trim());
  }
}
