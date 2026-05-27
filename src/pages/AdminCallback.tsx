import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

function isCustomDomain(): boolean {
  const h = window.location.hostname;
  return h !== 'localhost' && h !== '127.0.0.1' && !h.endsWith('.netlify.app');
}

// Handles the redirect after a Supabase magic link is clicked.
//
// Three modes:
//
//  A) Platform + returnTo param  — tokens arrived via email. Relay them to the
//     custom domain's /admin/callback in the URL hash so Supabase there can
//     establish its own session.
//
//  B) Custom domain              — tokens arrived (relayed from platform).
//     Use window.location.replace('/admin') so we escape the fast-path
//     mini-BrowserRouter and trigger a clean full-page load at /admin where
//     the main CustomDomainSiteApp can render correctly.
//
//  C) Platform, no returnTo      — direct platform login. Look up slug by
//     email, navigate to /site/:slug/admin.

export default function AdminCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const returnTo    = new URLSearchParams(window.location.search).get('returnTo');
    const onCustom    = isCustomDomain();

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

      // ── Mode B: custom domain — full-page navigate so we exit the mini-router
      if (onCustom) {
        window.location.replace('/admin');
        return;
      }

      // ── Mode C: direct platform login ──────────────────────────────────────
      const { data } = await supabase
        .from('client_sites_saas')
        .select('slug')
        .eq('email', session.user.email ?? '')
        .single();

      const row = data as unknown as { slug: string } | null;
      if (row?.slug) {
        navigate(`/site/${row.slug}/admin`, { replace: true });
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
