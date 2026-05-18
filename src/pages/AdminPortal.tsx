import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ClientSite, SiteContent, ThemeSelection, DisplayOptions } from '../types/database';
import { DEFAULT_DISPLAY_OPTIONS } from '../types/database';
import { resolveSiteContent } from '../types/database';
import SiteRenderer from '../components/site/SiteRenderer';
import {
  Save, LogOut, Eye, EyeOff, Upload, Palette,
  Layout, Type, Briefcase, Star, MessageSquare, Megaphone, Search, Menu, X, Phone, ToggleLeft, ToggleRight
} from 'lucide-react';

// ─── Section groups ───────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: 'branding', label: 'Branding', icon: Palette, fields: [] },
  { id: 'hero', label: 'Hero Section', icon: Layout, fields: ['hero_headline', 'hero_subheadline', 'hero_cta_primary', 'hero_cta_secondary', 'hero_value_statement'] },
  { id: 'about', label: 'About', icon: Type, fields: ['about_headline', 'about_body', 'about_mission', 'about_cta_text', 'about_tagline'] },
  { id: 'services', label: 'Services', icon: Briefcase, fields: ['service_1_name', 'service_1_description', 'service_1_benefit', 'service_1_cta', 'service_2_name', 'service_2_description', 'service_2_benefit', 'service_2_cta', 'service_3_name', 'service_3_description', 'service_3_benefit', 'service_3_cta', 'service_4_name', 'service_4_description', 'service_4_benefit', 'service_4_cta'] },
  { id: 'benefits', label: 'Why Us', icon: Star, fields: ['benefit_1_title', 'benefit_1_description', 'benefit_2_title', 'benefit_2_description', 'benefit_3_title', 'benefit_3_description', 'benefit_4_title', 'benefit_4_description'] },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare, fields: ['testimonial_1_quote', 'testimonial_1_name', 'testimonial_1_role', 'testimonial_2_quote', 'testimonial_2_name', 'testimonial_2_role'] },
  { id: 'cta', label: 'Call to Action', icon: Megaphone, fields: ['cta_section_headline', 'cta_section_body', 'cta_button_text', 'cta_urgency_line'] },
  { id: 'contact_info', label: 'Contact Info', icon: Phone, fields: ['business_phone', 'business_address', 'business_hours', 'contact_form_title'] },
  { id: 'seo', label: 'SEO & Brand', icon: Search, fields: ['brand_tagline', 'meta_description', 'business_email'] },
];

const THEMES: { value: ThemeSelection; label: string; desc: string }[] = [
  { value: 'professional', label: 'Professional', desc: 'Clean, corporate, trust-building' },
  { value: 'creative', label: 'Creative', desc: 'Bold, expressive, design-forward' },
  { value: 'wellness', label: 'Wellness', desc: 'Calm, nurturing, organic' },
  { value: 'luxury', label: 'Luxury', desc: 'Premium, refined, elegant' },
  { value: 'minimalist', label: 'Minimalist', desc: 'Simple, spacious, focused' },
];

