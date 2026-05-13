import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Handles the redirect after a Supabase magic link is clicked.
// Supabase appends tokens to the URL hash; the client auto-parses them
// and fires onAuthStateChange with SIGNED_IN once the session is established.
export default function AdminCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Find the client site for this user's email and redirect to their admin
          const { data } = await supabase
            .from('client_sites_saas')
            .select('slug')
            .eq('email', session.user.email ?? '')
            .single();

          const row = data as unknown as { slug: string } | null;
          if (row?.slug) {
            navigate(`/site/${row.slug}/admin`, { replace: true });
          } else {
            // No site found — send to login with a message
            navigate('/admin/login?error=no_site', { replace: true });
          }
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
