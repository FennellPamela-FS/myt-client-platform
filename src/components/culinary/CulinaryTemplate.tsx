import { useState } from 'react';
import { Settings, Phone, MapPin, Clock, Menu, X } from 'lucide-react';
import type { SiteContent, SiteBranding, DisplayOptions } from '../../types/database';
import { DEFAULT_DISPLAY_OPTIONS } from '../../types/database';
import EventInquiryForm from './EventInquiryForm';
import MenuGrid from './MenuGrid';

// ─── Hero image fallbacks for culinary industries ─────────────────────────────

const CULINARY_HERO_IMAGES: Record<string, string> = {
  private_chef:      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=85',
  catering:          'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1600&q=85',
  food_truck:        'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1600&q=85',
  farm_to_table:     'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=85',
  default:           'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  content: SiteContent;
  branding: SiteBranding;
  businessName: string;
  slug?: string;
  siteId: string;
  displayOptions?: DisplayOptions | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CulinaryTemplate({
  content, branding, businessName, slug, siteId, displayOptions,
}: Props) {
  const opts   = { ...DEFAULT_DISPLAY_OPTIONS, ...(displayOptions ?? {}) };
  const pri    = branding.primaryColor;
  const sec    = branding.secondaryColor;
  const heroImg = branding.heroImageUrl
    ?? CULINARY_HERO_IMAGES[content.industry_category]
    ?? CULINARY_HERO_IMAGES.default;

  const [mobileOpen, setMobileOpen] = useState(false);

  const cssVars = {
    '--brand-primary': pri,
    '--brand-secondary': sec,
    '--brand-accent': branding.accentColor,
  } as React.CSSProperties;

  const NAV_LINKS = ['Story', 'Menu', 'Events', 'Contact'];

  return (
    <div style={cssVars} className="font-sans bg-white text-gray-900">

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Brand mark */}
          <div className="flex items-center gap-3">
            {opts.show_nav_logo && branding.logoUrl ? (
              <img src={branding.logoUrl} alt={businessName} className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: pri }}>
                {businessName.charAt(0)}
              </div>
            )}
            {(opts.show_nav_name || (branding.logoUrl && opts.nav_show_tagline)) && (
              <div className="flex flex-col leading-tight">
                {opts.show_nav_name && (
                  <span className="font-semibold text-lg">{businessName}</span>
                )}
                {branding.logoUrl && opts.nav_show_tagline && content.brand_tagline && (
                  <span className="text-xs text-gray-500">{content.brand_tagline}</span>
                )}
              </div>
            )}
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm">
            {NAV_LINKS.map(item => (
              <a key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                {item}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <a href="#events"
            className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: pri }}>
            Book Your Event
          </a>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
            {NAV_LINKS.map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-gray-700 py-2">
                {item}
              </a>
            ))}
            <a href="#events" onClick={() => setMobileOpen(false)}
              className="block text-center px-5 py-3 rounded-full text-sm font-semibold text-white mt-2"
              style={{ backgroundColor: pri }}>
              Book Your Event
            </a>
          </div>
        )}
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <img src={heroImg} alt={businessName}
          className="absolute inset-0 w-full h-full object-cover" />

        {/* Gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${sec}CC 0%, ${sec}99 50%, ${sec}EE 100%)` }} />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          {content.brand_tagline && (
            <p className="text-xs font-bold tracking-[0.35em] uppercase mb-5 opacity-80 text-white">
              {content.brand_tagline}
            </p>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            {content.hero_headline}
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
            {content.hero_subheadline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#events"
              className="px-8 py-4 rounded-full text-base font-semibold text-white transition-opacity hover:opacity-90 shadow-lg"
              style={{ backgroundColor: pri }}>
              {content.hero_cta_primary || 'Book Your Event'}
            </a>
            {content.hero_cta_secondary && (
              <a href="#menu"
                className="px-8 py-4 rounded-full text-base font-semibold border-2 border-white/60 text-white hover:bg-white/10 transition-colors">
                {content.hero_cta_secondary}
              </a>
            )}
          </div>
          {content.hero_value_statement && (
            <p className="text-sm text-white/60 mt-8 italic">{content.hero_value_statement}</p>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <div className="w-px h-12 bg-white animate-pulse" />
        </div>
      </section>

      {/* ── Our Story ───────────────────────────────────────────────────────── */}
      <section id="story" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: pri }}>
              Our Story
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
              {content.about_headline}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">{content.about_body}</p>
            {content.about_mission && (
              <blockquote className="border-l-4 pl-6 py-2 italic text-gray-500"
                style={{ borderColor: pri }}>
                "{content.about_mission}"
              </blockquote>
            )}
            {content.about_tagline && (
              <p className="mt-6 text-sm font-medium" style={{ color: pri }}>
                — {content.about_tagline}
              </p>
            )}
          </div>

          {/* Service highlights */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: content.service_1_name, body: content.service_1_description },
              { label: content.service_2_name, body: content.service_2_description },
              { label: content.service_3_name, body: content.service_3_description },
              { label: content.service_4_name, body: content.service_4_description },
            ].filter(s => s.label).map((s, i) => (
              <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:shadow-md transition-shadow">
                <div className="w-8 h-1 rounded-full mb-3" style={{ backgroundColor: pri }} />
                <h4 className="font-semibold text-sm text-gray-900 mb-2">{s.label}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Signature Menu ──────────────────────────────────────────────────── */}
      <section id="menu" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: pri }}>
              Curated Selection
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Signature Menu</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">
              Each dish is crafted from seasonal ingredients, tailored to your event and vision.
            </p>
          </div>
          <MenuGrid siteId={siteId} primaryColor={pri} />
          {/* Fallback text if no items yet */}
        </div>
      </section>

      {/* ── Why Choose Us ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: pri }}>
              The Difference
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              {content.benefit_1_title ? 'Why Guests Choose Us' : 'What Sets Us Apart'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: content.benefit_1_title, desc: content.benefit_1_description },
              { title: content.benefit_2_title, desc: content.benefit_2_description },
              { title: content.benefit_3_title, desc: content.benefit_3_description },
              { title: content.benefit_4_title, desc: content.benefit_4_description },
            ].filter(b => b.title).map((b, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg"
                  style={{ backgroundColor: pri }}>
                  {i + 1}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{b.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      {(content.testimonial_1_quote || content.testimonial_2_quote) && (
        <section className="py-24 px-6" style={{ backgroundColor: `${sec}0D` }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: pri }}>
                Guest Stories
              </p>
              <h2 className="text-3xl font-bold text-gray-900">What They're Saying</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { quote: content.testimonial_1_quote, name: content.testimonial_1_name, role: content.testimonial_1_role },
                { quote: content.testimonial_2_quote, name: content.testimonial_2_name, role: content.testimonial_2_role },
              ].filter(t => t.quote).map((t, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="text-3xl mb-4" style={{ color: pri }}>"</div>
                  <p className="text-gray-700 leading-relaxed italic mb-6">{t.quote}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: pri }}>
                      {t.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                      {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Event Inquiry ────────────────────────────────────────────────────── */}
      <section id="events" className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: pri }}>
              Private Events
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {content.cta_section_headline || "Let's Plan Something Extraordinary"}
            </h2>
            <p className="text-gray-500 mt-4 max-w-lg mx-auto leading-relaxed">
              {content.cta_section_body || `Every event is a one-of-a-kind experience. Tell us about your vision and we'll be in touch within 24 hours.`}
            </p>
            {content.cta_urgency_line && (
              <p className="text-sm font-medium mt-3" style={{ color: pri }}>
                {content.cta_urgency_line}
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 md:p-10 border border-gray-100">
            <EventInquiryForm
              siteId={siteId}
              primaryColor={pri}
              businessName={businessName}
            />
          </div>
        </div>
      </section>

      {/* ── Contact bar ─────────────────────────────────────────────────────── */}
      <section id="contact" className="py-16 px-6" style={{ backgroundColor: sec }}>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8 text-white/80">
          {opts.show_phone && content.business_phone && (
            <div className="flex items-center gap-3">
              <Phone size={18} className="flex-shrink-0 opacity-70" />
              <span className="text-sm">{content.business_phone}</span>
            </div>
          )}
          {opts.show_address && content.business_address && (
            <div className="flex items-center gap-3">
              <MapPin size={18} className="flex-shrink-0 opacity-70" />
              <span className="text-sm">{content.business_address}</span>
            </div>
          )}
          {opts.show_hours && content.business_hours && (
            <div className="flex items-center gap-3">
              <Clock size={18} className="flex-shrink-0 opacity-70" />
              <span className="text-sm">{content.business_hours}</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            {branding.logoUrl && opts.show_footer_logo && (
              <img src={branding.logoUrl} alt={businessName} className="h-6 w-auto object-contain opacity-60" />
            )}
            {opts.show_footer_name && (
              <span className="font-medium text-gray-600">{businessName}</span>
            )}
          </div>
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <p className="text-xs opacity-60">Powered by mytCreative</p>
        </div>
      </footer>

      {/* ── Settings FAB ────────────────────────────────────────────────────── */}
      {slug && (
        <a
          href={window.location.pathname.startsWith('/site/') ? `/site/${slug}/admin` : '/admin'}
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white transition-opacity hover:opacity-90 z-50"
          style={{ backgroundColor: pri }}
          title="Manage site"
          aria-label="Site settings"
        >
          <Settings size={18} />
        </a>
      )}
    </div>
  );
}