function fieldLabel(key: string) {
  return key.replace(/_\d+_?/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
}

function isTextarea(key: string) {
  return key.includes('body') || key.includes('quote') || key.includes('description') || key.includes('mission') || key.includes('meta');
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminPortal() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [site, setSite] = useState<ClientSite | null>(null);
  const [edits, setEdits] = useState<Partial<SiteContent>>({});
  const [primaryColor, setPrimaryColor] = useState('#4EBCED');
  const [secondaryColor, setSecondaryColor] = useState('#464E54');
  const [accentColor, setAccentColor] = useState('#45899E');
  const [theme, setTheme] = useState<ThemeSelection>('professional');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(DEFAULT_DISPLAY_OPTIONS);

  const [activeSection, setActiveSection] = useState('branding');
  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
      else setAuthChecked(true);
    });
  }, [navigate]);

  useEffect(() => {
    if (!authChecked || !slug) return;
    supabase
      .from('client_sites_saas')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (data) {
          const s = data as unknown as ClientSite;
          setSite(s);
          setEdits(s.custom_edits ?? {});
          setPrimaryColor(s.primary_color || '#4EBCED');
          setSecondaryColor(s.secondary_color || '#464E54');
          setAccentColor(s.accent_color || '#45899E');
          setTheme(s.theme || 'professional');
          setLogoUrl(s.logo_url ?? null);
          setDisplayOptions({ ...DEFAULT_DISPLAY_OPTIONS, ...(s.display_options ?? {}) });
        }
        setLoading(false);
      });
  }, [authChecked, slug]);

  const handleChange = (key: string, value: string) => {
    setEdits(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !site) return;
    setLogoUploading(true);
    const ext = file.name.split('.').pop();
    const path = `logos/${site.id}.${ext}`;
    const { error } = await supabase.storage
      .from('client-assets')
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('client-assets').getPublicUrl(path);
      setLogoUrl(data.publicUrl);
      setSaved(false);
    }
    setLogoUploading(false);
  };

  const handleSave = async () => {
    if (!site) return;
    setSaving(true);
    await (supabase.from('client_sites_saas') as any)
      .update({
        custom_edits: edits,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        theme,
        logo_url: logoUrl,
        display_options: displayOptions,
      })
      .eq('id', site.id);
    setSaving(false);
    setSaved(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading || !authChecked) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!site) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Site not found.</p>
    </div>
  );

  const content = resolveSiteContent(site);
  const liveContent = content ? { ...content, ...edits } as SiteContent : null;
  const liveBranding = { logoUrl, primaryColor, secondaryColor, accentColor, theme };
  const currentSection = NAV_SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b z-20 sticky top-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: primaryColor }}>
              {site.business_name.charAt(0)}
            </div>
            <span className="font-semibold text-sm hidden sm:block">{site.business_name}</span>
            <span className="text-muted-foreground text-sm hidden sm:block">· Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn btn-ghost text-sm gap-1.5 hidden md:flex"
            >
              {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <a href={`/site/${slug}`} target="_blank" rel="noreferrer"
              className="btn btn-ghost text-sm gap-1.5 hidden md:flex">
              <Eye size={15} /> View Live
            </a>
            <button onClick={handleSave} disabled={saving}
              className="btn btn-primary text-sm gap-1.5 disabled:opacity-60">
              <Save size={15} />
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
            </button>
            <button onClick={handleLogout} className="btn btn-ghost text-sm p-2">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar nav ─────────────────────────────────────────────── */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-10 bg-white border-r w-56 flex flex-col
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          top-[57px] md:top-0
        `}>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_SECTIONS.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => { setActiveSection(section.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                    ${activeSection === section.id
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  style={activeSection === section.id ? { backgroundColor: primaryColor } : {}}
                >
                  <Icon size={16} />
                  {section.label}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t">
            <button onClick={handleSave} disabled={saving}
              className="w-full btn btn-primary text-sm justify-center disabled:opacity-60">
              <Save size={14} className="mr-1" />
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </aside>

        {/* ── Edit panel ──────────────────────────────────────────────── */}
        <main className="flex-1 flex overflow-hidden">
          <div className={`overflow-y-auto p-6 ${showPreview ? 'w-full md:w-[420px]' : 'w-full max-w-2xl mx-auto'} flex-shrink-0`}>

            {/* Branding section */}
            {activeSection === 'branding' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Branding</h2>
                  <p className="text-sm text-muted-foreground">Logo, brand colors, and site theme</p>
                </div>

                {/* Logo upload */}
                <div className="card">
                  <h3 className="font-medium mb-3 text-sm">Logo</h3>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain rounded border p-2 bg-gray-50" />
                    ) : (
                      <div className="h-16 w-16 rounded border bg-gray-50 flex items-center justify-center text-gray-300">
                        <Upload size={20} />
                      </div>
                    )}
                    <div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={logoUploading}
                        className="btn btn-outline text-sm disabled:opacity-60"
                      >
                        {logoUploading ? 'Uploading…' : logoUrl ? 'Change Logo' : 'Upload Logo'}
                      </button>
                      <p className="text-xs text-muted-foreground mt-1">PNG or JPG, max 2MB</p>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>

                {/* Color pickers */}
                <div className="card space-y-4">
                  <h3 className="font-medium text-sm">Brand Colors</h3>
                  {[
                    { label: 'Primary Color', value: primaryColor, setter: setPrimaryColor, hint: 'Main buttons, links, accents' },
                    { label: 'Secondary Color', value: secondaryColor, setter: setSecondaryColor, hint: 'Text, backgrounds, nav' },
                    { label: 'Accent Color', value: accentColor, setter: setAccentColor, hint: 'Gradients, highlights, hover states' },
                  ].map(({ label, value, setter, hint }) => (
                    <div key={label}>
                      <label className="block text-sm font-medium mb-1.5">{label}</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={value}
                          onChange={e => { setter(e.target.value); setSaved(false); }}
                          className="h-10 w-10 rounded-lg border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={e => { setter(e.target.value); setSaved(false); }}
                          className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                          placeholder="#4EBCED"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
                    </div>
                  ))}

                  {/* Color preview */}
                  <div className="mt-2 flex gap-2">
                    {[primaryColor, secondaryColor, accentColor].map((c, i) => (
                      <div key={i} className="flex-1 h-8 rounded-md" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                {/* Theme picker */}
                <div className="card">
                  <h3 className="font-medium text-sm mb-3">Site Theme</h3>
                  <div className="space-y-2">
                    {THEMES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => { setTheme(t.value); setSaved(false); }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors text-left
                          ${theme === t.value ? 'border-current' : 'border-gray-200 hover:border-gray-300'}`}
                        style={theme === t.value ? { borderColor: primaryColor } : {}}
                      >
                        <div>
                          <p className="text-sm font-medium">{t.label}</p>
                          <p className="text-xs text-muted-foreground">{t.desc}</p>
                        </div>
                        {theme === t.value && (
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content sections */}
            {activeSection !== 'branding' && currentSection && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold mb-1">{currentSection.label}</h2>
                  <p className="text-sm text-muted-foreground">Edit the content for this section</p>
                </div>

                {/* Contact info visibility toggles */}
                {activeSection === 'contact_info' && (
                  <div className="card space-y-3">
                    <h3 className="font-medium text-sm">Show / Hide</h3>
                    {([
                      { key: 'show_nav_logo', label: 'Logo in navigation' },
                      { key: 'show_nav_name', label: 'Business name in navigation' },
                      { key: 'show_footer_logo', label: 'Logo in footer' },
                      { key: 'show_footer_name', label: 'Business name in footer' },
                      { key: 'show_phone', label: 'Phone number' },
                      { key: 'show_address', label: 'Business address' },
                      { key: 'show_hours', label: 'Business hours' },
                      { key: 'show_contact_form', label: 'Contact form section' },
                    ] as { key: keyof DisplayOptions; label: string }[]).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => { setDisplayOptions(prev => ({ ...prev, [key]: !prev[key] })); setSaved(false); }}
                        className="w-full flex items-center justify-between py-2 text-sm"
                      >
                        <span>{label}</span>
                        {displayOptions[key]
                          ? <ToggleRight size={22} style={{ color: primaryColor }} />
                          : <ToggleLeft size={22} className="text-gray-300" />}
                      </button>
                    ))}
                  </div>
                )}

                {currentSection.fields.map(key => {
                  const currentVal = (edits[key as keyof SiteContent] ?? content?.[key as keyof SiteContent] ?? '') as string;
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1.5">{fieldLabel(key)}</label>
                      {isTextarea(key) ? (
                        <textarea
                          value={currentVal}
                          onChange={e => handleChange(key, e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentVal}
                          onChange={e => handleChange(key, e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Live preview ──────────────────────────────────────────── */}
          {showPreview && liveContent && (
            <div className="hidden md:flex flex-1 border-l flex-col overflow-hidden">
              <div className="px-4 py-2 bg-gray-100 border-b flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="flex-1 text-center bg-white rounded px-3 py-0.5 border text-gray-500">
                  {window.location.origin}/site/{slug}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="origin-top-left scale-[0.75] w-[133%]">
                  <SiteRenderer
                    content={liveContent}
                    branding={liveBranding}
                    businessName={site.business_name}
                    displayOptions={displayOptions}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
