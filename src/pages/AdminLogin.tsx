import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Sparkles } from 'lucide-react';

// Single permanent callback URL — all magic links route through the platform.
// Custom domains pass a `returnTo` query param so tokens can be relayed back.
const PLATFORM_CALLBACK = 'https://myt-client-platform.netlify.app/admin/callback';

function buildCallbackUrl(): string {
  const hostname = window.location.hostname;
  const isCustomDomain =
    hostname !== 'localhost' &&
    hostname !== '127.0.0.1' &&
    !hostname.endsWith('.netlify.app');

  if (isCustomDomain) {
    // Relay: after auth on the platform, tokens are forwarded back here
    const returnTo = encodeURIComponent(`${window.location.origin}/admin/callback`);
    return `${PLATFORM_CALLBACK}?returnTo=${returnTo}`;
  }

  // On localhost or the platform itself, use the current origin directly
  return `${window.location.origin}/admin/callback`;
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: buildCallbackUrl() },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Site Admin</h1>
              <p className="text-sm text-muted-foreground">Powered by mytCreative</p>
            </div>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <Mail size={40} className="text-primary mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Check your email</h2>
              <p className="text-muted-foreground text-sm">
                We sent a magic link to <span className="font-medium text-foreground">{email}</span>.
                Click it to sign in — no password needed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm mb-4">
                  Enter the email address associated with your site and we'll send you a sign-in link.
                </p>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourbusiness.com"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {error && <p className="text-destructive text-xs mt-1">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send Magic Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
