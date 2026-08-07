# Your Website Admin Guide

This guide walks you through managing your website in the client admin portal — updating your branding, page content, contact options, and domain, all without touching code.

## 1. Signing in

1. Go to your admin login page (`/admin/login`, or the settings icon in the bottom-right corner of your live site).
2. Enter the email address your site is registered under.
3. Check your inbox for a magic link email and click it — no password needed.
4. You'll land back in the admin portal, signed in.

> You can only manage the site registered to your email. If you sign in with a different email, you'll see an access message — sign out and try the correct one.

## 2. The dashboard, at a glance

- **Left sidebar** — every editable section of your site (Branding, Hero, About, Services, etc.). Click a section to edit it.
- **Top bar**:
  - **Show/Hide Preview** — toggles a live preview of your site next to the editor.
  - **View Live** — opens your published site in a new tab.
  - **Save** — writes your changes. Nothing goes live until you click Save.
- Unsaved changes are safe until you navigate away without saving — the Save button shows **Saved ✓** once your changes are written.

## 3. Branding

**Logo** — upload a PNG or JPG (max 2MB). Falls back to your initial in a colored badge if no logo is set.

**Brand colors** — Primary (buttons/links/accents), Secondary (text/backgrounds/nav), and Accent (gradients/hover states). Pick with the color swatch or type a hex code directly.

**Site theme** — choose the overall visual style: Professional, Creative, Wellness, Luxury, Minimalist, Innovative, or Restorative. Each theme changes layout shape, fonts, and section styling site-wide.

**Restorative theme only** — unlocks extended controls:
- Background / Text / Muted colors (leave blank to fall back to the theme default)
- Display / Body / Accent fonts, chosen from a small curated Google Fonts list

## 4. Navigation

- **Header** — show/hide your logo, business name, and a tagline under the logo.
- **Secondary button** — an optional second button in the header (e.g. "Donate") with its own label and URL.
- **Footer** — show/hide your logo and business name in the footer.

## 5. Hero section

Edit your headline, subheadline, value statement, and both call-to-action button labels.

Media options:
- **Image or video** background — paste a video URL (including YouTube links) or upload an image.
- **Image ratio** — default (fixed height) or 16:9 widescreen.
- **Background mirror** — a faint blurred copy of your hero image behind the section for extra depth.

## 6. About

Edit your headline, body copy, mission statement, and the About button text.

- **Layout** — standard (centered text) or three-column (image | text | stat counters). Three-column also displays up to 3 stat callouts (e.g. "500+ Projects Completed") if you've filled them in.
- **Show media** — toggle the About image on/off in the three-column layout.

## 7. Services

Up to 4 services, each with a name, description, benefit line, and button text.

- **Layout** — Cards (4-column grid, default) or Icon Grid (2×2 icons with a side image).
- **Icon Grid only**: toggle icon badges on/off.
- **Both layouts**: toggle the CTA buttons/links on/off.
- **Per-service URL** (optional) — if set, the service's button links straight to that URL. Leave blank and the button scrolls visitors to your contact form instead.

## 8. Why Us (Benefits)

Up to 4 short benefit callouts, each with a title and description.

## 9. Testimonials

Two testimonial slots — quote, name, and role/title for each.

## 10. Call to Action

Edit the CTA banner headline, body, button text, and urgency line.

**Button behavior** — by default the CTA button scrolls to your contact form. Toggle **"Use booking / calendar link"** to instead open a scheduling modal, and paste your **Booking / Calendar URL** — works with Calendly, GHL Calendar, Cal.com, TidyCal, and similar tools.

## 11. Photo Gallery

Upload up to 7 photos. They display in a grid between your Services and Why Us sections. Square or portrait photos look best. Hover a filled slot to replace or remove it.

## 12. Contact Info

**Show/hide toggles**:
- Phone number
- Business address
- Business hours
- Contact form section
- Partner & Volunteer options (adds those as extra choices in the form's service dropdown)

**Lead Form Source** — by default your site uses the built-in contact form, which emails leads straight to you. Toggle **"Use an embedded form instead"** to replace it with a form embedded from GoHighLevel (or another provider):

1. In GoHighLevel, open your form's embed code.
2. Copy just the iframe's **src URL** (starts with `https://`) — not the whole embed snippet.
3. Paste it into the **Embedded Form URL** field.
4. Save. Your site's contact section now shows your GHL form instead of the built-in one.

> Only the URL is needed — don't paste the full `<script>`/`<iframe>` embed code, just the link itself.

Also editable here: contact form title, subtitle, and button text (used by the built-in form only).

## 13. SEO & Brand

Brand tagline, meta description (used for search engine listings), business email, and your social profile links (Instagram, Facebook, X, LinkedIn). Leave a social field blank to hide that icon from your footer.

## 14. Custom Domain

To connect your own domain (e.g. `www.yourbusiness.com`):

1. Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).
2. Add a DNS record:
   | Type | Name | Value | TTL |
   |---|---|---|---|
   | CNAME | www | `myt-client-platform.netlify.app` | 3600 (or Auto) |
3. Come back here, enter your domain (no `https://`), and click Save.
4. DNS changes can take up to 48 hours to fully propagate.

## 15. Kairos Award (if unlocked)

Clients recognized with a Kairos Award get premium expansion modules unlocked on their platform — extra page types like a Meet the Team / Founder's Story section or a Portfolio / Case Studies section. If you have modules unlocked, a gold **Kairos Award** button appears in your sidebar with your available modules.

## 16. Publishing your changes

Nothing changes on your live site until you click **Save** (top bar or bottom of the sidebar). Use **Show Preview** to check your edits before saving, and **View Live** any time to see exactly what visitors see.

## Need help?

If something isn't working as expected, or you don't have access to the email your site is registered under, contact your mytCreative administrator.
