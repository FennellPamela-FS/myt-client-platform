import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const LOGO_URL =
  'https://storage.googleapis.com/msgsndr/5WkCjdNQApiEdU3hlSMc/media/87a37730-dc12-4597-b730-6b76ecf537f6.png';

// ─── Content model ─────────────────────────────────────────────────────────
// Mirrors the `guide_sections.blocks` jsonb shape. Rows are edited directly
// in the Supabase Table Editor — see supabase/migrations/20260807000001_create_guide_sections.sql.

type Block =
  | { type: 'text'; md: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'toggles'; items: { label: string; desc?: string; on: boolean }[] }
  | { type: 'pills'; items: { label: string; selected: boolean }[] }
  | { type: 'swatches'; colors: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; variant: 'tip' | 'new' | 'kairos'; label: string; md: string; items?: string[]; mdAfter?: string };

type GuideSection = {
  id: string;
  slug: string;
  group_label: string;
  title: string;
  dek: string;
  blocks: Block[];
  sort_order: number;
};

// ─── Inline markdown (bold + code only) ─────────────────────────────────────

function Md({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="px-1 py-0.5 rounded bg-muted text-[0.85em] font-mono">{part.slice(1, -1)}</code>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Small UI replicas (mirror the real AdminPortal Toggle component) ──────

function DemoToggle({ on }: { on: boolean }) {
  return (
    <div
      className="relative flex-shrink-0 w-9 h-5 rounded-full transition-colors"
      style={{ backgroundColor: on ? 'hsl(var(--primary))' : '#D1D5DB' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
        style={{ transform: on ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </div>
  );
}

// ─── Block renderer ──────────────────────────────────────────────────────

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'h3':
      return <h3 className="font-semibold text-sm mt-6 mb-2">{block.text}</h3>;

    case 'text':
      return <p className="text-[0.95rem] leading-relaxed text-foreground/90 max-w-[62ch] mb-3"><Md text={block.md} /></p>;

    case 'ul':
      return (
        <ul className="max-w-[62ch] mb-3 space-y-1.5 list-disc pl-5 text-[0.95rem] leading-relaxed text-foreground/90">
          {block.items.map((item, i) => <li key={i}><Md text={item} /></li>)}
        </ul>
      );

    case 'ol':
      return (
        <ol className="max-w-[62ch] mb-4 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[0.95rem] leading-relaxed text-foreground/90">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center tabular-nums">
                {i + 1}
              </span>
              <span className="pt-0.5"><Md text={item} /></span>
            </li>
          ))}
        </ol>
      );

    case 'toggles':
      return (
        <div className="max-w-[62ch] mb-4 border rounded-xl overflow-hidden bg-card">
          {block.items.map((item, i) => (
            <div key={i} className={`flex items-start justify-between gap-6 px-4 py-3 ${i > 0 ? 'border-t' : ''}`}>
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                {item.desc && <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>}
              </div>
              <DemoToggle on={item.on} />
            </div>
          ))}
        </div>
      );

    case 'pills':
      return (
        <div className="flex flex-wrap gap-2 mb-4">
          {block.items.map((item, i) => (
            <span
              key={i}
              className={`text-sm font-medium px-3.5 py-1.5 rounded-full border ${
                item.selected ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground'
              }`}
            >
              {item.label}
            </span>
          ))}
        </div>
      );

    case 'swatches':
      return (
        <div className="flex gap-2 mb-4">
          {block.colors.map((c, i) => (
            <span key={i} className="w-8 h-8 rounded-lg border" style={{ backgroundColor: c }} />
          ))}
        </div>
      );

    case 'table':
      return (
        <div className="max-w-[62ch] mb-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left border px-3 py-2 bg-muted text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className={`border px-3 py-2 font-mono text-[0.8125rem] ${j === 2 ? 'text-primary font-semibold' : ''}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'callout': {
      const variantClass =
        block.variant === 'kairos'
          ? 'border-l-amber-500 bg-amber-50'
          : 'border-l-primary bg-primary/5';
      const labelClass = block.variant === 'kairos' ? 'text-amber-700' : 'text-primary';
      return (
        <div className={`max-w-[62ch] mb-4 rounded-xl border border-l-4 ${variantClass} px-4 py-3.5 shadow-sm`}>
          <div className={`text-[0.6875rem] font-bold uppercase tracking-wider mb-1.5 ${labelClass}`}>{block.label}</div>
          <p className="text-sm leading-relaxed"><Md text={block.md} /></p>
          {block.items && (
            <ol className="mt-2.5 space-y-2">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white text-primary text-[0.7rem] font-bold flex items-center justify-center tabular-nums mt-0.5">
                    {i + 1}
                  </span>
                  <span><Md text={item} /></span>
                </li>
              ))}
            </ol>
          )}
          {block.mdAfter && <p className="text-sm leading-relaxed mt-2.5"><Md text={block.mdAfter} /></p>}
        </div>
      );
    }
  }
}

