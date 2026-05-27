/**
 * Hostnames that belong to the platform itself.
 * Any hostname NOT in this list (and not *.netlify.app) is treated as a
 * white-labeled client custom domain.
 *
 * Used by App.tsx, AdminLogin.tsx, and AdminCallback.tsx — keep in sync.
 */
export const PLATFORM_HOSTS = new Set([
  'myt-client-platform.netlify.app',
  'mytcreative.app',
  'www.mytcreative.app',
  'localhost',
  '127.0.0.1',
]);

export function isPlatformHost(hostname: string): boolean {
  return PLATFORM_HOSTS.has(hostname) || hostname.endsWith('.netlify.app');
}
