# SplitKaro Design System (Canonical)

This document serves as the single source of truth for the SplitKaro design system, extracted from the final Google Stitch designs. 

## 1. Brand & Aesthetics
The design system is engineered for high-utility financial management, focusing on clarity, speed, and trust. The brand personality is **Precise, Reliable, and Unobtrusive**. It adopts a **Modern Minimalist** aesthetic, avoiding decorative flourishes so that data remains the focal point.

## 2. Color Tokens

The color palette is strictly functional, adhering to Material 3 / Tonal color concepts.

**Resolved Primary Color Rule:** All primary brand elements and buttons MUST use `#3525CD` as the canonical primary color. (Earlier screens using `#4F46E5` are deprecated).

| Role | Token | Hex |
|---|---|---|
| **Primary** | `primary` | `#3525cd` |
| | `on-primary` | `#ffffff` |
| | `primary-container` | `#4f46e5` |
| | `on-primary-container` | `#dad7ff` |
| | `inverse-primary` | `#c3c0ff` |
| | `primary-fixed` | `#e2dfff` |
| | `primary-fixed-dim` | `#c3c0ff` |
| | `on-primary-fixed` | `#0f0069` |
| | `on-primary-fixed-variant` | `#3323cc` |
| **Secondary** | `secondary` | `#006a61` |
| | `on-secondary` | `#ffffff` |
| | `secondary-container` | `#86f2e4` |
| | `on-secondary-container` | `#006f66` |
| | `secondary-fixed` | `#89f5e7` |
| | `secondary-fixed-dim` | `#6bd8cb` |
| | `on-secondary-fixed` | `#00201d` |
| | `on-secondary-fixed-variant` | `#005049` |
| **Tertiary** | `tertiary` | `#7e3000` |
| | `on-tertiary` | `#ffffff` |
| | `tertiary-container` | `#a44100` |
| | `on-tertiary-container` | `#ffd2be` |
| | `tertiary-fixed` | `#ffdbcc` |
| | `tertiary-fixed-dim` | `#ffb695` |
| | `on-tertiary-fixed` | `#351000` |
| | `on-tertiary-fixed-variant` | `#7b2f00` |
| **Error** | `error` | `#ba1a1a` |
| | `on-error` | `#ffffff` |
| | `error-container` | `#ffdad6` |
| | `on-error-container` | `#93000a` |
| **Surfaces & Backgrounds**| `background` | `#f8f9fa` |
| | `on-background` | `#191c1d` |
| | `surface` | `#f8f9fa` |
| | `surface-dim` | `#d9dadb` |
| | `surface-bright` | `#f8f9fa` |
| | `surface-container-lowest` | `#ffffff` |
| | `surface-container-low` | `#f3f4f5` |
| | `surface-container` | `#edeeef` |
| | `surface-container-high` | `#e7e8e9` |
| | `surface-container-highest` | `#e1e3e4` |
| | `on-surface` | `#191c1d` |
| | `on-surface-variant` | `#464555` |
| | `inverse-surface` | `#2e3132` |
| | `inverse-on-surface` | `#f0f1f2` |
| **Outlines** | `outline` | `#777587` |
| | `outline-variant` | `#c7c4d8` |


## 3. Typography
The system uses the **Geist** font family for developer-friendly precision, and **Geist Mono** for monetary values.

| Token | Family | Size | Weight | Line Height | Tracking |
|---|---|---|---|---|---|
| `headline-lg` | Geist | 24px | 600 (Semibold) | 32px | -0.02em |
| `headline-md` | Geist | 20px | 600 (Semibold) | 28px | -0.01em |
| `body-lg` | Geist | 16px | 400 (Regular) | 24px | 0 |
| `body-md` | Geist | 14px | 400 (Regular) | 20px | 0 |
| `label-sm` | Geist | 12px | 600 (Semibold) | 16px | 0 |
| `mono-data` | Geist Mono | 14px | 500 (Medium) | 20px | 0 |

*(Note: Data tables, amounts, and split percentages MUST use `mono-data` for vertical alignment.)*

## 4. Spacing & Grid
The layout uses a **12-column fluid grid** for desktop and a single-column fluid layout for mobile, built on a strict **4px baseline grid**.

- `unit`: 4px
- `gutter`: 16px
- `container-padding`: 24px
- `row-height-compact`: 40px (used for transaction tables)
- `row-height-standard`: 56px (used for main group lists)

## 5. Border Radius & Shapes
Soft (Level 1) roundedness profile to feel professional rather than bubbly.

- `sm`: 2px (`0.125rem`)
- `DEFAULT` / Inputs / Small Buttons: 4px (`0.25rem`)
- `md`: 6px (`0.375rem`)
- `lg` / Cards / Modals: 8px (`0.5rem`)
- `xl`: 12px (`0.75rem`)
- `full` / Badges / Pills: `9999px` (capsule)

## 6. Elevation & Depth
To maintain a sleek fintech aesthetic, heavy drop shadows are avoided in favor of tonal layers and borders.

- **Surface Definition**: Use 1px solid borders (`border-outline-variant`) to define containers.
- **Hover States (Cards/Interactive)**: High-diffusion, soft shadow: `shadow-[0px_2px_4px_rgba(0,0,0,0.05)]`.
- **Overlays (Modals, Toasts, Dialogs)**: Pronounced separation shadow: `shadow-[0px_10px_15px_rgba(0,0,0,0.1)]`.

