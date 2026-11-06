import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowDown, ArrowUp, Eye, EyeOff, ExternalLink, Plus, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ClientSite } from '../../types/database';
import { resolveBranding, resolveSiteContent } from '../../types/database';
import KairosSections from './KairosSections';
import {
  SECTION_META, kairosHref, kairosModule, newSection, sectionLabel, starterSections, uploadKairosImage,
  type KairosPage, type KairosSection, type KairosSectionType,
} from '../../lib/kairos';

type Props = {
  site: ClientSite;
  slot: number;
  /** Brand color for buttons in the editor. */
  color: string;
  onBack: () => void;
};

const inputClass = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

function ImageField({ siteId, url, onChange }: { siteId: string; url: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="flex items-center gap-3">
      {url ? (
        <img src={url} alt="" className="w-20 h-14 object-cover rounded-md border border-gray-200" />
      ) : (
        <div className="w-20 h-14 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">No photo</div>
      )}
      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
        <Upload size={13} /> {uploading ? 'Uploading…' : url ? 'Replace' : 'Upload'}
        <input
          type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploading}
          onChange={async e => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) { setError('Please use a photo under 5 MB.'); return; }
            setError(''); setUploading(true);
            const uploaded = await uploadKairosImage(siteId, file);
            setUploading(false);
            if (uploaded) onChange(uploaded); else setError('Upload failed. Please try again.');
          }}
        />
      </label>
      {url && (
        <button type="button" onClick={() => onChange('')} className="text-xs text-gray-500 hover:text-red-600">Remove</button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export default function KairosPageEditor({ site, slot, color, onBack }: Props) {
  const module = kairosModule(slot);
  const branding = resolveBranding(site);
  const ctaText = resolveSiteContent(site)?.hero_cta_primary;

  const [page, setPage] = useState<KairosPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('kairos_pages').select('*')
        .eq('site_id', site.id).eq('module_slot', slot).maybeSingle();
      setPage(
        (data as unknown as KairosPage | null) ?? {
          site_id: site.id,
          module_slot: slot,
          title: module?.title ?? '',
          menu_label: module?.menuLabel ?? '',
          sections: starterSections(slot, ctaText),
          published: false,
        },
      );
      setLoading(false);
    })();
  }, [site.id, slot]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !page) return <div className="p-8 text-sm text-gray-500">Loading…</div>;

  const update = (patch: Partial<KairosPage>) => { setPage(p => (p ? { ...p, ...patch } : p)); setDirty(true); setMessage(''); };
  const setSections = (fn: (s: KairosSection[]) => KairosSection[]) => update({ sections: fn(page.sections) });
  const setField = (id: string, key: string, value: unknown) =>
    setSections(list => list.map(s => (s.id === id ? ({ ...s, [key]: value } as KairosSection) : s)));
  const move = (index: number, dir: -1 | 1) => setSections(list => {
    const next = [...list];
    const target = index + dir;
    if (target < 0 || target >= next.length) return list;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const remove = (id: string) => {
    if (!window.confirm('Remove this section?')) return;
    setSections(list => list.filter(s => s.id !== id));
  };
  const add = (type: KairosSectionType) => setSections(list => [...list, newSection(type)]);

  async function save(published: boolean) {
    if (!page) return;
    setSaving(true); setError(''); setMessage('');
    const { data, error: saveError } = await supabase
      .from('kairos_pages')
      .upsert(
        {
          site_id: site.id,
          module_slot: slot,
          title: page.title.trim() || module?.title || '',
          menu_label: page.menu_label.trim() || page.title.trim() || module?.menuLabel || '',
          sections: page.sections,
          published,
        },
        { onConflict: 'site_id,module_slot' },
      )
      .select()
      .single();
    setSaving(false);
    if (saveError || !data) {
      setError("Couldn't save. Please try again, or contact mytCreative if this keeps happening.");
      return;
    }
    setPage(data as unknown as KairosPage);
    setDirty(false);
    setMessage(published ? 'Published. Your page is live.' : page.published ? 'Unpublished. Visitors can no longer see this page.' : 'Draft saved.');
  }

  const liveHref = kairosHref(site.slug, slot);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => { if (!dirty || window.confirm('Leave without saving your changes?')) onBack(); }}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={15} /> Kairos Award
      </button>

      {/* Title row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{module?.title} page</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Address: <span className="font-mono">{liveHref}</span>
            <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${page.published ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {page.published ? 'Published' : 'Draft'}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setShowPreview(v => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />} {showPreview ? 'Hide preview' : 'Preview'}
          </button>
          <button type="button" disabled={saving} onClick={() => save(page.published)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            {saving ? 'Saving…' : page.published ? 'Save changes' : 'Save draft'}
          </button>
          <button type="button" disabled={saving} onClick={() => save(!page.published)}
            className="px-3 py-2 text-sm text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: page.published ? '#6b7280' : color }}>
            {page.published ? 'Unpublish' : 'Publish'}
          </button>
          {page.published && !dirty && (
            <a href={liveHref} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-gray-900">
              View page <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {message && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</p>}
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <div className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        Write this page in your own words. The headings are only a starting point, so change or remove anything.
        Visitors only see sections that have content, and nothing is public until you click <strong>Publish</strong>.
      </div>

      {showPreview && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-3 py-1.5 bg-gray-100 border-b text-xs text-gray-500">Preview</div>
          <div style={{ backgroundColor: branding.backgroundColor || undefined }}>
            <KairosSections sections={page.sections} branding={branding} slug={site.slug} preview />
          </div>
        </div>
      )}

      {/* Page settings */}
      <div className="grid sm:grid-cols-2 gap-4 bg-white border border-gray-200 rounded-xl p-4">
        <Field label="Page title" hint="Shown in the browser tab.">
          <input className={inputClass} value={page.title} onChange={e => update({ title: e.target.value })} />
        </Field>
        <Field label="Menu label" hint="The name of the link in your site's menu.">
          <input className={inputClass} value={page.menu_label} onChange={e => update({ menu_label: e.target.value })} />
        </Field>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {page.sections.map((s, i) => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{sectionLabel(s.type)}</span>
              <div className="flex items-center gap-1">
                <button type="button" title="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ArrowUp size={14} /></button>
                <button type="button" title="Move down" disabled={i === page.sections.length - 1} onClick={() => move(i, 1)} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ArrowDown size={14} /></button>
                <button type="button" title="Remove" onClick={() => remove(s.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {s.type === 'hero' && (<>
                <Field label="Headline"><input className={inputClass} value={s.headline} onChange={e => setField(s.id, 'headline', e.target.value)} /></Field>
                <Field label="Line under the headline (optional)"><textarea rows={2} className={inputClass} value={s.subheadline} onChange={e => setField(s.id, 'subheadline', e.target.value)} /></Field>
                <Field label="Background photo (optional)"><ImageField siteId={site.id} url={s.imageUrl} onChange={v => setField(s.id, 'imageUrl', v)} /></Field>
              </>)}

              {s.type === 'text' && (<>
                <Field label="Heading"><input className={inputClass} value={s.heading} onChange={e => setField(s.id, 'heading', e.target.value)} /></Field>
                <Field label="Your words" hint="Leave a blank line between paragraphs."><textarea rows={8} className={inputClass} value={s.body} onChange={e => setField(s.id, 'body', e.target.value)} /></Field>
              </>)}

              {s.type === 'image_text' && (<>
                <Field label="Heading"><input className={inputClass} value={s.heading} onChange={e => setField(s.id, 'heading', e.target.value)} /></Field>
                <Field label="Your words" hint="Leave a blank line between paragraphs."><textarea rows={6} className={inputClass} value={s.body} onChange={e => setField(s.id, 'body', e.target.value)} /></Field>
                <Field label="Photo"><ImageField siteId={site.id} url={s.imageUrl} onChange={v => setField(s.id, 'imageUrl', v)} /></Field>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Photo description" hint="For people using screen readers."><input className={inputClass} value={s.imageAlt} onChange={e => setField(s.id, 'imageAlt', e.target.value)} /></Field>
                  <Field label="Photo side">
                    <select className={inputClass} value={s.imagePosition} onChange={e => setField(s.id, 'imagePosition', e.target.value)}>
                      <option value="left">Photo on the left</option>
                      <option value="right">Photo on the right</option>
                    </select>
                  </Field>
                </div>
              </>)}

              {s.type === 'photo_gallery' && (<>
                <Field label="Heading (optional)"><input className={inputClass} value={s.heading} onChange={e => setField(s.id, 'heading', e.target.value)} /></Field>
                {s.photos.map((p, pi) => (
                  <div key={pi} className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                    <ImageField siteId={site.id} url={p.url} onChange={v => setField(s.id, 'photos', s.photos.map((x, xi) => (xi === pi ? { ...x, url: v } : x)))} />
                    <input className={`${inputClass} flex-1 min-w-[10rem]`} placeholder="Caption (optional)" value={p.caption}
                      onChange={e => setField(s.id, 'photos', s.photos.map((x, xi) => (xi === pi ? { ...x, caption: e.target.value } : x)))} />
                    <button type="button" title="Remove photo" onClick={() => setField(s.id, 'photos', s.photos.filter((_, xi) => xi !== pi))} className="p-1.5 text-gray-400 hover:text-red-600"><X size={14} /></button>
                  </div>
                ))}
                {s.photos.length < 8 && (
                  <button type="button" onClick={() => setField(s.id, 'photos', [...s.photos, { url: '', caption: '' }])} className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"><Plus size={13} /> Add a photo</button>
                )}
              </>)}

              {s.type === 'stats' && (<>
                <Field label="Heading (optional)"><input className={inputClass} value={s.heading} onChange={e => setField(s.id, 'heading', e.target.value)} /></Field>
                {s.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-2">
                    <input className={`${inputClass} w-28`} placeholder="10+" value={item.value}
                      onChange={e => setField(s.id, 'items', s.items.map((x, xi) => (xi === ii ? { ...x, value: e.target.value } : x)))} />
                    <input className={inputClass} placeholder="Years of experience" value={item.label}
                      onChange={e => setField(s.id, 'items', s.items.map((x, xi) => (xi === ii ? { ...x, label: e.target.value } : x)))} />
                    {s.items.length > 2 && (
                      <button type="button" title="Remove" onClick={() => setField(s.id, 'items', s.items.filter((_, xi) => xi !== ii))} className="p-1.5 text-gray-400 hover:text-red-600"><X size={14} /></button>
                    )}
                  </div>
                ))}
                {s.items.length < 4 && (
                  <button type="button" onClick={() => setField(s.id, 'items', [...s.items, { value: '', label: '' }])} className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"><Plus size={13} /> Add a number</button>
                )}
              </>)}

              {s.type === 'video' && (<>
                <Field label="Heading (optional)"><input className={inputClass} value={s.heading} onChange={e => setField(s.id, 'heading', e.target.value)} /></Field>
                <Field label="YouTube or Vimeo link"><input className={inputClass} placeholder="https://www.youtube.com/watch?v=…" value={s.url} onChange={e => setField(s.id, 'url', e.target.value)} /></Field>
                <Field label="Caption (optional)"><input className={inputClass} value={s.caption} onChange={e => setField(s.id, 'caption', e.target.value)} /></Field>
              </>)}

              {s.type === 'cta_banner' && (<>
                <Field label="Heading"><input className={inputClass} value={s.heading} onChange={e => setField(s.id, 'heading', e.target.value)} /></Field>
                <Field label="A sentence or two (optional)"><textarea rows={2} className={inputClass} value={s.body} onChange={e => setField(s.id, 'body', e.target.value)} /></Field>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Button text"><input className={inputClass} value={s.buttonText} onChange={e => setField(s.id, 'buttonText', e.target.value)} /></Field>
                  <Field label="Button link" hint="#contact goes to the contact form on your home page.">
                    <input className={inputClass} value={s.buttonUrl} onChange={e => setField(s.id, 'buttonUrl', e.target.value)} />
                  </Field>
                </div>
              </>)}
            </div>
          </div>
        ))}
      </div>

      {/* Add a section */}
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-700 mb-3">Add a section</p>
        <div className="flex flex-wrap gap-2">
          {SECTION_META.map(m => (
            <button key={m.type} type="button" title={m.description} onClick={() => add(m.type)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
              <Plus size={12} /> {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
