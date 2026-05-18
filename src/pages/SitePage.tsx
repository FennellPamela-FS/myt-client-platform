import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ClientSite } from '../types/database';
import { resolveSiteContent, resolveBranding } from '../types/database';
import SiteRenderer from '../components/site/SiteRenderer';

export default function SitePage() {
  const { slug } = useParams<{ slug: string }>();
  const [site, setSite] = useState<ClientSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('client_sites_saas')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setSite(data as unknown as ClientSite);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your site…</p>
      </div>
    </div>
  );

  if (notFound || !site) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800">Site not found</h1>
      <p className="text-muted-foreground">This site doesn't exist or hasn't been activated yet.</p>
    </div>
  );

  const content = resolveSiteContent(site);
  const branding = resolveBranding(site);

  if (!content) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Site content is being generated. Check back shortly.</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* SEO meta description injected dynamically */}
      <SiteRenderer
        content={content}
        branding={branding}
        businessName={site.business_name}
        slug={slug!}
        displayOptions={site.display_options}
      />
      <footer className="py-6 px-6 border-t text-center text-xs text-muted-foreground"
        style={{ borderColor: `${branding.primaryColor}22` }}>
        <p>© {new Date().getFullYear()} {site.business_name} · <a href={`mailto:${content.business_email}`} className="hover:underline">{content.business_email}</a></p>
        <p className="mt-1">
          <Link to={`/site/${slug}/admin`} className="hover:text-foreground transition-colors">Manage site</Link>
        </p>
      </footer>
    </div>
  );
}
