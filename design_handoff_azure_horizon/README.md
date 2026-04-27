# Handoff: Azure Horizon Hotel — Guest UI

## Overview

Azure Horizon Hotel is a luxury oceanfront property in Miami. This handoff covers the **complete guest-facing web app**: 14 pages spanning marketing, booking flow, and authenticated account management. Tone: aspirational but approachable — Booking.com clarity meets Four Seasons polish.

## About the Design Files

The files in this bundle are **design references created in HTML/JSX** — prototypes that show the intended look, behavior, and interactions. They are **not production code to copy directly**.

Your task is to **recreate these designs in the target codebase's existing environment** (React, Next.js, Vue, etc.) using its established patterns, component library, routing, and state management. If no environment exists yet, pick the most appropriate framework for the project (recommended: Next.js + TypeScript + Tailwind, or the team's existing stack) and implement there.

The HTML prototypes use inline JSX with a Babel runtime so they can be opened in a browser without a build step. Treat the markup as a **layout and styling reference** and the CSS in `styles.css` as the **source of truth for design tokens, spacing, and component styles**.

## Fidelity

**High-fidelity (hifi).** Pixel-perfect mockups with final colors, typography, spacing, shadows, and interaction states. Developer should match the visual specification closely while adapting structure to the target framework.

## Screens / Views

All screens use a **sticky top header** (logo + nav + avatar/bell when logged in, or sign-in CTA when logged out) and a shared design system. Pages are designed at **1440px desktop**; the brief calls for 375px mobile responsive — implement mobile per standard responsive breakpoints (header collapses to hamburger, multi-column grids stack, sticky reserve panels become bottom sheets).

### 1. Home (3 variants — pick one to ship, or A/B)

**Variant A — Editorial Oceanfront** (recommended primary)
- Full-bleed ocean hero, 560px tall, dark gradient overlay (rgba(15,23,42,0) → 0.85 bottom)
- Hero copy: 64px display ("Where the Atlantic meets *quiet luxury*"), 17px subtitle
- Floating search bar overlapping hero bottom edge (16px radius, 0 20px 60px shadow)
- Featured rooms (3-up grid), facilities (3×2 grid), reviews carousel (3-up), trust badges row, dark footer

**Variant B — Split Hero**
- Two-column 50/50 layout: left = headline + stats + CTAs; right = 3-image collage (16px radius)
- Search bar appears below as a separate band