// ─── Page ────────────────────────────────────────────────────────────────

export default function Guide() {
  const [sections, setSections] = useState<GuideSection[] | null>(null);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    supabase
      .from('guide_sections')
      .select('*')
      .order('sort_order')
      .then(({ data, error: err }) => {
        if (err) { setError('Could not load the guide right now.'); return; }
        setSections((data as unknown as GuideSection[]) ?? []);
      });
  }, []);

  const groups = useMemo(() => {
    if (!sections) return [];
    const order: string[] = [];
    const map: Record<string, GuideSection[]> = {};
    for (const s of sections) {
      if (!map[s.group_label]) { map[s.group_label] = []; order.push(s.group_label); }
      map[s.group_label].push(s);
    }
    return order.map(label => ({ label, items: map[label] }));
  }, [sections]);

  useEffect(() => {
    if (!sections || !sections.length) return;
    setActiveId(sections[0].slug);
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveId(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  function jumpTo(slug: string) {
    const el = sectionRefs.current[slug];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #464E54 0%, #2e3538 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(78,188,237,0.12) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-12">
          <img src={LOGO_URL} alt="mytCreative" className="h-9 mb-6 select-none" draggable={false} />
          <div className="w-10 h-0.5 rounded-full mb-6" style={{ backgroundColor: '#4EBCED' }} />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Your Website Admin Guide
          </h1>
          <p className="text-base max-w-[46ch]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Everything you need to manage your site &mdash; branding, page content, your contact form, and your domain &mdash; no code required.
          </p>
        </div>
      </header>

      {error && <p className="max-w-5xl mx-auto px-6 py-10 text-destructive text-sm">{error}</p>}

      {!error && !sections && (
        <div className="max-w-5xl mx-auto px-6 py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!error && sections && (
        <>
          {/* Mobile jump nav */}
          <div className="md:hidden sticky top-0 z-10 bg-muted/30 backdrop-blur border-b px-4 py-2.5">
            <select
              className="w-full text-sm font-medium px-3 py-2 rounded-md border border-input bg-background"
              value={activeId ?? ''}
              onChange={e => jumpTo(e.target.value)}
            >
              {groups.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.items.map(s => <option key={s.slug} value={s.slug}>{s.title}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-[200px_1fr] gap-12">
            <nav className="hidden md:block sticky top-6 self-start py-8 max-h-[calc(100vh-3rem)] overflow-y-auto">
              {groups.map(g => (
                <div key={g.label} className="mb-1">
                  <div className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2.5 mt-4 mb-1 first:mt-0">
                    {g.label}
                  </div>
                  {g.items.map(s => (
                    <button
                      key={s.slug}
                      onClick={() => jumpTo(s.slug)}
                      className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg mb-0.5 transition-colors ${
                        activeId === s.slug ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              ))}
            </nav>

            <main className="min-w-0 py-8 pb-24">
              {sections.map(s => (
                <section
                  key={s.slug}
                  id={s.slug}
                  ref={el => { sectionRefs.current[s.slug] = el; }}
                  className="bg-card rounded-xl border p-6 md:p-8 mb-5"
                  style={{ scrollMarginTop: '4.5rem' }}
                >
                  <p className="text-xs font-semibold text-muted-foreground/70 mb-1.5 uppercase tracking-wide">{s.group_label}</p>
                  <h2 className="text-xl font-bold tracking-tight mb-2">{s.title}</h2>
                  {s.dek && <p className="text-muted-foreground max-w-[60ch] mb-4"><Md text={s.dek} /></p>}
                  {s.blocks.map((b, bi) => <BlockView key={bi} block={b} />)}
                </section>
              ))}
            </main>
          </div>
        </>
      )}

      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-10 text-sm text-muted-foreground">
          Your Website Admin Guide &middot; mytCreative Client Platform
        </div>
      </footer>
    </div>
  );
}
