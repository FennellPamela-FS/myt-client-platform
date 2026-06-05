import { useState } from 'react';
import { Settings, Phone, MapPin, Clock } from 'lucide-react';
import type { SiteContent, SiteBranding, ThemeSelection, DisplayOptions } from '../../types/database';
import { DEFAULT_DISPLAY_OPTIONS, CULINARY_CATEGORIES } from '../../types/database';
import CulinaryTemplate from '../culinary/CulinaryTemplate';

// ─── YouTube helpers ─────────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function HeroMedia({ src, className, background = false }: { src: string; className: string; background?: boolean }) {
  const ytId = getYouTubeId(src);
  if (ytId) {
    const params = background
      ? `autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&playsinline=1`
      : `autoplay=1&mute=1&controls=1&modestbranding=1&playsinline=1&rel=0`;
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?${params}`}
        allow="autoplay; fullscreen"
        title="Hero video"
        className={className}
        style={{ border: 'none', pointerEvents: background ? 'none' : 'auto' }}
      />
    );
  }
  if (background) {
    return <video src={src} autoPlay muted loop playsInline className={className} />;
  }
  return <video src={src} autoPlay muted controls playsInline className={className} />;
}

// ─── Theme config ────────────────────────────────────────────────────────────

type ThemeConfig = {
  heroLayout: 'split' | 'centered';
  headingClass: string;
  subheadingClass: string;
  btnPrimaryClass: string;
  btnSecondaryClass: string;
  sectionBg: string;
  altSectionBg: string;
  cardClass: string;
  radiusClass: string;
};

const THEME_CONFIGS: Record<ThemeSelection, ThemeConfig> = {
  professional: {
    heroLayout: 'split',
    headingClass: 'font-bold tracking-tight',
    subheadingClass: 'font-normal',
    btnPrimaryClass: 'rounded-lg font-semibold',
    btnSecondaryClass: 'rounded-lg border-2 font-semibold',
    sectionBg: 'bg-white',
    altSectionBg: 'bg-gray-50',
    cardClass: 'bg-white border border-gray-100 shadow-sm rounded-xl',
    radiusClass: 'rounded-xl',
  },
  creative: {
    heroLayout: 'split',
    headingClass: 'font-black tracking-tighter',
    subheadingClass: 'font-medium',
    btnPrimaryClass: 'rounded-full font-bold',
    btnSecondaryClass: 'rounded-full border-2 font-bold',
    sectionBg: 'bg-white',
    altSectionBg: 'bg-gray-950',
    cardClass: 'bg-white border-2 shadow-lg rounded-2xl',
    radiusClass: 'rounded-2xl',
  },
  wellness: {
    heroLayout: 'split',
    headingClass: 'font-semibold tracking-wide',
    subheadingClass: 'font-light',
    btnPrimaryClass: 'rounded-full font-medium',
    btnSecondaryClass: 'rounded-full border font-medium',
    sectionBg: 'bg-stone-50',
    altSectionBg: 'bg-white',
    cardClass: 'bg-white shadow-sm rounded-3xl border border-stone-100',
    radiusClass: 'rounded-3xl',
  },
  luxury: {
    heroLayout: 'centered',
    headingClass: 'font-bold tracking-widest uppercase',
    subheadingClass: 'font-light tracking-wider',
    btnPrimaryClass: 'rounded-none font-semibold tracking-widest uppercase text-sm',
    btnSecondaryClass: 'rounded-none border font-semibold tracking-widest uppercase text-sm',
    sectionBg: 'bg-neutral-950',
    altSectionBg: 'bg-neutral-900',
    cardClass: 'bg-neutral-900 border border-neutral-700 rounded-none',
    radiusClass: 'rounded-none',
  },
  minimalist: {
    heroLayout: 'split',
    headingClass: 'font-light tracking-tight',
    subheadingClass: 'font-light',
    btnPrimaryClass: 'rounded-none font-normal text-sm',
    btnSecondaryClass: 'rounded-none border font-normal text-sm',
    sectionBg: 'bg-white',
    altSectionBg: 'bg-gray-50',
    cardClass: 'bg-white border border-gray-200 rounded-none',
    radiusClass: 'rounded-none',
  },
  innovative: {
    heroLayout: 'centered',
    headingClass: 'font-black tracking-widest uppercase',
    subheadingClass: 'font-bold tracking-wide uppercase',
    btnPrimaryClass: 'rounded font-bold tracking-widest uppercase text-sm',
    btnSecondaryClass: 'rounded border-2 font-bold tracking-widest uppercase text-sm',
    sectionBg: 'bg-slate-950',
    altSectionBg: 'bg-slate-900',
    cardClass: 'bg-slate-900 border border-slate-700 rounded',
    radiusClass: 'rounded',
  },
};

// ─── Industry hero images (Unsplash, royalty-free) ──────────────────────────

const INDUSTRY_IMAGES: Record<string, string> = {
  home_services: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  medical: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
  legal: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80',
  beauty: 'https://images.unsplash.com/photo-1560066984-138daaa74436?w=800&q=80',
  automotive: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
  marketing: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  real_estate: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  financial: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
  education: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
  ecommerce: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  coaching: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  dental: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
  chiropractic: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  other: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
};

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = {
  content: SiteContent;
  branding: SiteBranding;
  businessName: string;
  slug?: string;
  siteId?: string;
  displayOptions?: DisplayOptions | null;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SiteRenderer({ content, branding, businessName, slug, siteId, displayOptions }: Props) {
  // ── Culinary vertical → dedicated template ──────────────────────────────────
  if (siteId && CULINARY_CATEGORIES.has(content.industry_category)) {
    return (
      <CulinaryTemplate
        content={content}
        branding={branding}
        businessName={businessName}
        slug={slug ?? ''}
        siteId={siteId}
        displayOptions={displayOptions}
      />
    );
  }

  const tc = THEME_CONFIGS[branding.theme];
  const isLuxury     = branding.theme === 'luxury';
  const isCreative   = branding.theme === 'creative';
  const isInnovative = branding.theme === 'innovative';
  // Both luxury and innovative use dark root backgrounds — light text required throughout
  const isDarkTheme  = isLuxury || isInnovative;
  // creative + luxury + innovative all use dark altSectionBg
  const isDarkAltBg  = isDarkTheme || isCreative;
  const opts = { ...DEFAULT_DISPLAY_OPTIONS, ...(displayOptions ?? {}) };
  const [formSent, setFormSent]       = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]     = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [bookingOpen, setBookingOpen] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) return;
    setFormLoading(true);
    setFormError('');
    const [firstName, ...rest] = formData.name.trim().split(' ');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/site-contact-form`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            Authorization:   `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            siteId,
            firstName: firstName || '',
            lastName:  rest.join(' ') || '',
            email:     formData.email.trim().toLowerCase(),
            phone:     formData.phone.trim(),
            service:   formData.service,
            message:   formData.message.trim(),
          }),
        }
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setFormSent(true);
    } catch (err) {
      setFormError('Something went wrong. Please try again or contact us directly.');
      console.error('[contact-form]', err);
    } finally {
      setFormLoading(false);
    }
  };

  const heroImg = branding.heroImageUrl || INDUSTRY_IMAGES[content.industry_category] || INDUSTRY_IMAGES.other;
  const heroVideo = opts.hero_media_type === 'video' ? branding.heroVideoUrl : null;
  const showBgMirror = opts.hero_bg_mirror && !!heroImg;
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const cssVars = {
    '--brand-primary': branding.primaryColor,
    '--brand-secondary': branding.secondaryColor,
    '--brand-accent': branding.accentColor,
  } as React.CSSProperties;

  const textColor = isDarkTheme ? 'text-neutral-100' : 'text-gray-900';
  const mutedColor = isDarkTheme ? 'text-neutral-400' : 'text-gray-500';

  return (
    <div style={cssVars} className={`font-sans ${isDarkTheme ? `${tc.sectionBg} text-neutral-100` : 'bg-white text-gray-900'}`}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 ${isDarkTheme ? `${tc.sectionBg} border-b ${isInnovative ? 'border-slate-800' : 'border-neutral-800'}` : 'bg-white border-b border-gray-100 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon or logo */}
            {opts.show_nav_logo && (
              branding.logoUrl ? (
                <img src={branding.logoUrl} alt={businessName} className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: branding.primaryColor }}>
                  {businessName.charAt(0)}
                </div>
              )
            )}
            {/* Text block: name and/or tagline (tagline only visible alongside a logo) */}
            {(opts.show_nav_name || (branding.logoUrl && opts.nav_show_tagline)) && (
              <div className="flex flex-col leading-tight">
                {opts.show_nav_name && (
                  <span className={`font-semibold ${isDarkTheme ? 'text-neutral-100 tracking-widest uppercase text-sm' : 'text-lg'}`}>
                    {businessName}
                  </span>
                )}
                {branding.logoUrl && opts.nav_show_tagline && content.brand_tagline && (
                  <span className={`text-xs ${isDarkTheme ? 'text-neutral-400' : 'text-gray-500'}`}>
                    {content.brand_tagline}
                  </span>
                )}
              </div>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {['Home', 'About', 'Services', 'Contact'].map(item => (
              <a
                key={item}
                href={item === 'Home' ? '#' : `#${item.toLowerCase()}`}
                className={`transition-colors ${isDarkTheme ? 'text-neutral-400 hover:text-neutral-100 tracking-wider uppercase text-xs' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {item}
              </a>
            ))}
          </nav>
          <a
            href="#contact"
            className={`hidden md:inline-flex px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 ${tc.btnPrimaryClass}`}
            style={{ backgroundColor: branding.primaryColor }}
          >
            {content.hero_cta_primary}
          </a>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      {isInnovative ? (
        /* ── Innovative hero: graphic LEFT, headline RIGHT, radial glow ── */
        <section className="min-h-[85vh] flex items-center relative overflow-hidden bg-slate-950">
          {/* Subtle color depth layer */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${branding.primaryColor}0a 0%, transparent 45%, ${branding.accentColor}08 100%)` }} />
          {/* Radial glow behind graphic */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 28% 50%, ${branding.primaryColor}22 0%, transparent 55%)` }} />

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Left: image/graphic */}
            <div className={`relative overflow-hidden ${tc.radiusClass} shadow-2xl ${
              opts.hero_image_ratio === '16:9' ? 'aspect-[16/9] w-full' : 'h-[480px]'
            }`}
              style={{ background: `linear-gradient(135deg, ${branding.primaryColor}22, ${branding.accentColor}33)` }}>
              {heroVideo
                ? <HeroMedia src={heroVideo} className="w-full h-full object-cover" />
                : <img src={heroImg} alt={businessName} className="w-full h-full object-cover" />}
              {/* Color tint overlay */}
              <div className="absolute inset-0 opacity-20 mix-blend-color"
                style={{ background: `radial-gradient(circle at center, ${branding.primaryColor}, transparent 70%)` }} />
              {/* Bottom edge accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.accentColor})` }} />
            </div>

            {/* Right: copy */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4"
                style={{ color: branding.primaryColor }}>
                {content.brand_tagline}
              </p>
              <h1 className={`text-4xl md:text-6xl mb-6 leading-tight ${tc.headingClass} ${textColor}`}>
                {content.hero_headline}
              </h1>
              <p className={`text-lg mb-4 font-bold tracking-wide uppercase`}
                style={{ color: branding.accentColor }}>
                {content.hero_subheadline}
              </p>
              <p className="text-base mb-10 text-neutral-400">{content.hero_value_statement}</p>
              <div className="flex flex-wrap gap-4">
                <a href="#contact"
                  className={`px-8 py-3 text-white text-sm transition-opacity hover:opacity-90 ${tc.btnPrimaryClass}`}
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }}>
                  {content.hero_cta_primary}
                </a>
                <a href="#about"
                  className={`px-8 py-3 text-sm transition-colors ${tc.btnSecondaryClass}`}
                  style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}>
                  {content.hero_cta_secondary}
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : tc.heroLayout === 'split' ? (
        <section className={`${tc.sectionBg} min-h-[85vh] flex items-center relative overflow-hidden`}>
          {/* Faint background mirror */}
          {showBgMirror && (
            <div
              className="absolute inset-0 bg-cover bg-center scale-110"
              style={{ backgroundImage: `url(${heroImg})`, opacity: 0.07, filter: 'blur(20px)' }}
            />
          )}
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Left: copy */}
            <div>
              <p className={`text-sm font-semibold uppercase tracking-widest mb-4`}
                style={{ color: branding.primaryColor }}>
                {content.brand_tagline}
              </p>
              <h1 className={`text-4xl md:text-6xl mb-6 leading-tight ${tc.headingClass} ${textColor}`}>
                {content.hero_headline}
              </h1>
              <p className={`text-xl mb-4 ${mutedColor} ${tc.subheadingClass}`}>
                {content.hero_subheadline}
              </p>
              <p className={`text-base mb-10 ${mutedColor}`}>
                {content.hero_value_statement}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#contact"
                  className={`px-8 py-3 text-white text-sm transition-opacity hover:opacity-90 ${tc.btnPrimaryClass}`}
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  {content.hero_cta_primary}
                </a>
                <a
                  href="#about"
                  className={`px-8 py-3 text-sm transition-colors ${tc.btnSecondaryClass}`}
                  style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
                >
                  {content.hero_cta_secondary}
                </a>
              </div>
            </div>
            {/* Right: image or video */}
            <div
              className={`relative overflow-hidden ${tc.radiusClass} shadow-2xl ${
                heroVideo
                  ? 'aspect-[16/9] w-full'
                  : opts.hero_image_ratio === '16:9'
                  ? 'aspect-[16/9] w-full'
                  : 'h-[480px]'
              }`}
              style={{ background: `linear-gradient(135deg, ${branding.primaryColor}33, ${branding.accentColor}55)` }}
            >
              {heroVideo
                ? <HeroMedia src={heroVideo} className="w-full h-full object-cover" />
                : <img src={heroImg} alt={businessName} className="w-full h-full object-cover" />
              }
              {/* Gradient overlay for images only — hides behind video to keep controls accessible */}
              {!heroVideo && (
                <div
                  className="absolute inset-0 opacity-30"
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }}
                />
              )}
            </div>
          </div>
        </section>
      ) : (
        /* Luxury: centered hero */
        <section
          className="min-h-screen flex items-center justify-center text-center relative overflow-hidden"
          style={{ background: `linear-gradient(180deg, ${branding.secondaryColor}22 0%, transparent 100%)` }}
        >
          {heroVideo
            ? <HeroMedia src={heroVideo} className="absolute inset-0 w-full h-full object-cover opacity-20" background />
            : <img src={heroImg} alt="" className={`absolute inset-0 w-full h-full object-cover ${showBgMirror ? 'opacity-20' : 'opacity-10'}`} />
          }
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
            <p className="text-xs tracking-[0.4em] uppercase mb-8 text-neutral-400">{content.brand_tagline}</p>
            <h1 className={`text-5xl md:text-7xl mb-8 leading-tight ${tc.headingClass}`}
              style={{ color: branding.primaryColor }}>
              {content.hero_headline}
            </h1>
            <p className={`text-lg mb-4 text-neutral-300 ${tc.subheadingClass}`}>{content.hero_subheadline}</p>
            <p className="text-sm text-neutral-500 mb-12">{content.hero_value_statement}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href={`mailto:${content.business_email}`}
                className={`px-10 py-4 text-xs transition-opacity hover:opacity-90 ${tc.btnPrimaryClass}`}
                style={{ backgroundColor: branding.primaryColor, color: '#fff' }}>
                {content.hero_cta_primary}
              </a>
              <a href="#about"
                className={`px-10 py-4 text-xs text-neutral-300 transition-colors hover:text-white ${tc.btnSecondaryClass}`}
                style={{ borderColor: branding.accentColor }}>
                {content.hero_cta_secondary}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── About ──────────────────────────────────────────────────────── */}
      {opts.about_layout === 'three-column' ? (
        /* ── 3-column about: image | text | stats (any theme) ── */
        <section id="about" className={`py-24 px-6 ${tc.altSectionBg} relative`}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${branding.primaryColor}, ${branding.accentColor}, transparent)` }} />
          <div className={`max-w-7xl mx-auto grid gap-10 items-start ${opts.about_show_media !== false ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {/* Col 1: image — only shown when about_show_media is on */}
            {opts.about_show_media !== false && (
            <div className={`relative overflow-hidden rounded aspect-video ${isDarkAltBg ? 'bg-slate-800' : 'bg-gray-100'}`}>
              {(branding.aboutImageUrl || branding.heroImageUrl)
                ? <img src={branding.aboutImageUrl || branding.heroImageUrl!} alt={businessName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl font-black tracking-widest"
                    style={{ color: `${branding.primaryColor}60` }}>
                    {businessName.charAt(0)}
                  </div>}
              <div className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.accentColor})` }} />
            </div>
            )}
            {/* Col 2: text */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3"
                style={{ color: branding.primaryColor }}>{content.about_tagline}</p>
              <h2 className={`text-2xl md:text-3xl mb-4 ${tc.headingClass} ${isDarkAltBg ? 'text-neutral-100' : 'text-gray-900'}`}>
                {content.about_headline}
              </h2>
              <p className={`text-sm leading-relaxed mb-4 ${isDarkAltBg ? 'text-neutral-300' : 'text-gray-600'}`}>{content.about_body}</p>
              <p className={`text-sm italic mb-6 ${isDarkAltBg ? 'text-neutral-500' : 'text-gray-400'}`}>{content.about_mission}</p>
              <a href="#benefits"
                className={`inline-flex px-6 py-2.5 text-sm text-white transition-opacity hover:opacity-90 ${tc.btnPrimaryClass}`}
                style={{ backgroundColor: branding.primaryColor }}>
                {content.about_cta_text}
              </a>
            </div>
            {/* Col 3: stat counters */}
            {(content.stat_1_value || content.stat_2_value || content.stat_3_value) && (
              <div className="space-y-8 md:pl-6 md:border-l"
                style={{ borderColor: `${branding.primaryColor}40` }}>
                {[
                  { v: content.stat_1_value, l: content.stat_1_label },
                  { v: content.stat_2_value, l: content.stat_2_label },
                  { v: content.stat_3_value, l: content.stat_3_label },
                ].filter(s => s.v).map((stat, i) => (
                  <div key={i}>
                    <p className="text-3xl font-black tracking-tight leading-none"
                      style={{ color: branding.primaryColor }}>{stat.v}</p>
                    <p className="text-xs font-bold tracking-[0.2em] uppercase mt-1.5"
                      style={{ color: branding.accentColor }}>{stat.l}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${branding.accentColor}, ${branding.primaryColor}, transparent)` }} />
        </section>
      ) : (
        <section id="about" className={`py-24 px-6 ${tc.altSectionBg}`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-3xl md:text-4xl mb-6 ${tc.headingClass} ${isDarkAltBg ? 'text-neutral-100' : 'text-gray-900'}`}>
              {content.about_headline}
            </h2>
            <p className={`text-lg mb-6 leading-relaxed ${isDarkAltBg ? 'text-neutral-300' : 'text-gray-600'}`}>
              {content.about_body}
            </p>
            <p className={`text-base italic mb-10 ${isDarkAltBg ? 'text-neutral-400' : 'text-gray-400'}`}>
              {content.about_mission}
            </p>
            <a
              href="#benefits"
              className={`inline-flex px-8 py-3 text-sm text-white transition-opacity hover:opacity-90 ${tc.btnPrimaryClass}`}
              style={{ backgroundColor: branding.primaryColor }}
            >
              {content.about_cta_text}
            </a>
          </div>
        </section>
      )}

      {/* ── Services ───────────────────────────────────────────────────── */}
      <section id="services" className={`py-24 px-6 ${tc.sectionBg}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl mb-4 ${tc.headingClass} ${isDarkTheme ? 'text-neutral-100' : 'text-gray-900'}`}>
              Services
            </h2>
            <div className="w-16 h-1 mx-auto" style={{ backgroundColor: branding.primaryColor }} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => {
              const name = content[`service_${n}_name` as keyof SiteContent];
              const desc = content[`service_${n}_description` as keyof SiteContent];
              const benefit = content[`service_${n}_benefit` as keyof SiteContent];
              const cta = content[`service_${n}_cta` as keyof SiteContent];
              if (!name) return null;
              return (
                <div key={n} className={`flex flex-col gap-4 ${tc.cardClass} overflow-hidden`}>
                  {/* Innovative: gradient top bar */}
                  {isInnovative && (
                    <div className="h-0.5 w-full -mt-px"
                      style={{ background: n % 2 === 1
                        ? `linear-gradient(90deg, ${branding.primaryColor}, ${branding.accentColor})`
                        : `linear-gradient(90deg, ${branding.accentColor}, ${branding.primaryColor})` }} />
                  )}
                  <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className={`w-10 h-10 flex items-center justify-center text-sm font-black ${isInnovative ? 'rounded' : 'rounded-lg'} text-white`}
                    style={{ background: isInnovative
                      ? `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})`
                      : branding.primaryColor }}>
                    {n}
                  </div>
                  <h3 className={`font-semibold text-lg ${isDarkTheme ? 'text-neutral-100' : 'text-gray-900'}`}
                    style={isInnovative ? { color: branding.primaryColor } : undefined}>{name}</h3>
                  <p className={`text-sm flex-1 ${isDarkTheme ? 'text-neutral-400' : 'text-gray-500'}`}>{desc}</p>
                  <p className="text-xs font-semibold" style={{ color: isInnovative ? branding.accentColor : branding.primaryColor }}>{benefit}</p>
                  <a
                    href={`mailto:${content.business_email}`}
                    className={`text-xs transition-colors hover:opacity-80 ${tc.btnSecondaryClass} px-4 py-2 text-center`}
                    style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
                  >
                    {cta}
                  </a>
                  </div>{/* close inner p-6 div for innovative */}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Gallery ────────────────────────────────────────────────────── */}
      {branding.galleryImages.length > 0 && (
        <section className={`py-24 px-6 ${tc.altSectionBg}`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-4xl mb-4 ${tc.headingClass} ${isDarkTheme ? 'text-neutral-100' : 'text-gray-900'}`}>
                Our Work
              </h2>
              <div className="w-16 h-1 mx-auto" style={{ backgroundColor: branding.primaryColor }} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {branding.galleryImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxSrc(src)}
                  className={`group relative overflow-hidden ${tc.radiusClass} aspect-square focus:outline-none`}
                >
                  <img
                    src={src}
                    alt={`Gallery photo ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">View</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Benefits ───────────────────────────────────────────────────── */}
      {(isInnovative || opts.about_layout === 'three-column') ? (
        /* ── High-impact benefits: numbered grid with alternating accent colors ── */
        <section id="benefits" className={`py-24 px-6 ${tc.altSectionBg} relative`}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${branding.primaryColor}, ${branding.accentColor}, transparent)` }} />
          <div className="max-w-7xl mx-auto">
            <h2 className={`text-3xl md:text-4xl text-center mb-16 ${tc.headingClass} ${isDarkAltBg ? 'text-neutral-100' : 'text-gray-900'}`}>
              Why Choose Us
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(n => {
                const accentCol = n % 2 === 1 ? branding.primaryColor : branding.accentColor;
                return (
                  <div key={n} className={`flex items-start gap-5 p-6 ${tc.radiusClass} border ${isDarkAltBg ? 'bg-slate-900' : 'bg-white'}`}
                    style={{ borderColor: `${accentCol}40` }}>
                    <div className="text-3xl font-black flex-shrink-0 leading-none mt-0.5"
                      style={{ color: accentCol }}>0{n}</div>
                    <div>
                      <h3 className={`font-black tracking-wide uppercase text-sm mb-2 ${isDarkAltBg ? 'text-neutral-100' : 'text-gray-900'}`}>
                        {content[`benefit_${n}_title` as keyof SiteContent]}
                      </h3>
                      <p className={`text-sm ${isDarkAltBg ? 'text-neutral-400' : 'text-gray-500'}`}>
                        {content[`benefit_${n}_description` as keyof SiteContent]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section id="benefits" className={`py-24 px-6 ${tc.altSectionBg}`}>
          <div className="max-w-7xl mx-auto">
            <h2 className={`text-3xl md:text-4xl text-center mb-16 ${tc.headingClass} ${isDarkAltBg ? 'text-neutral-100' : 'text-gray-900'}`}>
              Why Choose Us
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 font-bold"
                    style={{ backgroundColor: `${branding.primaryColor}33`, color: branding.primaryColor }}>
                    0{n}
                  </div>
                  <h3 className={`font-semibold mb-2 ${isDarkAltBg ? 'text-neutral-100' : 'text-gray-900'}`}>
                    {content[`benefit_${n}_title` as keyof SiteContent]}
                  </h3>
                  <p className={`text-sm ${isDarkAltBg ? 'text-neutral-400' : 'text-gray-500'}`}>
                    {content[`benefit_${n}_description` as keyof SiteContent]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className={`py-24 px-6 ${tc.sectionBg}`}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-3xl md:text-4xl text-center mb-16 ${tc.headingClass} ${isDarkTheme ? 'text-neutral-100' : 'text-gray-900'}`}>
            What Clients Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map(n => (
              <div key={n} className={`p-8 ${tc.cardClass}`}>
                <div className="text-3xl mb-4" style={{ color: branding.primaryColor }}>"</div>
                <p className={`text-base italic mb-6 leading-relaxed ${isDarkTheme ? 'text-neutral-300' : 'text-gray-600'}`}>
                  {content[`testimonial_${n}_quote` as keyof SiteContent]}
                </p>
                <div>
                  <p className={`font-semibold ${isDarkTheme ? 'text-neutral-100' : 'text-gray-900'}`}>
                    {content[`testimonial_${n}_name` as keyof SiteContent]}
                  </p>
                  <p className={`text-sm ${isDarkTheme ? 'text-neutral-500' : 'text-gray-400'}`}>
                    {content[`testimonial_${n}_role` as keyof SiteContent]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ─────────────────────────────────────────────────── */}
      {isInnovative ? (
        /* ── Innovative CTA: hero image overlay + outline button ── */
        <section className="py-28 px-6 text-white text-center relative overflow-hidden bg-slate-950">
          {heroImg && (
            <div className="absolute inset-0 bg-cover bg-center opacity-15"
              style={{ backgroundImage: `url(${heroImg})` }} />
          )}
          <div className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${branding.primaryColor}55 0%, ${branding.accentColor}40 100%)` }} />
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${branding.primaryColor}, ${branding.accentColor}, transparent)` }} />
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4"
              style={{ color: branding.primaryColor }}>{content.cta_urgency_line}</p>
            <h2 className={`text-3xl md:text-5xl mb-6 ${tc.headingClass} text-neutral-100`}>
              {content.cta_section_headline}
            </h2>
            <p className="text-lg mb-10 text-neutral-300">{content.cta_section_body}</p>
            {opts.use_booking_cta && content.booking_url ? (
              <button onClick={() => setBookingOpen(true)}
                className={`inline-flex px-12 py-4 border-2 font-bold tracking-widest uppercase text-sm rounded transition-all hover:text-slate-950`}
                style={{ borderColor: branding.primaryColor, color: branding.primaryColor,
                  ['--hover-bg' as string]: branding.primaryColor }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = branding.primaryColor; (e.currentTarget as HTMLElement).style.color = '#0f172a'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = branding.primaryColor; }}>
                {content.cta_button_text}
              </button>
            ) : (
              <a href="#contact"
                className={`inline-flex px-12 py-4 border-2 font-bold tracking-widest uppercase text-sm rounded transition-all`}
                style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = branding.primaryColor; (e.currentTarget as HTMLElement).style.color = '#0f172a'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = branding.primaryColor; }}>
                {content.cta_button_text}
              </a>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${branding.accentColor}, ${branding.primaryColor}, transparent)` }} />
        </section>
      ) : (
        <section
          className="py-24 px-6 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}
        >
          <div className="max-w-3xl mx-auto">
            <h2 className={`text-3xl md:text-5xl mb-6 ${tc.headingClass}`}>
              {content.cta_section_headline}
            </h2>
            <p className="text-lg mb-10 opacity-90">{content.cta_section_body}</p>
            {opts.use_booking_cta && content.booking_url ? (
              <button
                onClick={() => setBookingOpen(true)}
                className={`inline-flex px-12 py-4 bg-white font-semibold transition-opacity hover:opacity-90 ${tc.btnPrimaryClass}`}
                style={{ color: branding.primaryColor }}
              >
                {content.cta_button_text}
              </button>
            ) : (
              <a
                href="#contact"
                className={`inline-flex px-12 py-4 bg-white font-semibold transition-opacity hover:opacity-90 ${tc.btnPrimaryClass}`}
                style={{ color: branding.primaryColor }}
              >
                {content.cta_button_text}
              </a>
            )}
            <p className="mt-6 text-sm opacity-70">{content.cta_urgency_line}</p>
          </div>
        </section>
      )}

      {/* ── Contact form ───────────────────────────────────────────────── */}
      {opts.show_contact_form && (
        <section id="contact" className={`py-24 px-6 ${isDarkTheme ? `${tc.altSectionBg}` : 'bg-gray-50'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-4xl mb-4 ${tc.headingClass} ${isDarkTheme ? 'text-neutral-100' : 'text-gray-900'}`}>
                {content.contact_form_title || 'Get Your Free Estimate'}
              </h2>
              <p className={`${isDarkTheme ? 'text-neutral-400' : 'text-gray-500'}`}>
                {content.contact_form_subtitle || 'Ready to get started? Fill out the form and we\'ll get back to you within 24 hours.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Form */}
              <div className={`p-8 ${tc.cardClass}`}>
                {formSent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                      style={{ backgroundColor: `${branding.primaryColor}22`, color: branding.primaryColor }}>
                      ✓
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${isDarkTheme ? 'text-neutral-100' : 'text-gray-900'}`}>
                      Message Sent!
                    </h3>
                    <p className={isDarkTheme ? 'text-neutral-400' : 'text-gray-500'}>
                      We'll be in touch within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDarkTheme ? 'text-neutral-300' : 'text-gray-700'}`}>First Name *</label>
                        <input required value={formData.name.split(' ')[0]} onChange={e => setFormData(p => ({ ...p, name: e.target.value + ' ' + (p.name.split(' ')[1] || '') }))}
                          className={`w-full px-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 ${isDarkTheme ? 'bg-neutral-800 border-neutral-700 text-neutral-100 focus:ring-neutral-500' : 'bg-white border-gray-200 focus:ring-primary'}`}
                          placeholder="John" />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDarkTheme ? 'text-neutral-300' : 'text-gray-700'}`}>Last Name *</label>
                        <input required value={formData.name.split(' ')[1] || ''} onChange={e => setFormData(p => ({ ...p, name: (p.name.split(' ')[0] || '') + ' ' + e.target.value }))}
                          className={`w-full px-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 ${isDarkTheme ? 'bg-neutral-800 border-neutral-700 text-neutral-100 focus:ring-neutral-500' : 'bg-white border-gray-200 focus:ring-primary'}`}
                          placeholder="Doe" />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDarkTheme ? 'text-neutral-300' : 'text-gray-700'}`}>Email *</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        className={`w-full px-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 ${isDarkTheme ? 'bg-neutral-800 border-neutral-700 text-neutral-100 focus:ring-neutral-500' : 'bg-white border-gray-200 focus:ring-primary'}`}
                        placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDarkTheme ? 'text-neutral-300' : 'text-gray-700'}`}>Phone *</label>
                      <input required type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        className={`w-full px-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 ${isDarkTheme ? 'bg-neutral-800 border-neutral-700 text-neutral-100 focus:ring-neutral-500' : 'bg-white border-gray-200 focus:ring-primary'}`}
                        placeholder="(555) 123-4567" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDarkTheme ? 'text-neutral-300' : 'text-gray-700'}`}>Service Interested In</label>
                      <select value={formData.service} onChange={e => setFormData(p => ({ ...p, service: e.target.value }))}
                        className={`w-full px-3 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 ${isDarkTheme ? 'bg-neutral-800 border-neutral-700 text-neutral-100 focus:ring-neutral-500' : 'bg-white border-gray-200 focus:ring-primary'}`}>
                        <option value="">Select a service</option>
                        {[1, 2, 3, 4].map(n => {
                          const name = content[`service_${n}_name` as keyof SiteContent];
                          return name ? <option key={n} value={name}>{name}</option> : null;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDarkTheme ? 'text-neutral-300' : 'text-gray-700'}`}>Message</label>
                      <textarea rows={4} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                        className={`w-full px-3 py-2.5 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 ${isDarkTheme ? 'bg-neutral-800 border-neutral-700 text-neutral-100 focus:ring-neutral-500' : 'bg-white border-gray-200 focus:ring-primary'}`}
                        placeholder="Tell us about your project…" />
                    </div>
                    {formError && (
                      <p className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2">{formError}</p>
                    )}
                    <button type="submit"
                      disabled={formLoading}
                      className={`w-full py-3 text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed ${tc.btnPrimaryClass}`}
                      style={{ backgroundColor: branding.primaryColor }}>
                      {formLoading ? 'Sending…' : (content.contact_form_button_text || 'Get Free Estimate')}
                    </button>
                  </form>
                )}
              </div>

              {/* Get in touch */}
              <div className="space-y-6">
                <div>
                  <h3 className={`text-xl font-semibold mb-4 ${isDarkTheme ? 'text-neutral-100' : 'text-gray-900'}`}>
                    Get In Touch
                  </h3>
                  <div className="space-y-3">
                    {opts.show_phone && content.business_phone && (
                      <div className="flex items-center gap-3">
                        <Phone size={16} style={{ color: branding.primaryColor }} />
                        <span className={`text-sm ${isDarkTheme ? 'text-neutral-300' : 'text-gray-600'}`}>{content.business_phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: branding.primaryColor }}>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <a href={`mailto:${content.business_email}`} className={`text-sm hover:underline ${isDarkTheme ? 'text-neutral-300' : 'text-gray-600'}`}>{content.business_email}</a>
                    </div>
                    {opts.show_address && content.business_address && (
                      <div className="flex items-start gap-3">
                        <MapPin size={16} style={{ color: branding.primaryColor }} className="mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${isDarkTheme ? 'text-neutral-300' : 'text-gray-600'}`}>{content.business_address}</span>
                      </div>
                    )}
                    {opts.show_hours && content.business_hours && (
                      <div className="flex items-center gap-3">
                        <Clock size={16} style={{ color: branding.primaryColor }} />
                        <span className={`text-sm ${isDarkTheme ? 'text-neutral-300' : 'text-gray-600'}`}>{content.business_hours}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Why choose us box */}
                <div className={`p-6 ${tc.radiusClass}`}
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor}dd, ${branding.accentColor}dd)` }}>
                  <h4 className="font-semibold text-white mb-4">Why Choose Us?</h4>
                  <ul className="space-y-2">
                    {[1, 2, 3, 4].map(n => {
                      const title = content[`benefit_${n}_title` as keyof SiteContent];
                      return title ? (
                        <li key={n} className="flex items-center gap-2 text-sm text-white/90">
                          <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                          {title}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className={`${isDarkTheme ? tc.sectionBg : 'bg-gray-900'} text-white relative`}>
        {/* Innovative: gradient top border */}
        {isInnovative && (
          <div className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.accentColor}, ${branding.primaryColor})` }} />
        )}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              {(opts.show_footer_logo || opts.show_footer_name) && (
                <div className="flex items-center gap-3 mb-4">
                  {opts.show_footer_logo && (
                    branding.logoUrl ? (
                      <img src={branding.logoUrl} alt={businessName} className="h-10 w-auto object-contain" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: branding.primaryColor }}>
                        {businessName.charAt(0)}
                      </div>
                    )
                  )}
                  {opts.show_footer_name && (
                    <span className="font-semibold text-lg">{businessName}</span>
                  )}
                </div>
              )}
              <p className="text-gray-400 text-sm leading-relaxed">{content.about_tagline}</p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Quick Links</h4>
              <ul className="space-y-2">
                {['Home', 'About', 'Services', 'Contact'].map(link => (
                  <li key={link}>
                    <a href={link === 'Home' ? '#' : link === 'Contact' ? '#contact' : `#${link.toLowerCase()}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect — email, phone, social links */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Connect</h4>
              <ul className="space-y-3 mb-5">
                {content.business_email && (
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <a href={`mailto:${content.business_email}`} className="hover:text-white transition-colors">{content.business_email}</a>
                  </li>
                )}
                {opts.show_phone && content.business_phone && (
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone size={14} /><span>{content.business_phone}</span>
                  </li>
                )}
              </ul>
              {/* Social links */}
              {(content.social_instagram || content.social_facebook || content.social_twitter || content.social_linkedin) && (
                <div className="flex flex-wrap gap-3">
                  {[
                    { url: content.social_instagram, label: 'Instagram' },
                    { url: content.social_facebook,  label: 'Facebook'  },
                    { url: content.social_twitter,   label: 'Twitter'   },
                    { url: content.social_linkedin,  label: 'LinkedIn'  },
                  ].filter(s => s.url).map(({ url, label }) => (
                    <a key={label} href={url.startsWith('http') ? url : `https://${url}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 rounded px-2.5 py-1"
                      style={{ ['--hover-color' as string]: branding.primaryColor }}>
                      {label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-gray-500">
            <span>© {new Date().getFullYear()} {businessName}. All Rights Reserved.</span>
            <span style={{ color: branding.primaryColor }} className="text-xs">Powered by mytCreative</span>
          </div>
        </div>
      </footer>

      {/* ── Settings FAB ────────────────────────────────────────────────── */}
      {slug && (
        <a
          // On a custom domain the path starts at "/" — use /admin.
          // On the platform (myt-client-platform.netlify.app) path is /site/:slug — use full path.
          href={window.location.pathname.startsWith('/site/') ? `/site/${slug}/admin` : '/admin'}
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white transition-opacity hover:opacity-90 z-50"
          style={{ backgroundColor: branding.primaryColor }}
          title="Manage site"
          aria-label="Site settings"
        >
          <Settings size={18} />
        </a>
      )}

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors text-lg"
            aria-label="Close"
          >
            ✕
          </button>
          <img
            src={lightboxSrc}
            alt="Gallery"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Booking modal ───────────────────────────────────────────────── */}
      {bookingOpen && content.booking_url && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setBookingOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '90vh' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <span className="font-semibold text-sm" style={{ color: branding.primaryColor }}>
                {content.cta_button_text}
              </span>
              <button
                onClick={() => setBookingOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {/* Iframe embed */}
            <iframe
              src={content.booking_url}
              title="Booking"
              className="flex-1 w-full border-0"
              style={{ minHeight: '560px' }}
              allow="camera; microphone; fullscreen"
            />
            {/* Fallback link in case iframe is blocked */}
            <div className="px-5 py-3 border-t text-center">
              <a
                href={content.booking_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs hover:underline"
                style={{ color: branding.primaryColor }}
              >
                Having trouble? Open in a new tab →
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
