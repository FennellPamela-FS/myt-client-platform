export type ThemeSelection =
  | 'professional'
  | 'creative'
  | 'wellness'
  | 'luxury'
  | 'minimalist'
  | 'innovative';

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
  contact_form_subtitle: string;
  contact_form_button_text: string;
  booking_url: string;
  business_email: string;
  industry_category: string;
  theme_selection: string;
  // Social media links (shown in footer; client-filled)
  social_instagram: string;
  social_facebook: string;
  social_twitter: string;
  social_linkedin: string;
  // Innovative theme stat counters (editable in Admin → About section)
  stat_1_value: string;
  stat_1_label: string;
  stat_2_value: string;
  stat_2_label: string;
  stat_3_value: string;
  stat_3_label: string;
};

export type DisplayOptions = {
  show_phone: boolean;
  show_address: boolean;
  show_hours: boolean;
  show_contact_form: boolean;
  show_nav_logo: boolean;
  show_nav_name: boolean;
  nav_show_tagline: boolean;   // show brand_tagline beneath logo in the nav header
  show_footer_logo: boolean;
  show_footer_name: boolean;
  use_booking_cta: boolean;
  hero_media_type: 'image' | 'video';
  hero_image_ratio: 'default' | '16:9';  // default ≈ fixed 480px height; 16:9 = responsive widescreen
  hero_bg_mirror: boolean;
  about_layout: 'standard' | 'three-column';  // three-column = image | text | stats
  about_show_media: boolean;                   // show/hide the image in the about section
};

export const DEFAULT_DISPLAY_OPTIONS: DisplayOptions = {
  show_phone: true,
  show_address: true,
  show_hours: true,
  show_contact_form: true,
  show_nav_logo: true,
  show_nav_name: true,
  nav_show_tagline: false,
  show_footer_logo: true,
  show_footer_name: true,
  use_booking_cta: false,
  hero_media_type: 'image',
  hero_image_ratio: 'default',
  hero_bg_mirror: false,
  about_layout: 'standard',
  about_show_media: true,
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
  hero_image_url: string | null;
  hero_video_url: string | null;
  about_image_url: string | null;
  gallery_images: string[] | null;
  status: 'active' | 'inactive' | 'pending';
  /** Kairos Award: number of premium expansion modules unlocked (0 = standard plan). */
  bonus_page_allocation: number;
  created_at: string;
};

export type SiteBranding = {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  theme: ThemeSelection;
  heroImageUrl: string | null;
  heroVideoUrl: string | null;
  aboutImageUrl: string | null;
  galleryImages: string[];
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
    heroImageUrl: site.hero_image_url ?? null,
    heroVideoUrl: site.hero_video_url ?? null,
    aboutImageUrl: site.about_image_url ?? null,
    galleryImages: site.gallery_images ?? [],
  };
}

// ─── Culinary feature types ───────────────────────────────────────────────────

export type EventInquiry = {
  id: string;
  site_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  event_type: string | null;
  guest_count: number | null;
  estimated_budget: string | null;
  dietary_restrictions: string[];
  vision_notes: string | null;
  status: 'new' | 'contacted' | 'booked' | 'declined';
  created_at: string;
};

export type MenuItem = {
  id: string;
  site_id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  created_at: string;
};

export const CULINARY_CATEGORIES = new Set([
  'private_chef', 'catering', 'food_truck', 'farm_to_table',
  'culinary', 'chef', 'caterer', 'food_and_beverage',
]);

export type Database = {
  public: {
    Tables: {
      client_sites_saas: {
        Row: ClientSite;
        Insert: Omit<ClientSite, 'id' | 'created_at' | 'bonus_page_allocation'> & { bonus_page_allocation?: number };
        Update: Partial<Omit<ClientSite, 'id' | 'created_at'>>;
        Relationships: [];
      };
      event_inquiries: {
        Row: EventInquiry;
        Insert: Omit<EventInquiry, 'id' | 'created_at' | 'status'>;
        Update: Partial<Omit<EventInquiry, 'id' | 'created_at'>>;
        Relationships: [];
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, 'id' | 'created_at'>;
        Update: Partial<Omit<MenuItem, 'id' | 'created_at'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