## 7. Component Styles

### Buttons
*All buttons must use Title Case for labels (no all-caps).*
- **Primary**: `bg-primary text-on-primary`. Solid high-contrast.
- **Secondary**: Ghost style. `bg-transparent border border-primary text-primary`.
- **Tertiary**: Plain text, no background (used for Cancel/Go Back).

### Form Inputs
- **Default**: `bg-surface-container-lowest border border-outline-variant`.
- **Focus**: `border-primary ring-2 ring-primary/20`.
- **Error**: `border-error`.

### Badges & Pills
- **Split-Types**: Container is `bg-surface-variant text-on-surface-variant border-outline-variant`. Each type features a distinct colored dot mapped to theme tokens:
  - **Equal**: `bg-primary` dot
  - **Exact**: `bg-secondary` dot
  - **Percentage**: `bg-secondary-fixed-dim` dot (darker variant chosen over base `secondary-fixed` for improved contrast against the `surface-variant` background)
- **Payment Status (Inflow)**: Emerald green logic (e.g. `bg-secondary-container text-on-secondary-container`).
- **Payment Status (Outflow)**: Rose red logic (e.g. `bg-error-container text-on-error-container`).
- **Payment Status (Neutral/Settled)**: Slate grey logic (e.g. `bg-surface-variant text-on-surface-variant` or `border-outline-variant` with `text-outline`).

### Cards
- **Standard Card**: `bg-surface-container-lowest border border-outline-variant rounded-lg`. No shadow unless hovered.
- **Status Card (Balance Overview)**: Distinct variant featuring a colored border, corresponding tinted accent circle (`bg-color/10`), and colored typography to reflect status:
  - **Positive (Owed to you)**: Uses Emerald Green / `secondary` equivalent for border, accent circle, and text.
  - **Negative (You owe)**: Uses Rose Red / `error` equivalent for border, accent circle, and text.
  - **Neutral (Settled)**: Uses Slate Grey / `outline-variant` for border and accent circle, `text-outline` for typography.

### Data Tables
- Compact row height (`40px`).
- Bottom borders only (`border-b border-outline-variant`), no vertical lines.
- Headers: all-caps `label-sm` style.

### Sidebar Navigation
- Fixed width: 240px. Light background.
- Active state: Indicated by a 2px vertical Indigo (`primary`) bar on the left edge.

### Modal/Dialog Chrome
- **Backdrop**: Semi-transparent dark overlay (`bg-black/50` or similar).
- **Container**: `bg-surface-container-lowest rounded-lg shadow-[0px_10px_15px_rgba(0,0,0,0.1)]`.
- **Sizing & Spacing**: Explicit maximum width of `500px` (or Tailwind's `max-w-lg`) with internal padding of `24px` (`p-6`).

## 8. Chart Palette

A dedicated set of colors extracted from Dashboard data visualizations (Spend by Member, Split Type Breakdown, Spending Over Time). 

> [!WARNING]
> These tokens are reserved **strictly for categorical chart series**. Do NOT reuse the semantic secondary (positive/inflow) or error (negative/outflow) tokens for charts, as they carry specific financial-status meaning elsewhere in the app. The reuse of `primary` and fixed tokens is a conscious, low-stakes reuse that does not conflict with semantic status meanings.

- **Chart 1 (Deep Indigo)**: `primary` (`#3525cd`)
- **Chart 2 (Warm Rust/Tertiary)**: `tertiary` (`#7e3000`) - *Replaced original Teal to preserve its semantic inflow meaning.*
- **Chart 3 (Mint)**: `secondary-fixed` (`#89f5e7`)
- **Chart 4 (Soft Lavender)**: `primary-fixed` (`#e2dfff`)

## 9. Forward-Looking Component Primitives
Extracted from the Stitch Component Library screen for future features:

- **Category Tags (Bento Box)**:
  > [!NOTE]
  > The hex values below are **placeholder colors** pending proper token integration. When the Expense Categories feature is built, these should be formalized as theme tokens rather than raw hex strings in component code.
  - *Food*: `bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]`
  - *Travel*: `bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]`
  - *Stay*: `bg-primary-fixed text-on-primary-fixed border-primary-fixed-dim`
  - *Entertainment*: `bg-[#F3E5F5] text-[#6A1B9A] border-[#E1BEE7]`
- **Recurring Indicator**: `bg-secondary-container text-on-secondary-container rounded-md` (with sync icon).
- **Receipt Upload Dropzone**: `bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl p-6`. Hover state adds `border-primary` and subtle tint.
- **Activity Feed Row**: `bg-surface-container-lowest border border-outline-variant rounded-xl`. Rows have `hover:bg-surface-variant`.
- **Currency Selector**: Toggle grouping in a `bg-surface-container rounded-lg border border-outline-variant` wrap. Selected state uses `bg-surface-container-lowest shadow-sm`.
- **Export Button**: `border border-outline-variant rounded-lg hover:bg-surface-variant` with a download icon.
- **Archived State (Card)**: `opacity-75 filter grayscale-[50%] hover:opacity-100 transition-opacity`.
- **QR Code Card**: `bg-primary text-on-primary rounded-xl shadow-lg relative overflow-hidden`.
- **Email Invite Row**: Inline input paired with a primary button (`whitespace-nowrap`).
- **Analytics Chart Cards**: Bento layout cards with `h-64` and embedded data visualizations.
