import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ClientSite, SiteContent, resolveSiteContent } from '../types/database';
import { Save, LogOut, Eye, Sparkles } from 'lucide-react';

const FIELD_GROUPS = [
  {
    label: 'Hero Section',
    fields: ['hero_headline', 'hero_subheadline', 'hero_cta_primary', 'hero_cta_secondary', 'hero_value_statement'],
  },
  {
    label: 'About Section',
    fields: ['about_headline', 'about_body', 'about_mission', 'about_cta_text', 'about_tagline'],
  },
  {
    label: 'Service 1',
    fields: ['service_1_name', 'service_1_description', 'service_1_benefit', 'service_1_cta'],
  },
  {
    label: 'Service 2',
    fields: ['service_2_name', 'service_2_description', 'service_2_benefit', 'service_2_cta'],
  },
  {
    label: 'Service 3',
    fields: ['service_3_name', 'service_3_description', 'service_3_benefit', 'service_3_cta'],
  },
  {
    label: 'Service 4',
    fields: ['service_4_name', 'service_4_description', 'service_4_benefit', 'service_4_cta'],
  },
  {
    label: 'Why Choose Us',
    fields: ['benefit_1_title', 'benefit_1_description', 'benefit_2_title', 'benefit_2_description',
             'benefit_3_title', 'benefit_3_description', 'benefit_4_title', 'benefit_4_description'],
  },
  {
    label: 'Testimonials',
    fields: ['testimonial_1_quote', 'testimonial_1_name', 'testimonial_1_role',
             'testimonial_2_quote', 'testimonial_2_name', 'testimonial_2_role'],
  },
  {
    label: 'Call to Action',
    fields: ['cta_section_headline', 'cta_section_body', 'cta_button_text', 'cta_urgency_line'],
  },
  {
    label: 'Brand & SEO',
    fields: ['brand_tagline', 'meta_description', 'business_email'],
  },
];

function fieldLabel(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isTextarea(key: string) {
  return key.includes('body') || key.includes('quote') || key.includes('description') || key.includes('mission') || key.includes('meta');
}

export default function AdminPortal() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<ClientSite | null>(null);
  const [edits, setEdits] = useState<Partial<SiteContent>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth gate
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
      else setAuthChecked(true);
    });
  }, [navigate]);

  // Load site
  useEffect(() => {
    if (!authChecked || !slug) return;
    supabase
      .from('client_sites')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (data) {
          setSite(data as ClientSite);
          setEdits(data.custom_edits ?? {});
        }
        setLoading(false);
      });
  }, [authChecked, slug]);

  const handleChange = (key: string, value: string) => {
    setEdits((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!site) return;
    setSaving(true);
    await supabase
      .from('client_sites')
      .update({ custom_edits: edits })
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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <span className="font-semibold text-sm">{site.business_name}</span>
            <span className="text-muted-foreground text-sm">· Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={`/site/${slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost text-sm gap-1.5">
              <Eye size={15} /> View Site
            </a>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary text-sm gap-1.5 disabled:opacity-60">
              <Save size={15} /> {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
            </button>
            <button onClick={handleLogout} className="btn btn-ghost text-sm">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Edit Your Site Content</h1>
          <p className="text-muted-foreground text-sm">Changes save instantly. Your site updates live.</p>
        </div>

        {FIELD_GROUPS.map((group) => (
          <div key={group.label} className="card">
            <h2 className="text-base font-semibold mb-4 pb-2 border-b">{group.label}</h2>
            <div className="space-y-4">
              {group.fields.map((key) => {
                const currentVal = (edits[key as keyof SiteContent] ?? content?.[key as keyof SiteContent] ?? '') as string;
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1.5">{fieldLabel(key)}</label>
                    {isTextarea(key) ? (
                      <textarea
                        value={currentVal}
                        onChange={(e) => handleChange(key, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    ) : (
                      <input
                        type="text"
                        value={currentVal}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pb-8 text-center">
          <button onClick={handleSave} disabled={saving} className="btn btn-primary px-10 disabled:opacity-60">
            {saving ? 'Saving…' : saved ? 'All Changes Saved ✓' : 'Save All Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
