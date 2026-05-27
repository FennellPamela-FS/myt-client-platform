import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import SitePage from './pages/SitePage';
import AdminLogin from './pages/AdminLogin';
import AdminPortal from './pages/AdminPortal';
import AdminCallback from './pages/AdminCallback';
import RootPage from './pages/RootPage';
import NotFound from './pages/NotFound';

// Hostnames that belong to the platform itself — use standard path-based routing
const PLATFORM_HOSTS = new Set([
  'myt-client-platform.netlify.app',
  'localhost',
  '127.0.0.1',
]);

function isPlatformHost(hostname: string): boolean {
  return PLATFORM_HOSTS.has(hostname) || hostname.endsWith('.netlify.app');
}

// ── Custom-domain shell ───────────────────────────────────────────────────────
// When a visitor lands on e.g. www.guestconnectai.com, this component looks up
// the matching slug from Supabase then renders clean white-labeled routes at
// the domain root — no /site/:slug path ever appears in the address bar.

function CustomDomainApp() {
  const hostname = window.location.hostname;
  const [slug, setSlug] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Fast path: render the auth callback immediately — tokens in the URL hash
  // must be processed right away, before the slug lookup completes.
  if (window.location.pathname === '/admin/callback') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/admin/callback" element={<AdminCallback />} />
        </Routes>
      </BrowserRouter>
    );
  }

  useEffect(() => {
    supabase
      .from('client_sites_saas')
      .select('slug')
      .eq('custom_domain', hostname)
      .maybeSingle()
      .then(({ data, error }) => {
        const row = data as { slug: string } | null;
        if (!error && row?.slug) {
          setSlug(row.slug);
        } else {
          setNotFound(true);
        }
      });
  }, [hostname]);

  // Loading — slug lookup in progress
  if (!slug && !notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  // No site matched this domain
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800">Site not found</h1>
        <p className="text-muted-foreground">This domain isn't connected to an active site.</p>
      </div>
    );
  }

  // Clean white-labeled routes — no /site/:slug prefix
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<SitePage    slug={slug!} />} />
        <Route path="/admin"          element={<AdminPortal slug={slug!} />} />
        <Route path="/admin/login"    element={<AdminLogin />} />
        <Route path="/admin/callback" element={<AdminCallback />} />
        {/* Catch-all — render the site for any unrecognised path on a custom domain */}
        <Route path="*"               element={<SitePage    slug={slug!} />} />
      </Routes>
    </BrowserRouter>
  );
}

// ── Standard platform app ─────────────────────────────────────────────────────

function App() {
  const hostname = window.location.hostname;

  if (!isPlatformHost(hostname)) {
    return <CustomDomainApp />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<RootPage />} />
        <Route path="/site/:slug"          element={<SitePage />} />
        <Route path="/site/:slug/admin"    element={<AdminPortal />} />
        <Route path="/admin/login"         element={<AdminLogin />} />
        <Route path="/admin/callback"      element={<AdminCallback />} />
        <Route path="*"                    element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
