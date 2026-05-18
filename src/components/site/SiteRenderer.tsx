import type { SiteContent, SiteBranding, ThemeSelection } from '../../types/database';

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
  previewMode?: boolean;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SiteRenderer({ content, branding, businessName }: Props) {
  const tc = THEME_CONFIGS[branding.theme];
  const isLuxury = branding.theme === 'luxury';

  const heroImg = INDUSTRY_IMAGES[content.industry_category] ?? INDUSTRY_IMAGES.other;

  const cssVars = {
    '--brand-primary': branding.primaryColor,
    '--brand-secondary': branding.secondaryColor,
    '--brand-accent': branding.accentColor,
  } as React.CSSProperties;

  const textColor = isLuxury ? 'text-neutral-100' : 'text-gray-900';
  const mutedColor = isLuxury ? 'text-neutral-400' : 'text-gray-500';

  return (
    <div style={cssVars} className={`font-sans ${isLuxury ? 'bg-neutral-950 text-neutral-100' : 'bg-white text-gray-900'}`}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 ${isLuxury ? 'bg-neutral-950 border-b border-neutral-800' : 'bg-white border-b border-gray-100 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={businessName} className="h-10 w-auto object-contain" />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: branding.primaryColor }}
              >
                {businessName.charAt(0)}
              </div>
            )}
            <span className={`font-semibold text-lg ${isLuxury ? 'text-neutral-100 tracking-widest uppercase text-sm' : ''}`}>
              {businessName}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {['About', 'Services', 'Contact'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`transition-colors ${isLuxury ? 'text-neutral-400 hover:text-neutral-100 tracking-wider uppercase text-xs' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {item}
              </a>
            ))}
          </nav>
          <a
            href={`mailto:${content.business_email}`}
            className={`hidden md:inline-flex px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 ${tc.btnPrimaryClass}`}
            style={{ backgroundColor: branding.primaryColor }}
          >
            {content.hero_cta_primary}
          </a>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      {tc.heroLayout === 'split' ? (
        <section className={`${tc.sectionBg} min-h-[85vh] flex items-center`}>
          <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center w-full">
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
                  href={`mailto:${content.business_email}`}
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
            {/* Right: image */}
            <div className={`relative overflow-hidden ${tc.radiusClass} shadow-2xl h-[480px]`}>
              <img
                src={heroImg}
                alt={businessName}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }}
              />
            </div>
          </div>
        </section>
      ) : (
        /* Luxury: centered hero */
        <section
          className="min-h-screen flex items-center justify-center text-center relative overflow-hidden"
          style={{ background: `linear-gradient(180deg, ${branding.secondaryColor}22 0%, transparent 100%)` }}
        >
          <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
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
      <section id="about" className={`py-24 px-6 ${tc.altSectionBg}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-3xl md:text-4xl mb-6 ${tc.headingClass} ${isLuxury ? 'text-neutral-100' : 'text-gray-900'}`}>
            {content.about_headline}
          </h2>
          <p className={`text-lg mb-6 leading-relaxed ${isLuxury ? 'text-neutral-400' : 'text-gray-600'}`}>
            {content.about_body}
          </p>
          <p className={`text-base italic mb-10 ${isLuxury ? 'text-neutral-500' : 'text-gray-400'}`}>
            {content.about_mission}
          </p>
          <a
            href={`mailto:${content.business_email}`}
            className={`inline-flex px-8 py-3 text-sm text-white transition-opacity hover:opacity-90 ${tc.btnPrimaryClass}`}
            style={{ backgroundColor: branding.primaryColor }}
          >
            {content.about_cta_text}
          </a>
        </div>
      </section>

      {/* ── Services ───────────────────────────────────────────────────── */}
      <section id="services" className={`py-24 px-6 ${tc.sectionBg}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl mb-4 ${tc.headingClass} ${isLuxury ? 'text-neutral-100' : 'text-gray-900'}`}>
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
                <div key={n} className={`p-6 flex flex-col gap-4 ${tc.cardClass}`}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: branding.primaryColor }}>
                    {n}
                  </div>
                  <h3 className={`font-semibold text-lg ${isLuxury ? 'text-neutral-100' : 'text-gray-900'}`}>{name}</h3>
                  <p className={`text-sm flex-1 ${isLuxury ? 'text-neutral-400' : 'text-gray-500'}`}>{desc}</p>
                  <p className="text-xs font-semibold" style={{ color: branding.primaryColor }}>{benefit}</p>
                  <a
                    href={`mailto:${content.business_email}`}
                    className={`text-xs transition-colors hover:opacity-80 ${tc.btnSecondaryClass} px-4 py-2 text-center`}
                    style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
                  >
                    {cta}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────────────────────── */}
      <section className={`py-24 px-6 ${tc.altSectionBg}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-3xl md:text-4xl text-center mb-16 ${tc.headingClass} ${isLuxury ? 'text-neutral-100' : 'text-gray-900'}`}>
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold"
                  style={{ backgroundColor: `${branding.primaryColor}22`, color: branding.primaryColor }}>
                  0{n}
                </div>
                <h3 className={`font-semibold mb-2 ${isLuxury ? 'text-neutral-100' : 'text-gray-900'}`}>
                  {content[`benefit_${n}_title` as keyof SiteContent]}
                </h3>
                <p className={`text-sm ${isLuxury ? 'text-neutral-400' : 'text-gray-500'}`}>
                  {content[`benefit_${n}_description` as keyof SiteContent]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className={`py-24 px-6 ${tc.sectionBg}`}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-3xl md:text-4xl text-center mb-16 ${tc.headingClass} ${isLuxury ? 'text-neutral-100' : 'text-gray-900'}`}>
            What Clients Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map(n => (
              <div key={n} className={`p-8 ${tc.cardClass}`}>
                <div className="text-3xl mb-4" style={{ color: branding.primaryColor }}>"</div>
                <p className={`text-base italic mb-6 leading-relaxed ${isLuxury ? 'text-neutral-300' : 'text-gray-600'}`}>
                  {content[`testimonial_${n}_quote` as keyof SiteContent]}
                </p>
                <div>
                  <p className={`font-semibold ${isLuxury ? 'text-neutral-100' : 'text-gray-900'}`}>
                    {content[`testimonial_${n}_name` as keyof SiteContent]}
                  </p>
                  <p className={`text-sm ${isLuxury ? 'text-neutral-500' : 'text-gray-400'}`}>
                    {content[`testimonial_${n}_role` as keyof SiteContent]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section
        id="contact"
        className="py-24 px-6 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className={`text-3xl md:text-5xl mb-6 ${tc.headingClass}`}>
            {content.cta_section_headline}
          </h2>
          <p className="text-lg mb-10 opacity-90">{content.cta_section_body}</p>
          <a
            href={`mailto:${content.business_email}`}
            className={`inline-flex px-12 py-4 bg-white font-semibold transition-opacity hover:opacity-90 ${tc.btnPrimaryClass}`}
            style={{ color: branding.primaryColor }}
          >
            {content.cta_button_text}
          </a>
          <p className="mt-6 text-sm opacity-70">{content.cta_urgency_line}</p>
        </div>
      </section>

    </div>
  );
}
