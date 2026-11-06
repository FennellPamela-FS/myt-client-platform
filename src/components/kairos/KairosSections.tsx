import type { CSSProperties } from 'react';
import type { SiteBranding } from '../../types/database';
import { GOOGLE_FONT_STACKS } from '../site/SiteRenderer';
import { kairosPalette, resolveKairosLink, sectionHasContent, videoEmbedUrl, type KairosSection } from '../../lib/kairos';

export function KairosFontLinks({ branding }: { branding: SiteBranding }) {
  const fonts = [branding.fontDisplay, branding.fontBody, branding.fontAccent]
    .filter((f): f is string => !!f && f in GOOGLE_FONT_STACKS);
  if (!fonts.length) return null;
  const href = `https://fonts.googleapis.com/css2?${[...new Set(fonts)].map(f => `family=${GOOGLE_FONT_STACKS[f]}`).join('&')}&display=swap`;
  return <link rel="stylesheet" href={href} />;
}

function Paragraphs({ text, style }: { text: string; style?: CSSProperties }) {
  return (
    <div className="space-y-4">
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="text-base md:text-lg leading-relaxed whitespace-pre-line" style={style}>{p}</p>
      ))}
    </div>
  );
}

function Placeholder({ label, muted }: { label: string; muted: string }) {
  return (
    <p className="text-sm italic border border-dashed rounded-lg px-4 py-3" style={{ color: muted, borderColor: muted }}>
      {label}
    </p>
  );
}

type Props = {
  sections: KairosSection[];
  branding: SiteBranding;
  slug: string;
  /** Editor preview: show hints for empty sections instead of hiding them. */
  preview?: boolean;
};

