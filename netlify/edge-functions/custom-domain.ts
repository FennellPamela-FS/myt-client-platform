import type { Config, Context } from '@netlify/edge-functions';

// Platform hostnames that should never be rewritten
const PLATFORM_HOSTS = new Set([
  'myt-client-platform.netlify.app',
  'localhost',
  '127.0.0.1',
]);

export default async function handler(req: Request, context: Context) {
  const url  = new URL(req.url);
  const host = req.headers.get('host') ?? '';
  const hostname = host.split(':')[0].toLowerCase();

  // Pass through platform domains and already-routed paths
  if (PLATFORM_HOSTS.has(hostname)) return context.next();
  if (url.pathname.startsWith('/site/') || url.pathname.startsWith('/admin/')) {
    return context.next();
  }

  const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL');
  const supabaseKey = Deno.env.get('VITE_SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseKey) return context.next();

  // Look up the slug for this custom domain
  const res = await fetch(
    `${supabaseUrl}/rest/v1/client_sites_saas` +
    `?custom_domain=eq.${encodeURIComponent(hostname)}&select=slug&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!res.ok) return context.next();

  const rows = await res.json() as { slug: string }[];
  if (!Array.isArray(rows) || rows.length === 0) return context.next();

  const { slug } = rows[0];

  // /admin on a custom domain → /site/[slug]/admin
  // everything else → /site/[slug]
  const targetPath = url.pathname === '/admin'
    ? `/site/${slug}/admin`
    : `/site/${slug}`;

  const rewriteUrl = new URL(req.url);
  rewriteUrl.pathname = targetPath;

  return context.rewrite(rewriteUrl);
}

export const config: Config = {
  path: '/*',
};
