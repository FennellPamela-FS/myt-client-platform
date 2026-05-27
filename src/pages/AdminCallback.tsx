import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { isPlatformHost } from '../lib/hosts';
import type { Session } from '@supabase/supabase-js';

// Handles the redirect after a Supabase magic link is clicked.
//
// Three modes:
//
//  A) Platform + returnTo param  — tokens arrived via email. Relay them to the
//     custom domain's /admin/callback in the URL hash so Supabase there can
//     establish its own session.
//
//  B) Client custom domain       — tokens arrived (relayed from platform).
//     Use window.location.replace('/admin') to escape the fast-path
//     mini-BrowserRouter and trigger a clean full-page load at /admin.
//
//  C) Platform host, no returnTo — direct platform login (incl. mytcreative.app).
//     Look up the user's site by email. If the site has a custom_domain,
//     redirect straight to https://<custom_domain>/admin. Otherwise fall back
//     to the internal /site/:slug/admin path.

export default function AdminCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const returnTo = new URLSearchParams(window.location.search).get('returnTo');
    const onCustom = !isPlatformHost(window.location.hostname);

    async function handleSession(session: Session) {
      // ── Mode A: relay tokens to custom domain ──────────────────────────────
      if (returnTo) {
        const params = new URLSearchParams({
          access_token:  session.access_token,
          refresh_token: session.refresh_token ?? '',
          expires_in:    String(session.expires_in ?? 3600),
          token_type:    'bearer',
          type:          'magiclink',
        });
        window.location.href = `${returnTo}#${params.toString()}`;
        return;
      }

      // ── Mode B: client custom domain — exit mini-router via full-page load ─
      if (onCustom) {
        window.location.replace('/admin');
        return;
      }

      // ── Mode C: platform host login (myt-client-platform.netlify.app or
      //           mytcreative.app) — find the user's site and send them to
      //           their custom domain admin if one is configured. ─────────────
      const { data } = await supabase
        .from('client_sites_saas')
        .select('slug, custom_domain')
        .eq('email', session.user.email ?? '')
        .single();

      const row = data as unknown as { slug: string; custom_domain: string | null } | null;
      if (row?.slug) {
        if (row.custom_domain) {
          // Send them directly to their white-labeled admin
          window.location.href = `https://${row.custom_domain}/admin`;
        } else {
          navigate(`/site/${row.slug}/admin`, { replace: true });
        }
      } else {
        navigate('/admin/login?error=no_site', { replace: true });
      }
    }

    // Fallback: if Supabase processed the hash before this component mounted,
    // SIGNED_IN will have already fired. getSession() catches that case.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession(session);
    });

    // Primary: listen for the SIGNED_IN event (typical flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
