import type { Config, Context } from '@netlify/edge-functions';
import { isPlatformHost } from '../../src/lib/hosts.ts';

// Apex → www redirect for client custom domains.
//
// The admin repo's update-client-domain function registers both the bare
// apex (joesplumbing.com) and the www. form (www.joesplumbing.com) as
// Netlify domain aliases so both get valid certs, but client_sites_saas.custom_domain
// is always stored in the www. form. Without this redirect the apex would
// serve identical content with no canonical URL (bad for SEO) and would only
// resolve to the right client by coincidence of exact hostname matching.
// Platform hosts (sites.mytcreative.com/[slug], the netlify.app domain,
// previews/branch deploys — see isPlatformHost) have no www. counterpart
// and must pass through unchanged.
//
// Beyond that, routing is handled by the React SPA (hostname-based router in
// App.tsx). This edge function is otherwise a pass-through — Netlify's
// /* → /index.html redirect rule will serve the SPA for any path that
// doesn't map to a real file.
export default async function handler(req: Request, context: Context) {
  const url = new URL(req.url);
  const { hostname } = url;

  if (!isPlatformHost(hostname) && !hostname.startsWith('www.')) {
    return Response.redirect(`https://www.${hostname}${url.pathname}${url.search}`, 301);
  }

  return context.next();
}

export const config: Config = {
  path: '/*',
};
