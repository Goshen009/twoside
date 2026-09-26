---
name: Dark Minimalist Finance
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#ffb2b7'
  on-secondary: '#67001b'
  secondary-container: '#b50036'
  on-secondary-container: '#ffc2c4'
  tertiary: '#ffb3af'
  on-tertiary: '#650911'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000d'
  on-secondary-fixed-variant: '#92002a'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#111317'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  numeric-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  numeric-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  numeric-data:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies disciplined, high-precision financial tracking engineered for modern dark interfaces. It fuses quiet luxury minimalism with data-dense utility. The emotional tone evokes calm mastery, discretion, and absolute certainty over personal wealth, avoiding the loud gamification or cluttered dashboards typical of legacy fintech.

Key design principles:
- **Zero Visual Noise:** Every pixel, boundary, and hue conveys financial state or functional interaction.
- **Deep Void Immersion:** Layered surfaces rise gracefully out of true dark canvas backgrounds without sharp, distracting contrasts.
- **Micro-Luminescent Accents:** High-potency emerald and muted coral provide immediate categorical legibility while preserving visual rest.
- **Tactile Precision:** Pill-shaped interactive targets and smooth, large-radius card architecture soften strict numeric data into a refined everyday utility.

## Colors

The palette is engineered specifically for deep OLED/AMOLED efficiency and high legibility in low-light environments.

### Canvas & Surface Architecture
- **Canvas Base (Deep Void Black):** `#090b0e` serves as the foundational screen canvas.
- **Elevated Modals & Sheets:** `#111417` provides baseline elevation for sliding panels, bottom drawers, and overlays.
- **Card & Input Containers:** `#1a1f24` delineates actionable segments, interactive inputs, and discrete grouping tiles.
- **Borders & Dividers (Subtle Slate):** `#242b33` provides hairline demarcation (`1px`) without fracturing visual flow.

### Semantic Accents
- **Primary / Inflow / Growth:** Emerald `#10b981` (interactive surfaces and positive yields) paired with bright emerald `#34d399` for micro-indicators, positive badges, and sparkline fills.
- **Expense / Outflow / Debt:** Muted Coral `#f43f5e` reserved strictly for negative balances, expense allocations, and destructive actions.

### Text Hierarchy
- **Primary Text:** `#f8fafc` for hero values, transaction titles, and primary buttons.
- **Secondary Text:** `#94a3b8` for categorical labels, secondary metadata, and timestamps.
- **Tertiary Text:** `#64748b` for placeholder text, inactive tab iconography, and peripheral timestamps.

## Typography

Typography balances geometric identity in macro headers with hyper-legible neutral body text for financial reports.

- **Tabular Figures & Metric Alignment:** All numerical outputs, account balances, transaction ledgers, and percentage tags must strictly render with CSS OpenType feature tags enabled: `font-feature-settings: "tnum" 1, "cv05" 1`. This prevents layout shifts during live ticker updates and aligns decimal points vertically.
- **Hierarchy Division:** Use Plus Jakarta Sans exclusively for aggregate metrics, account titles, and section headlines. Inter manages all long-form transaction logs, micro-metadata, form fields, and labels.
- **Uppercase Restraint:** Reserve uppercase styling strictly for `label-sm` when designating categorical metadata (e.g., `SETTLED`, `PENDING`, `EXPENSE`), applying tracking of `+0.04em`.

## Layout & Spacing

The layout employs an adaptive fluid grid structured around compact density to show key financial stats above the fold while honoring visual hierarchy.

### Grid & Form Factors
- **Mobile (<768px):** 4-column fluid layout with `1rem` outer canvas margins and `1rem` column gutters. Cards span full width (4 columns) to maximize readable area for transaction detail rows.
- **Tablet (768px–1024px):** 8-column layout with `2rem` outer margins. Cards split cleanly into 4-column side-by-side modules (e.g., Cashflow chart paired with Categorical distribution).
- **Desktop (>1024px):** 12-column layout capped at a maximum container width of `1240px` centered, utilizing `3rem` margins and `1.5rem` gutters. Primary dashboard allocates 8 columns to timeline analytics and 4 columns to accounts and real-time feeds.

### Spacing Rhythm
- **Micro Spacing (`space-xs` to `space-sm`):** Reserved for icon-to-label gaps, badge internal padding, and table row vertical padding.
- **Structural Spacing (`space-md` to `space-xl`):** Governs card interior padding (`space-lg` desktop, `space-md` mobile) and segment gaps between discrete modular card sections.