**Variant C — Compact / Booking-style**
- Blue gradient header band (#1E3A8A → #2563EB) with white nav and prominent search bar
- 4-up "Trending this week" cards below

### 2. Search / Rooms Listing
- Sticky search bar bar at top
- Two-column body: 280px filter sidebar + room results
- **Filters**: price range slider ($320–$2,400), room type (5 checkboxes), capacity (4 options), amenities (6 checkboxes)
- **Room rows**: 280×200 photo + content + 200px pricing column. Includes badge (top-left of photo), name, capacity/sqft/rating row, amenity chips, free-cancellation note, total price + per-night price + Book Now CTA

### 3. Room Details
- Breadcrumb (Rooms › Suites › Atlantic Sunrise Suite)
- Photo gallery: 5-image grid (large left photo spans 2 rows, 4 smaller right) — 488px tall total. "All 28 photos" button bottom-right
- Two-column body: content (gallery, description, included amenities 2-col grid, cancellation policy card) + 380px sticky reserve panel
- **Reserve panel** (sticky, top: 88px): price, check-in/out date inputs, inline calendar (May 2026 with disabled days in muted red, range highlighted in #DBEAFE), adult/child counters (+ disabled at capacity), special-requests textarea, line-item price breakdown, Reserve CTA with pulsing shadow

### 4. Booking Flow (4 steps)
- 4-step horizontal stepper at top: 1 Dates & guests (done), 2 Personal details (active, shown), 3 Payment, 4 Confirm
- Two-column: form card + 380px sticky summary card with room photo and live price breakdown including member discount
- **Inline error**: phone field shows red border, red helper text below — never alerts
- Loyalty signup row with toggle, integrated within form

### 5. Booking Confirmation
- Centered max-720px column
- Success icon (72px green circle), "You're all set, Elena." headline
- Booking ref card: monospace ref code, confirmed pill, two-column body with photo + key facts, divider, QR placeholder + "skip front desk" copy + Wallet/Calendar buttons
- View My Bookings + Share CTAs

### 6. Login
- Centered 420px card on tinted blue gradient background
- Logo, "Welcome back", email + password inputs, keep-signed-in checkbox, primary CTA
- "OR" divider, then 3 social buttons (Google red G, Apple black, Meta blue f)

### 7. Register
- Two-column layout, **left brand panel uses ocean image with quote overlay** ("The kind of place where time bends...")
- Right panel: form (first/last name, email, password with strength meter, confirm password), terms checkbox, Create CTA
- Password strength meter: 4 segments (3 green = "Strong")

### 8. User Dashboard
- Welcome header with member tier eyebrow + "+ New booking" CTA
- 4-up stat cards: Confirmed (2), Pending (1), Completed (8), Total spent ($32,840) — each with colored icon tile
- Two-column: recent bookings table (5 cols: ref, dates, suite, total, status pill) + sidebar with "Next stay" card and Quick Actions list

### 9. My Bookings
- Tabs: All / Upcoming / Past / Cancelled (with counts)
- Booking cards (180px photo + content + actions+price column)
- **Cancel-confirm flip**: clicking Cancel rotates the card 180° to show a confirmation back panel with cancellation policy reminder, Keep / Yes-cancel actions

### 10. Booking Details (covered by stay summary in confirmation + bookings; no dedicated screen designed — implement as expanded view of booking row)

### 11. Profile
- Two-column: 240px left nav (Profile, Password & security, Notifications, Payment methods, Payment history, My reviews) + content
- Three cards: Photo (avatar with hover overlay revealing camera+upload icon), Personal info (2-col form), Notification preferences (toggle rows)

### 12. Payment History
- Single table (Date, Booking ref, Amount, Method, Status pill, Receipt download link per row)

### 13. Reviews
- "Leave a review" prompt card (photo + interactive star picker + textarea + Submit)
- "Your past reviews" list — each card has rating, body, and optional **hotel response** in a tinted blue panel with left primary border

### 14. Notifications
- Centered max-720px feed
- Header with "Mark all as read"
- Card list — each row: tone-tinted icon tile + title (with unread blue dot) + body + relative time. Unread rows have a subtle blue tint background

## Component Library

Implement these as reusable components matching the props/states shown in the prototypes:

| Component | Variants / States |
|---|---|
| `<Button>` | primary, secondary, ghost, danger; sizes sm / default / lg; loading state; pulsing variant for hero CTAs |
| `<Input>` | label, helper text, error state (red border + red helper), icon prefix/suffix |
| `<Textarea>` | same states as Input |
| `<Select>` | same states |
| `<RoomCard>` | photo + badge, name, capacity, sqft, amenity chips, price, CTA |
| `<BookingCard>` | photo, status badge, name, dates, ref, total, action buttons; **flip-to-cancel** state |
| `<StatusBadge>` | confirmed (green), pending (yellow), cancelled (red), completed (blue) |
| `<DateRangePicker>` | inline calendar grid; muted-red disabled days, primary range highlight |
| `<GuestCounter>` | adults + children stepper; +/- buttons disable at min/max |
| `<StarRating>` | interactive (5 clickable) and display-only |
| `<PriceSummary>` | line items, taxes, member discount in success green, bold total |
| `<EmptyState>` | tinted icon circle, heading, subtext, CTA |
| `<Toggle>` | switch with on/off track |
| `<Tabs>` | underline-active style |
| `<Stepper>` | done/active/upcoming with connecting lines |
| `<SkeletonScreen>` | shimmer animation, 1.6s loop, used during loads |

## Interactions & Behavior

- **Reserve CTA pulses** with primary shadow (2s ease-in-out infinite)
- **Date picker**: unavailable dates muted red strike-through, hover-highlights range during selection
- **Guest counter**: `+` disables when capacity reached, helper text appears
- **Booking card cancel**: 0.55s 3D Y-axis rotate to confirmation back; Keep returns, Yes-cancel triggers cancellation flow + modal
- **Avatar hover**: 0.18s opacity reveal of dark overlay with camera icon + "Upload" text
- **Header**: sticky on all pages; transparent variant for variant-A hero (turns opaque after scroll past hero — implement with IntersectionObserver)
- **Bell icon**: red dot indicator when unread notifications exist; dot disappears when all read
- **Errors**: always inline below the field (red border + red 12px helper with error icon). Never use alerts/toasts for validation
- **Loading**: use skeleton screens, never spinners
- **Empty states**: every empty list shows tinted icon circle + friendly message + CTA
- **Cancellation policy**: must be visible on Room Details and Booking flow steps before commit

## State Management

Per page (suggested store slices):
- `auth`: user, session, loginState
- `search`: destination, dateRange, guests, filters, sort
- `booking` (in-progress): selectedRoom, dates, guests, guestDetails, payment, currentStep
- `bookings` (user's): list, statusFilter, optimistic-cancel state
- `notifications`: list, unreadCount, lastRead

Persist `search` to URL params so deep links work. Booking flow should never re-prompt for info already collected — pass `booking` state forward through all 4 steps.

## Design Tokens

Source of truth: `styles.css` `:root` block. Key values:

### Colors
```
--primary:        #2563EB   (blue-600 — buttons, links, active)
--primary-dark:   #1D4ED8   (hover)
--primary-light:  #DBEAFE   (tinted backgrounds, calendar range)
--bg:             #F8FAFC   (page background)
--surface:        #FFFFFF   (cards)
--text:           #0F172A   (primary text)
--text-secondary: #64748B   (muted text)
--text-tertiary:  #94A3B8   (placeholders)
--border:         #E2E8F0
--border-strong:  #CBD5E1
--success:        #16A34A   (confirmed badge text/icon)
--success-bg:     #DCFCE7
--warning:        #D97706   (pending)
--warning-bg:     #FEF3C7
--error:          #DC2626   (cancelled, validation, danger button)
--error-bg:       #FEE2E2
```

### Border Radius
```
--radius-card:    12px      (cards, photos, large containers)
--radius-input:   8px       (inputs, buttons, small elements)
--radius-pill:    9999px    (badges, chips, toggles)
```

### Shadows
```
--shadow-card:        0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)
--shadow-card-hover:  0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.05)
--shadow-cta:         0 10px 40px rgba(37,99,235,0.25)
--shadow-cta-hover:   0 14px 50px rgba(37,99,235,0.35)
```

### Typography

**Family**: Plus Jakarta Sans (Google Fonts). Weights used: 400, 500, 600, 700, 800, 900.
**Mono** (for booking refs, code-feeling labels): JetBrains Mono.
**Body weight**: 500–600. **Headings**: 700–900.
**Letter-spacing**: -0.025em on display sizes, -0.02em on h2, -0.01em on h3 and labels, +0.06–0.12em uppercase on eyebrows/badges.

| Token | Size | Weight | Usage |
|---|---|---|---|
| Display | 64–72px | 900 | Hero headlines |
| H1 | 32px | 800 | Page titles |
| H2 | 22px | 800 | Section heads |
| H3 | 17px | 700 | Card titles |
| Body | 14–16px | 500 | Paragraphs |
| Label | 13px | 700 | Form labels |
| Helper | 12px | 500 | Helper text, captions |
| Eyebrow | 12px | 700 uppercase | Section eyebrows (0.08em tracking) |
| Badge | 12px | 700 uppercase | Status pills (0.01em tracking) |

### Spacing
Base unit: 4px. Common values: 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 60, 80.
Page padding: 48px desktop, 24px mobile. Card padding: 18–28px depending on density.

### Icons
Material Symbols Outlined, weight 500, size 24 (default) or 14–18 inline. Imported via Google Fonts CSS link.

## Assets

- **Fonts**: Plus Jakarta Sans + JetBrains Mono via Google Fonts CDN
- **Icons**: Material Symbols Outlined via Google Fonts CDN
- **Images**: All photo regions in the prototype use **striped CSS placeholders** in tinted gradients (ocean = blue, room = orange, suite = purple, pool = teal, spa = pink). **In production, replace with real photography.** Recommended treatment: ocean/exterior shots for hero and "Atlantic" suites, warm interior shots for guest rooms, lifestyle imagery for facilities.
- **QR code**: placeholder pattern only — generate real QR with booking ref payload server-side or client-side via `qrcode.react` or similar.
- **Logo**: gradient mark + "Azure Horizon" wordmark — recreate as SVG component. Mark is a 28×28 rounded square with linear-gradient(135deg, #2563EB 0%, #06B6D4 100%) and an inner 6px-inset white circle at 25% opacity.

## Files in this bundle

| File | Purpose |
|---|---|
| `Azure Horizon Hotel.html` | Entry point — open in browser to see all 15 artboards on the design canvas |
| `styles.css` | **All design tokens and component styles** (best reference for visual implementation) |
| `components.jsx` | Shared components (Header, Footer, RoomCard, SearchBar) + 3 home variants |
| `pages-flow.jsx` | Search, Room Details, Booking flow, Confirmation |
| `pages-account.jsx` | Login, Register, Dashboard, My Bookings, Profile, Reviews, Notifications, Payment History |
| `design-canvas.jsx` | Pan/zoom canvas wrapper for viewing all artboards (not part of the production app) |

## Implementation Notes

- **Don't ship the design canvas** — that's a presentation tool. Each `<DCArtboard>` corresponds to a single production page/route.
- **Header is shared** — extract `<Header>` (and the transparent variant for hero) as a layout component used across routes.
- **Material Symbols loads as a font** — keep the `<link>` tag, but consider switching to icon components (e.g., `lucide-react` with equivalent icons) if your team prefers tree-shakeable icons.
- **Sticky reserve panel** uses `position: sticky; top: 88px` (header height + breathing room). Make sure the parent grid cell allows sticky behavior (no `overflow` on ancestors).
- **Prototype JSX uses inline styles in many places** for speed of iteration. In production, port these to your styling solution (CSS modules, Tailwind, styled-components) and rely on the tokens in `styles.css`.

## Open questions for product before building

- Confirmation QR payload — what does scanning it do? (Mobile key, check-in, both?)
- Loyalty/Rewards tiers — full system spec needed (Gold tier appears in Dashboard but not defined elsewhere)
- Payment provider integration (Stripe? Adyen?) — affects payment step UX
- Internationalization scope (currency, dates, languages)
- Booking modification flow not designed — needs spec
