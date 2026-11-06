import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ClientSite } from '../types/database';
import { resolveBranding } from '../types/database';
import KairosSections, { KairosFontLinks } from '../components/kairos/KairosSections';
import {
  fetchKairosNavLinks, kairosModule, kairosPalette, siteHomeHref,
  type KairosNavLink, type KairosPage as KairosPageRow,
} from '../lib/kairos';

interface Props {
  /** Passed directly on a custom domain (bypasses useParams). */
  slug?: string;
  slot: number;
}

/**
 * Public Kairos Award page (e.g. /our-story). Visitors only ever receive a
 * published page of an unlocked module on an active site — the database
 * rules return nothing otherwise, and this shows a friendly "not available".
 */
export default function KairosPage({ slug: slugProp, slot }: Props) {
  const params = useParams<{ slug: string }>();
  const slug = slugProp ?? params.slug ?? '';
  const [site, setSite] = useState<ClientSite | null>(null);
  const [page, setPage] = useState<KairosPageRow | null>(null);
  const [links, setLinks] = useState<KairosNavLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: siteData } = await supabase
        .from('client_sites_saas').select('*').eq('slug', slug).eq('status', 'active').maybeSingle();
      const loaded = siteData as unknown as ClientSite | null;
      if (loaded) {
        setSite(loaded);
        const [{ data: pageData }, navLinks] = await Promise.all([
          supabase.from('kairos_pages').select('*')
            .eq('site_id', loaded.id).eq('module_slot', slot).eq('published', true).maybeSingle(),
          fetchKairosNavLinks(loaded.id, slug),
        ]);
        setPage(pageData as unknown as KairosPageRow | null);
        setLinks(navLinks);
      }
      setLoading(false);
    })();
  }, [slug, slot]);

  useEffect(() => {
    if (site && page) document.title = `${page.title || kairosModule(slot)?.title} | ${site.business_name}`;
  }, [site, page, slot]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-gray-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const home = siteHomeHref(slug);

  if (!site || !page) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800">This page isn't available</h1>
      <a href={home} className="text-sm underline text-gray-600">Go to the home page</a>
    </div>
  );

  const branding = resolveBranding(site);
  const pal = kairosPalette(branding);

  return (
    <div style={{ backgroundColor: pal.bg, color: pal.text, fontFamily: pal.bodyFont }} className="min-h-screen flex flex-col">
      <KairosFontLinks branding={branding} />

      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: pal.bg, borderColor: pal.border }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <a href={home} className="flex items-center gap-3 min-w-0">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={site.business_name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: branding.primaryColor }}>
                {site.business_name.charAt(0)}
              </span>
            )}
            <span className="font-semibold text-lg truncate" style={{ fontFamily: pal.displayFont }}>{site.business_name}</span>
          </a>
          <nav className="flex items-center gap-5 text-sm">
            <a href={home} className="hover:opacity-70" style={{ color: pal.muted }}>Home</a>
            {links.map(l => (
              <a key={l.href} href={l.href} className="hidden sm:inline hover:opacity-70" style={{ color: pal.muted }}>{l.label}</a>
            ))}
            <a href={`${home}#contact`} className="px-4 py-2 rounded-full text-white font-medium hover:opacity-90"
              style={{ backgroundColor: branding.primaryColor }}>
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <KairosSections sections={page.sections ?? []} branding={branding} slug={slug} />
      </main>

      <footer className="border-t" style={{ borderColor: pal.border }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm" style={{ color: pal.muted }}>
          <span>© {new Date().getFullYear()} {site.business_name}</span>
          <a href={home} className="hover:opacity-70">Back to the home page</a>
        </div>
      </footer>
    </div>
  );
}