## Elevation & Depth

This system avoids realistic drop shadows, relying on layered luminosity and low-contrast borders for depth.

### Tonal Tiers
- **Tier 0 (Canvas):** Pure base layer `#090b0e`. Flat, unbordered backdrop.
- **Tier 1 (Surface Modules & Cards):** `#1a1f24` overlaid on Tier 0, framed with a continuous `1px solid #242b33` stroke.
- **Tier 2 (Floating Sheets, Drawers & Modals):** `#111417` surrounded with a refined perimeter stroke `1px solid #242b33`.
- **Tier 3 (Active Popovers & Menus):** `#1a1f24` raised with a subtle directional ambient shadow: `box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.6)`.

### Accent Backlights
Data-heavy highlights (such as a highlighted net worth metric or primary conversion modal) use a subtle emerald ambient glow (`box-shadow: 0 0 40px -10px rgba(16, 185, 129, 0.12)`) to provide soft emphasis without visual clutter.

## Shapes

The geometric structure balances precision and approachability:

- **Cards & Primary Modules:** Enclosed with consistent `1rem` (16px) corner radiuses on mobile and tablet, scaling to `1.25rem` (20px) on expansive desktop layouts to preserve organic visual flow.
- **Action Buttons & Inputs:** All primary CTAs, filter chips, search fields, and transaction buttons use full pill geometry (`9999px`) to distinguish actionable touchpoints from container cards.
- **Internal Elements:** Micro-badges, avatars, and transaction icon containers use soft `0.5rem` (8px) radiuses.

## Components

### Buttons
- **Primary:** Full pill-shaped CTA (`rounded-full`) in emerald `#10b981` with `#090b0e` text, bold `label-md` weight. Hover: `#34d399`. Active: scale `0.98`.
- **Secondary / Ghost:** Full pill container with `1px solid #242b33`, background `#1a1f24`, and `#f8fafc` text. Hover: border color shifts to `#94a3b8` with subtle background lift.
- **Destructive:** Border and text in muted coral `#f43f5e`, background transparent or `#f43f5e10`.

### Cards & Financial Tiles
- Constructed using `#1a1f24` background with `1px solid #242b33` border and smooth 16px to 20px corners (`rounded-lg` / `rounded-xl`).
- Internal padding matches `space-lg` (24px) for desktop; `space-md` (16px) for mobile.
- Cards maintain zero internal elevation artifacts; nested divisions use subtle `1px solid #242b33` horizontal rules.

### Input Fields
- Enclosed with full pill silhouette (`9999px`) or `rounded-lg` (16px) based on context.
- Fill `#1a1f24` with border `1px solid #242b33`. Primary text `#f8fafc`, placeholder `#64748b`.
- **Focus State:** Hairline border transition to emerald `#10b981` with a zero-offset focus ring `box-shadow: 0 0 0 1px #10b981`.

### Filter Chips
- Fully rounded pills (`border-radius: 9999px`) with padding `0.25rem 0.75rem`.
- Inactive: Background `#111417`, border `1px solid #242b33`, text `#94a3b8`.
- Active: Background `#10b9811a` (10% tint), border `1px solid #10b981`, text `#34d399`.

### Lists & Transaction Ledgers
- Minimalist rows separated by `1px solid #242b33` hairline dividers or `space-xs` gap.
- Merchant/Source icon sits in an 8px rounded `#111417` container with `#94a3b8` iconography.
- Values displayed using `numeric-data` typography with strict tabular figure alignment. Positive cash flows are prefixed with `+` in `#34d399`; expenditures are neutral `#f8fafc` or prefixed with `-` in `#f43f5e`.

### Checkboxes & Toggle Switches
- Checkboxes: 18x18px squares with `0.25rem` corners. Border `1px solid #242b33`. Checked state transitions fill to `#10b981` with white checkmark.
- Toggles: Compact pill chassis (40px x 22px) filled with `#111417` and a 16px thumb. When activated, the track illuminates in emerald `#10b981`.

### Data Sparklines & Balance Progress Bars
- 4px height tracks with full pill caps (`9999px`).
- Inactive track `#242b33`; filled progress rendered in vibrant emerald `#10b981` for budgets under limit, shifting to coral `#f43f5e` when exceeded.