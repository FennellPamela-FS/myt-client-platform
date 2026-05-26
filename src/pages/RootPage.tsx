import { ArrowRight } from 'lucide-react';

const LOGO_URL =
  'https://storage.googleapis.com/msgsndr/5WkCjdNQApiEdU3hlSMc/media/87a37730-dc12-4597-b730-6b76ecf537f6.png';

export default function RootPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'linear-gradient(135deg, #464E54 0%, #2e3538 100%)' }}
    >
      {/* Subtle radial accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(78,188,237,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <img
          src={LOGO_URL}
          alt="mytCreative"
          className="h-12 mb-8 select-none"
          draggable={false}
        />

        {/* Divider accent */}
        <div
          className="w-10 h-0.5 rounded-full mb-8"
          style={{ backgroundColor: '#4EBCED' }}
        />

        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          Client Platform
        </h1>
        <p className="text-base max-w-xs mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
          You're in the right place — just at the wrong door. Where would you like to go?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          {/* New clients */}
          <a
            href="https://myt-launchpad.netlify.app/launchpad"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#4EBCED', color: '#ffffff' }}
          >
            Get Your Business Online
            <ArrowRight className="w-4 h-4" />
          </a>

          {/* Existing clients */}
          <a
            href="/admin/login"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl transition-colors"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                'rgba(255,255,255,0.14)')
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                'rgba(255,255,255,0.08)')
            }
          >
            Access My Site
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <p className="text-xs mt-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
          mytCreative · Digital Solutions for Modern Businesses
        </p>
      </div>
    </div>
  );
}
