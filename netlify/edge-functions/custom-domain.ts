import type { Config, Context } from '@netlify/edge-functions';

// Platform hostnames that should never be rewritten
const PLATFORM_HOSTS = new Set([
  'myt-client-platform.netlify.app',
  'localhost',
  '127.0.0.1',
]);

export default async function handler(req: Request, context: Context) {
  const url      = new URL(req.url);
  const host     = req.headers.get('host') ?? '';
  const hostname = host.split(':')[0].toLowerCase();

  console.log(`[custom-domain] request: ${req.method} ${hostname}${url.pathname}`);

  // Pass through platform domains
  if (PLATFORM_HOSTS.has(hostname)) {
    console.log(`[custom-domain] platform host — passing through`);
    return context.next();
  }

  // Pass through already-routed paths
  if (url.pathname.startsWith('/site/') || url.pathname.startsWith('/admin/')) {
    console.log(`[custom-domain] already-routed path ${url.pathname} — passing through`);
    return context.next();
  }

  // Pass through static assets — never rewrite these
  const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|map|json)$/i;
  if (url.pathname.startsWith('/assets/') || STATIC_EXTENSIONS.test(url.pathname)) {
    console.log(`[custom-domain] static asset ${url.pathname} — passing through`);
    return context.next();
  }

  // Read env vars — use Netlify.env (edge runtime) with Deno.env as fallback
  // @ts-ignore — Netlify global is injected at runtime
  const netlifyEnv = typeof Netlify !== 'undefined' ? Netlify.env : null;
  const supabaseUrl = netlifyEnv?.get('VITE_SUPABASE_URL') ?? Deno.env.get('VITE_SUPABASE_URL');
  const supabaseKey = netlifyEnv?.get('VITE_SUPABASE_ANON_KEY') ?? Deno.env.get('VITE_SUPABASE_ANON_KEY');

  console.log(`[custom-domain] env check — supabaseUrl: ${supabaseUrl ? 'set' : 'MISSING'}, supabaseKey: ${supabaseKey ? 'set' : 'MISSING'}`);

  if (!supabaseUrl || !supabaseKey) {
    console.log(`[custom-domain] missing env vars — passing through`);
    return context.next();
  }

  // Look up the slug for this custom domain
  const lookupUrl = `${supabaseUrl}/rest/v1/client_sites_saas?custom_domain=eq.${encodeURIComponent(hostname)}&select=slug&limit=1`;
  console.log(`[custom-domain] querying Supabase for hostname: ${hostname}`);

  let rows: { slug: string }[] = [];
  try {
    const res = await fetch(lookupUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    console.log(`[custom-domain] Supabase response status: ${res.status}`);

    if (!res.ok) {
      console.log(`[custom-domain] Supabase error — passing through`);
      return context.next();
    }

    rows = await res.json() as { slug: string }[];
    console.log(`[custom-domain] rows returned: ${rows.length} — ${JSON.stringify(rows)}`);
  } catch (err) {
    console.log(`[custom-domain] fetch error: ${err}`);
    return context.next();
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    console.log(`[custom-domain] no matching slug for ${hostname} — passing through`);
    return context.next();
  }

  const { slug } = rows[0];

  // /admin on a custom domain → /site/[slug]/admin, everything else → /site/[slug]
  // Use a sub-path on the current path: /about → /site/[slug]/about
  const targetPath = url.pathname === '/admin'
    ? `/site/${slug}/admin`
    : `/site/${slug}${url.pathname === '/' ? '' : url.pathname}`;

  console.log(`[custom-domain] redirecting ${hostname}${url.pathname} → ${targetPath}`);

  // Use a redirect (not rewrite) so React Router sees the correct path.
  // context.rewrite() keeps the browser URL at "/" which causes React Router
  // to render RootPage instead of SitePage.
  const redirectUrl = new URL(req.url);
  redirectUrl.pathname = targetPath;

  return Response.redirect(redirectUrl.toString(), 302);
}

export const config: Config = {
  path: '/*',
};
