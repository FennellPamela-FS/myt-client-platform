import type { Config, Context } from '@netlify/edge-functions';

// All custom-domain routing is now handled by the React SPA (hostname-based router in App.tsx).
// This edge function is intentionally a pass-through — Netlify's /* → /index.html redirect
// rule will serve the SPA for any path that doesn't map to a real file.
export default async function handler(_req: Request, context: Context) {
  return context.next();
}

export const config: Config = {
  path: '/*',
};
