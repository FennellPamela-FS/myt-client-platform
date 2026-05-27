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

// ── Custom-domain: auth callback fast path ────────────────────────────────────
// Rendered immediately when the path is /admin/callback so that Supabase can
// parse the access_token hash without waiting for the slug lookup.
// AdminCallback uses window.location.replace() (not React Router navigate) so
// it escapes this mini-router and triggers a clean full-page load at /admin.

function CustomDomainCallbackPage() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<AdminCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

// ── Custom-domain: main site app ──────────────────────────────────────────────
// Looks up the slug for the current hostname then renders clean white-labeled
// routes — no /site/:slug path ever appears in the address bar.
// ALL hooks are unconditional here (no early returns before any hook).

function CustomDomainSiteApp() {
  const hostname = window.location.hostname;
  const [slug, setSlug] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

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

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800">Site not found</h1>
        <p className="text-muted-foreground">This domain isn't connected to an active site.</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<SitePage    slug={slug!} />} />
        <Route path="/admin"          element={<AdminPortal slug={slug!} />} />
        <Route path="/admin/login"    element={<AdminLogin />} />
        <Route path="/admin/callback" element={<AdminCallback />} />
        <Route path="*"               element={<SitePage    slug={slug!} />} />
      </Routes>
    </BrowserRouter>
  );
}

// ── Custom-domain router: no hooks — pure conditional dispatch ────────────────

function CustomDomainApp() {
  if (window.location.pathname === '/admin/callback') {
    return <CustomDomainCallbackPage />;
  }
  return <CustomDomainSiteApp />;
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
        <Route path="/"                 element={<RootPage />} />
        <Route path="/site/:slug"       element={<SitePage />} />
        <Route path="/site/:slug/admin" element={<AdminPortal />} />
        <Route path="/admin/login"      element={<AdminLogin />} />
        <Route path="/admin/callback"   element={<AdminCallback />} />
        <Route path="*"                 element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
