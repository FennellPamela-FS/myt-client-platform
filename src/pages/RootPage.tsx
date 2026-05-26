import { ArrowRight, Globe } from 'lucide-react';

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      {/* Logo mark */}
      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
        <Globe className="w-7 h-7 text-white" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">
        mytCreative Client Platform
      </h1>
      <p className="text-gray-400 text-base max-w-sm mb-10">
        You're in the right place — just at the wrong door. Where would you like to go?
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        {/* New clients */}
        <a
          href="https://myt-launchpad.netlify.app/launchpad"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
        >
          Get Your Business Online
          <ArrowRight className="w-4 h-4" />
        </a>

        {/* Existing clients */}
        <a
          href="/admin/login"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/10"
        >
          Access My Site
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <p className="text-gray-600 text-xs mt-8">
        mytCreative · Digital Solutions for Modern Businesses
      </p>
    </div>
  );
}