export default function KairosSections({ sections, branding, slug, preview = false }: Props) {
  const pal = kairosPalette(branding);
  const headingStyle: CSSProperties = { color: pal.text, fontFamily: pal.displayFont };
  const bodyStyle: CSSProperties = { color: pal.muted };
  const visible = preview ? sections : sections.filter(sectionHasContent);

  return (
    <>
      {visible.map((s, index) => {
        const empty = !sectionHasContent(s);
        const alt = index % 2 === 1;
        const sectionBg = alt ? pal.altBg : 'transparent';

        switch (s.type) {
          case 'hero': {
            const hasImage = !!s.imageUrl;
            return (
              <section
                key={s.id}
                className="relative overflow-hidden"
                style={hasImage ? undefined : { background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }}
              >
                {hasImage && (
                  <>
                    <img src={s.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50" />
                  </>
                )}
                <div className="relative max-w-4xl mx-auto px-6 py-24 md:py-32 text-center text-white">
                  {s.headline || preview ? (
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight" style={{ fontFamily: pal.displayFont }}>
                      {s.headline || 'Your headline'}
                    </h1>
                  ) : null}
                  {s.subheadline && <p className="mt-5 text-lg md:text-xl text-white/85 whitespace-pre-line">{s.subheadline}</p>}
                </div>
              </section>
            );
          }

          case 'text':
            return (
              <section key={s.id} style={{ backgroundColor: sectionBg }}>
                <div className="max-w-3xl mx-auto px-6 py-16 md:py-20">
                  {s.heading && <h2 className="text-2xl md:text-3xl font-bold mb-6" style={headingStyle}>{s.heading}</h2>}
                  {s.body ? <Paragraphs text={s.body} style={bodyStyle} /> : preview && <Placeholder label="Write this part in your own words." muted={pal.muted} />}
                </div>
              </section>
            );

          case 'image_text': {
            const imageFirst = s.imagePosition === 'left';
            return (
              <section key={s.id} style={{ backgroundColor: sectionBg }}>
                <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
                  <div className={imageFirst ? 'md:order-1' : 'md:order-2'}>
                    {s.imageUrl ? (
                      <img src={s.imageUrl} alt={s.imageAlt} className="w-full rounded-2xl object-cover aspect-[4/3]" />
                    ) : preview ? (
                      <div className="w-full aspect-[4/3] rounded-2xl border border-dashed flex items-center justify-center text-sm italic"
                        style={{ borderColor: pal.muted, color: pal.muted }}>Add a photo</div>
                    ) : null}
                  </div>
                  <div className={imageFirst ? 'md:order-2' : 'md:order-1'}>
                    {s.heading && <h2 className="text-2xl md:text-3xl font-bold mb-6" style={headingStyle}>{s.heading}</h2>}
                    {s.body ? <Paragraphs text={s.body} style={bodyStyle} /> : preview && <Placeholder label="Write this part in your own words." muted={pal.muted} />}
                  </div>
                </div>
              </section>
            );
          }

          case 'photo_gallery': {
            const photos = s.photos.filter(p => p.url);
            return (
              <section key={s.id} style={{ backgroundColor: sectionBg }}>
                <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
                  {s.heading && <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={headingStyle}>{s.heading}</h2>}
                  {photos.length ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((p, i) => (
                        <figure key={i}>
                          <img src={p.url} alt={p.caption} className="w-full aspect-square object-cover rounded-xl" />
                          {p.caption && <figcaption className="mt-2 text-sm" style={bodyStyle}>{p.caption}</figcaption>}
                        </figure>
                      ))}
                    </div>
                  ) : preview && <Placeholder label="Add photos to this gallery." muted={pal.muted} />}
                </div>
              </section>
            );
          }

          case 'stats': {
            const items = s.items.filter(i => i.value.trim());
            return (
              <section key={s.id} style={{ backgroundColor: sectionBg }}>
                <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center">
                  {s.heading && <h2 className="text-2xl md:text-3xl font-bold mb-10" style={headingStyle}>{s.heading}</h2>}
                  {items.length ? (
                    <div className="flex flex-wrap justify-center gap-x-16 gap-y-8">
                      {items.map((item, i) => (
                        <div key={i}>
                          <p className="text-4xl md:text-5xl font-bold" style={{ color: branding.primaryColor, fontFamily: pal.displayFont }}>{item.value}</p>
                          <p className="mt-2 text-sm uppercase tracking-wider" style={bodyStyle}>{item.label}</p>
                        </div>
                      ))}
                    </div>
                  ) : preview && <Placeholder label="Add your numbers." muted={pal.muted} />}
                </div>
              </section>
            );
          }

          case 'video': {
            const embed = videoEmbedUrl(s.url);
            return (
              <section key={s.id} style={{ backgroundColor: sectionBg }}>
                <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
                  {s.heading && <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={headingStyle}>{s.heading}</h2>}
                  {embed ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                      <iframe src={embed} title={s.heading || 'Video'} className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  ) : s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: branding.primaryColor }}>Watch the video</a>
                  ) : preview && <Placeholder label="Paste a YouTube or Vimeo link." muted={pal.muted} />}
                  {s.caption && <p className="mt-4 text-sm text-center" style={bodyStyle}>{s.caption}</p>}
                </div>
              </section>
            );
          }

          case 'cta_banner':
            return (
              <section key={s.id} style={{ backgroundColor: branding.secondaryColor }}>
                <div className="max-w-3xl mx-auto px-6 py-16 md:py-20 text-center text-white">
                  {s.heading && <h2 className="text-2xl md:text-4xl font-bold" style={{ fontFamily: pal.displayFont }}>{s.heading}</h2>}
                  {s.body && <p className="mt-4 text-lg text-white/85 whitespace-pre-line">{s.body}</p>}
                  {s.buttonText && (
                    <a href={resolveKairosLink(s.buttonUrl, slug)}
                      className="inline-block mt-8 px-8 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: branding.primaryColor }}>
                      {s.buttonText}
                    </a>
                  )}
                  {preview && empty && <p className="mt-4 text-sm italic text-white/70">Add a heading or a sentence.</p>}
                </div>
              </section>
            );
        }
      })}
    </>
  );
}
