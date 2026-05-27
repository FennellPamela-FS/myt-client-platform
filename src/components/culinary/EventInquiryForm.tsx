import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronRight, ChevronLeft, CheckCircle2, Calendar, Users, Sparkles } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  guest_count: string;
  estimated_budget: string;
  dietary_restrictions: string[];
  vision_notes: string;
}

interface Props {
  siteId: string;
  primaryColor: string;
  businessName: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  'Private Dinner',
  'Wedding Reception',
  'Corporate Event',
  'Birthday Celebration',
  'Brunch / Lunch',
  'Holiday Gathering',
  'Food Truck Booking',
  'Farm-to-Table Experience',
  'Other',
];

const BUDGET_RANGES = [
  'Under $1,000',
  '$1,000 – $2,500',
  '$2,500 – $5,000',
  '$5,000 – $10,000',
  '$10,000 – $25,000',
  '$25,000+',
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Kosher',
  'Halal',
  'Shellfish-Free',
];

const STEPS = ['Your Info', 'Event Details', 'Your Vision'];

// ─── Field components ─────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-shadow';

// ─── Main component ───────────────────────────────────────────────────────────

export default function EventInquiryForm({ siteId, primaryColor, businessName }: Props) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    event_type: '',
    event_date: '',
    guest_count: '',
    estimated_budget: '',
    dietary_restrictions: [],
    vision_notes: '',
  });

  const set = (key: keyof FormData, value: string | string[]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleDietary = (item: string) => {
    setForm(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(item)
        ? prev.dietary_restrictions.filter(d => d !== item)
        : [...prev.dietary_restrictions, item],
    }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep = () => {
    if (step === 0) {
      if (!form.full_name.trim()) return 'Please enter your name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.';
    }
    if (step === 1) {
      if (!form.event_type) return 'Please select an event type.';
    }
    return '';
  };

  const next = () => {
    const msg = validateStep();
    if (msg) { setError(msg); return; }
    setError('');
    setStep(s => s + 1);
  };

  const back = () => { setError(''); setStep(s => s - 1); };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const submit = async () => {
    setSubmitting(true);
    setError('');
    const { error: dbErr } = await supabase.from('event_inquiries').insert({
      site_id: siteId,
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      event_type: form.event_type || null,
      event_date: form.event_date || null,
      guest_count: form.guest_count ? parseInt(form.guest_count) : null,
      estimated_budget: form.estimated_budget || null,
      dietary_restrictions: form.dietary_restrictions,
      vision_notes: form.vision_notes.trim() || null,
    });
    setSubmitting(false);
    if (dbErr) {
      setError('Something went wrong. Please try again or contact us directly.');
    } else {
      setSubmitted(true);
    }
  };

  const ringStyle = { '--tw-ring-color': primaryColor } as React.CSSProperties;

  // ── Success state ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center py-16 px-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${primaryColor}20` }}>
          <CheckCircle2 size={32} style={{ color: primaryColor }} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Inquiry Received</h3>
        <p className="text-gray-500 leading-relaxed">
          Thank you, <span className="font-medium text-gray-800">{form.full_name.split(' ')[0]}</span>.
          We've received your inquiry for a <span className="font-medium text-gray-800">{form.event_type}</span> and
          will be in touch within 24 hours to discuss making it extraordinary.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">

      {/* ── Step progress ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                style={{
                  backgroundColor: i <= step ? primaryColor : '#E5E7EB',
                  color: i <= step ? '#fff' : '#9CA3AF',
                }}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block"
                style={{ color: i === step ? primaryColor : '#9CA3AF' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-12 h-px mb-5" style={{ backgroundColor: i < step ? primaryColor : '#E5E7EB' }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 0: Your Info ──────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900">Let's start with you</h3>
            <p className="text-sm text-gray-500 mt-1">We'll use this to follow up personally.</p>
          </div>
          <Field label="Full name">
            <input
              type="text"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="Jane Smith"
              className={inputCls}
              style={ringStyle}
            />
          </Field>
          <Field label="Email address">
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="jane@example.com"
              className={inputCls}
              style={ringStyle}
            />
          </Field>
          <Field label="Phone number" hint="Optional — for faster coordination">
            <input
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
              className={inputCls}
              style={ringStyle}
            />
          </Field>
        </div>
      )}

      {/* ── Step 1: Event Details ──────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900">Tell us about your event</h3>
            <p className="text-sm text-gray-500 mt-1">The details help us craft the right proposal.</p>
          </div>
          <Field label="Type of event">
            <select
              value={form.event_type}
              onChange={e => set('event_type', e.target.value)}
              className={inputCls}
              style={ringStyle}
            >
              <option value="">Select event type…</option>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Event date">
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={form.event_date}
                  onChange={e => set('event_date', e.target.value)}
                  className={`${inputCls} pl-9`}
                  style={ringStyle}
                />
              </div>
            </Field>
            <Field label="Guest count">
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="number"
                  min="1"
                  value={form.guest_count}
                  onChange={e => set('guest_count', e.target.value)}
                  placeholder="e.g. 40"
                  className={`${inputCls} pl-9`}
                  style={ringStyle}
                />
              </div>
            </Field>
          </div>
          <Field label="Estimated budget" hint="Helps us tailor the right menu and service level">
            <select
              value={form.estimated_budget}
              onChange={e => set('estimated_budget', e.target.value)}
              className={inputCls}
              style={ringStyle}
            >
              <option value="">Select a range…</option>
              {BUDGET_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
        </div>
      )}

      {/* ── Step 2: Vision ────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900">Make it yours</h3>
            <p className="text-sm text-gray-500 mt-1">The more you share, the better we can serve you.</p>
          </div>
          <Field label="Dietary restrictions" hint="Select all that apply">
            <div className="grid grid-cols-2 gap-2 mt-1">
              {DIETARY_OPTIONS.map(item => {
                const on = form.dietary_restrictions.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDietary(item)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left"
                    style={{
                      borderColor: on ? primaryColor : '#E5E7EB',
                      backgroundColor: on ? `${primaryColor}10` : '#fff',
                      color: on ? primaryColor : '#374151',
                    }}
                  >
                    <span className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                      style={{ borderColor: on ? primaryColor : '#D1D5DB', backgroundColor: on ? primaryColor : 'transparent' }}>
                      {on && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    {item}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Your vision" hint="Describe the atmosphere, cuisine preferences, or any special requests">
            <textarea
              value={form.vision_notes}
              onChange={e => set('vision_notes', e.target.value)}
              rows={5}
              placeholder="Tell us about the experience you want to create — the vibe, the flavors, any special touches that matter to you…"
              className={`${inputCls} resize-none`}
              style={ringStyle}
            />
          </Field>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-8 gap-3">
        {step > 0 ? (
          <button
            onClick={back}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>
        ) : <div />}

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 ml-auto"
            style={{ backgroundColor: primaryColor }}
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 ml-auto"
            style={{ backgroundColor: primaryColor }}
          >
            <Sparkles size={16} />
            {submitting ? 'Sending…' : `Send Inquiry to ${businessName}`}
          </button>
        )}
      </div>
    </div>
  );
}
