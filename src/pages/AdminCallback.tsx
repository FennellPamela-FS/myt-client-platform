import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Determines whether the current page is a custom client domain.
function isCustomDomain(): boolean {
  const h = window.location.hostname;
  return h !== 'localhost' && h !== '127.0.0.1' && !h.endsWith('.netlify.app');
}

// Handles the redirect after a Supabase magic link is clicked.
//
// Three modes:
//
//  A) Platform + returnTo param  — tokens just arrived from the email link on
//     the platform. Relay them to the custom domain's /admin/callback in the
//     URL hash so that Supabase on the custom domain can establish its session.
//
//  B) Custom domain              — tokens arrived (relayed from the platform).
//     Supabase parses the hash automatically; once SIGNED_IN fires, navigate
//     to /admin (the clean white-labeled admin path).
//
//  C) Platform, no returnTo      — direct platform login. Look up the slug by
//     email and navigate to /site/:slug/admin.

export default function AdminCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const returnTo = new URLSearchParams(window.location.search).get('returnTo');
    const onCustomDomain = isCustomDomain();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== 'SIGNED_IN' || !session) return;

        // ── Mode A: platform received the email click, relay to custom domain ──
        if (returnTo) {
          const params = new URLSearchParams({
            access_token:  session.access_token,
            refresh_token: session.refresh_token ?? '',
            expires_in:    String(session.expires_in ?? 3600),
            token_type:    'bearer',
            type:          'magiclink',
          });
          // Use window.location.href so the hash is sent to the new origin
          window.location.href = `${returnTo}#${params.toString()}`;
          return;
        }

        // ── Mode B: custom domain received the relayed tokens ─────────────────
        if (onCustomDomain) {
          navigate('/admin', { replace: true });
          return;
        }

        // ── Mode C: direct platform login (no relay) ──────────────────────────
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
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
