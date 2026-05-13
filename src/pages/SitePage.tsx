import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ClientSite } from '../types/database';
import { resolveSiteContent } from '../types/database';

export default function SitePage() {
  const { slug } = useParams<{ slug: string }>();
  const [site, setSite] = useState<ClientSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('client_sites')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setSite(data as ClientSite);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !site) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-3xl font-bold">Site not found</h1>
      <p className="text-muted-foreground">This site doesn't exist or hasn't been activated yet.</p>
    </div>
  );

  const content = resolveSiteContent(site);
  if (!content) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Site content is being generated. Check back shortly.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <p className="text-primary font-medium mb-3">{content.brand_tagline}</p>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{content.hero_headline}</h1>
        <p className="text-xl text-muted-foreground mb-4">{content.hero_subheadline}</p>
        <p className="text-muted-foreground mb-8">{content.hero_value_statement}</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href={`mailto:${content.business_email}`} className="btn btn-primary">{content.hero_cta_primary}</a>
          <a href="#about" className="btn btn-outline">{content.hero_cta_secondary}</a>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{content.about_headline}</h2>
          <p className="text-muted-foreground mb-4">{content.about_body}</p>
          <p className="text-sm text-muted-foreground italic mb-6">{content.about_mission}</p>
          <a href={`mailto:${content.business_email}`} className="btn btn-primary">{content.about_cta_text}</a>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Services</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => {
              const name = content[`service_${n}_name` as keyof typeof content];
              const desc = content[`service_${n}_description` as keyof typeof content];
              const benefit = content[`service_${n}_benefit` as keyof typeof content];
              const cta = content[`service_${n}_cta` as keyof typeof content];
              if (!name) return null;
              return (
                <div key={n} className="card">
                  <h3 className="font-semibold text-lg mb-2">{name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{desc}</p>
                  <p className="text-sm font-medium text-primary mb-4">{benefit}</p>
                  <a href={`mailto:${content.business_email}`} className="btn btn-outline text-sm">{cta}</a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="text-center">
                <h3 className="font-semibold mb-2">{content[`benefit_${n}_title` as keyof typeof content]}</h3>
                <p className="text-muted-foreground text-sm">{content[`benefit_${n}_description` as keyof typeof content]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Clients Say</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="card">
                <p className="text-muted-foreground italic mb-4">"{content[`testimonial_${n}_quote` as keyof typeof content]}"</p>
                <p className="font-semibold">{content[`testimonial_${n}_name` as keyof typeof content]}</p>
                <p className="text-sm text-muted-foreground">{content[`testimonial_${n}_role` as keyof typeof content]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">{content.cta_section_headline}</h2>
          <p className="mb-8 opacity-90">{content.cta_section_body}</p>
          <a href={`mailto:${content.business_email}`} className="btn bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3">
            {content.cta_button_text}
          </a>
          <p className="mt-4 text-sm opacity-75">{content.cta_urgency_line}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm text-muted-foreground border-t">
        <p>© {new Date().getFullYear()} {site.business_name} · <a href={`mailto:${content.business_email}`} className="hover:text-foreground">{content.business_email}</a></p>
        <p className="mt-2">
          <Link to={`/site/${slug}/admin`} className="hover:text-foreground transition-colors">Manage site</Link>
        </p>
      </footer>
    </div>
  );
}
