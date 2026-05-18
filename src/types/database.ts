export type ThemeSelection =
  | 'professional'
  | 'creative'
  | 'wellness'
  | 'luxury'
  | 'minimalist';

export type SiteContent = {
  hero_headline: string;
  hero_subheadline: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_value_statement: string;
  about_headline: string;
  about_body: string;
  about_mission: string;
  about_cta_text: string;
  about_tagline: string;
  service_1_name: string; service_1_description: string; service_1_benefit: string; service_1_cta: string;
  service_2_name: string; service_2_description: string; service_2_benefit: string; service_2_cta: string;
  service_3_name: string; service_3_description: string; service_3_benefit: string; service_3_cta: string;
  service_4_name: string; service_4_description: string; service_4_benefit: string; service_4_cta: string;
  benefit_1_title: string; benefit_1_description: string;
  benefit_2_title: string; benefit_2_description: string;
  benefit_3_title: string; benefit_3_description: string;
  benefit_4_title: string; benefit_4_description: string;
  testimonial_1_quote: string; testimonial_1_name: string; testimonial_1_role: string;
  testimonial_2_quote: string; testimonial_2_name: string; testimonial_2_role: string;
  cta_section_headline: string;
  cta_section_body: string;
  cta_button_text: string;
  cta_urgency_line: string;
  meta_description: string;
  brand_tagline: string;
  business_phone: string;
  business_address: string;
  business_hours: string;
  contact_form_title: string;
  business_email: string;
  industry_category: string;
  theme_selection: string;
};

export type DisplayOptions = {
  show_phone: boolean;
  show_address: boolean;
  show_hours: boolean;
  show_contact_form: boolean;
};

export const DEFAULT_DISPLAY_OPTIONS: DisplayOptions = {
  show_phone: true,
  show_address: true,
  show_hours: true,
  show_contact_form: true,
};

export type ClientSite = {
  id: string;
  location_id: string;
  email: string;
  business_name: string;
  slug: string;
  custom_domain: string | null;
  theme: ThemeSelection;
  industry: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  generated_copy: SiteContent | null;
  custom_edits: Partial<SiteContent> | null;
  display_options: DisplayOptions | null;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
};

export type SiteBranding = {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  theme: ThemeSelection;
};

export function resolveSiteContent(site: ClientSite): SiteContent | null {
  if (!site.generated_copy) return null;
  return { ...site.generated_copy, ...(site.custom_edits ?? {}) };
}

export function resolveBranding(site: ClientSite): SiteBranding {
  return {
    logoUrl: site.logo_url ?? null,
    primaryColor: site.primary_color || '#4EBCED',
    secondaryColor: site.secondary_color || '#464E54',
    accentColor: site.accent_color || '#45899E',
    theme: site.theme || 'professional',
  };
}

export type Database = {
  public: {
    Tables: {
      client_sites_saas: {
        Row: ClientSite;
        Insert: Omit<ClientSite, 'id' | 'created_at'>;
        Update: Partial<Omit<ClientSite, 'id' | 'created_at'>>;
      };
    };
  };
};
