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
  const targetPath = url.pathname === '/admin'
    ? `/site/${slug}/admin`
    : `/site/${slug}${url.pathname === '/' ? '' : url.pathname}`;

  console.log(`[custom-domain] rewriting ${hostname}${url.pathname} → ${targetPath}`);

  const rewriteUrl = new URL(req.url);
  rewriteUrl.pathname = targetPath;

  return context.rewrite(rewriteUrl);
}

export const config: Config = {
  path: '/*',
};
