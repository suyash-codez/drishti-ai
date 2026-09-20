# DRISHTI — Design System (design.md)

This file is the single source of truth for UI. Every screen, component, and 
interaction Antigravity builds must follow this spec exactly. Do not introduce 
new colors, fonts, radii, or spacing values outside what's defined here.

## 1. Brand Direction

DRISHTI blends three references:
- Dashboard structure (weather card + icon-grid navigation) — inspired by farm-management dashboards
- Light, clean, high-contrast screens with a single strong accent CTA — inspired by plant-health apps
- Warm agri-green branding + card-based product/action tiles — inspired by farm marketplace apps

Overall feel: **trustworthy, calm, high-contrast, low-literacy-friendly.** 
Not a flashy consumer app — a tool a farmer trusts at a glance. Icons + color 
carry meaning before text does (critical for the Hindi/voice-first user).

## 2. Color System

### Primary Palette
| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#1B7A3D` | Primary buttons, active nav, brand accents (agri green) |
| `--primary-dark` | `#145C2E` | Pressed states, headers |
| `--primary-light` | `#E6F4EA` | Card backgrounds, selected chips |
| `--accent-blue` | `#2563EB` | Primary CTA on light screens (voice button, "Take action" buttons) |
| `--accent-blue-light` | `#DCE9FE` | Info card backgrounds |

### Alert System Colors (maps directly to PRD section 5.3 — do not change these three)
| Token | Hex | Usage |
|---|---|---|
| `--alert-green` | `#22C55E` | Green tier — usage within 10% optimal |
| `--alert-yellow` | `#F5A623` | Yellow tier — 10–20% above optimal |
| `--alert-red` | `#E5484D` | Red tier — >20% above optimal |
| `--alert-green-bg` | `#EAFBF0` | Green banner background |
| `--alert-yellow-bg` | `#FFF6E5` | Yellow banner background |
| `--alert-red-bg` | `#FDEBEC` | Red banner background |

### Neutrals
| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#FFFFFF` | Base screen background |
| `--bg-muted` | `#F7F8F6` | Section backgrounds, form areas |
| `--surface` | `#FFFFFF` | Card surfaces |
| `--border` | `#E5E7E3` | Card borders, dividers |
| `--text-primary` | `#1A1D1A` | Headings, primary text |
| `--text-secondary` | `#6B716B` | Labels, captions, helper text |
| `--text-inverse` | `#FFFFFF` | Text on colored buttons/headers |

Never use pure black (`#000`) or pure gray tints — always the neutrals above.

## 3. Typography

Font: **Inter** (fallback: system-ui, -apple-system, sans-serif). 
Hindi text: **Noto Sans Devanagari** (fallback: system default) — load both, 
switch by `lang` toggle, never mix fonts mid-string.

| Style | Size | Weight | Usage |
|---|---|---|---|
| `display` | 28px | 700 | Onboarding headline ("अगली पीढ़ी की खेती") |
| `h1` | 22px | 700 | Screen titles |
| `h2` | 18px | 600 | Card section headers ("Manage your fields") |
| `body` | 15px | 400 | Default paragraph/explanation text |
| `body-strong` | 15px | 600 | Emphasized values (₹ savings, amounts) |
| `caption` | 13px | 400 | Helper text, timestamps, units |
| `button-text` | 16px | 600 | All button labels |

Line height: 1.4 for body, 1.2 for headings. Minimum text size anywhere: 13px 
(low-literacy users need legibility, never go smaller).

## 4. Spacing & Radius

8px base unit. Use only: `4, 8, 12, 16, 24, 32, 40` px.

| Element | Radius |
|---|---|
| Buttons (primary/secondary) | `12px` |
| Cards | `16px` |
| Input fields | `10px` |
| Chips/pills (status badges) | `999px` (full pill) |
| Bottom sheet / modal | `24px` top corners only |

Screen padding: `16px` horizontal on mobile, always.
Card internal padding: `16px`.
Gap between stacked cards: `12px`.

## 5. Core Components

### 5.1 Top Header (dashboard screens)
- Left: farm/user icon (circle, 40px) + farm name (`h2`) + subtitle if any
- Right: overflow menu (⋯) or notification bell
- Background: `--bg`, no border, sits flush with status bar
- Pattern reference: Oakdale Ranch dashboard header

### 5.2 Weather/Conditions Card
- Full-width card, `--primary-light` background, `16px` radius
- Left: large temperature (`display` size) + condition text + icon
- Right: 3 stacked mini-stats (Humidity / Soil Moisture / Rainfall) each as a 
  small pill: label (`caption`) above, value (`body-strong`) in a rounded chip
- Pill color reflects status: green pill = "Good", yellow = "Moderate", red = "Low/High"
- This card is the primary output surface for M2/M3 recommendations

### 5.3 Icon Action Grid ("Manage your fields" pattern)
- 2-column grid, `12px` gap, each cell is a square-ish card (`16px` radius, 
  `--surface` bg, `1px solid --border`)
- Each cell: icon in a colored circle (40px, tinted background matching category) 
  centered top, label (`body-strong`) centered below
- Use for: Home screen shortcuts (New Recommendation / History / Alerts / Settings)

### 5.4 Primary Button
- Full-width or auto-width, height `52px`, radius `12px`
- Background `--primary` (or `--accent-blue` for voice/AI-forward actions), 
  text `--text-inverse`, `button-text` style
- Icon + label allowed (e.g. arrow →, mic 🎙), icon trailing for forward actions
- Pressed state: darken 10%
- Disabled: `--border` bg, `--text-secondary` text

### 5.5 Secondary/Outline Button
- Same dimensions as primary, `1.5px solid --primary` border, transparent bg, 
  `--primary` text

### 5.6 Input Fields
- Height `52px`, `10px` radius, `1px solid --border`, `--bg-muted` fill when 
  inactive, `--bg` + `2px --primary` border when focused
- Label above field (`caption`, `--text-secondary`), not placeholder-only 
  (low-literacy users need persistent labels, not disappearing placeholders)
- Numeric fields (soil moisture, temp, rainfall) get a unit suffix chip inside 
  the field, right-aligned (e.g. "°C", "%", "mm")

### 5.7 Alert Banner (PRD 5.3 — critical component)
- Full-width, `16px` radius, `16px` padding
- Background = tier bg color, left edge has `4px` solid bar in tier color
- Icon (🟢/🟡/🔴 or custom SVG) left, message text right (`body-strong` for 
  headline + `body` for detail line)
- Red tier banner is the only one allowed to persist/pin at top of result screen; 
  green/yellow sit inline in the result card

### 5.8 Result Card (core /recommend output)
- Two stacked sub-cards inside one container:
  1. Irrigation block — water-drop icon, amount + timing
  2. Fertilizer block — leaf icon, type + amount
- Below both: Explanation text (`body`, `--text-secondary`, in a light gray 
  inset box) — this is the "why" from the explain service
- Below that: Savings strip — `--primary-light` bg, ₹ amount in large 
  `body-strong` + liters saved in `caption`

### 5.9 Bottom Navigation
- 4 tabs fixed, icons + label, height `64px`, `--bg` background, `1px solid --border` top
- Active tab: icon + label in `--primary`, filled/bold icon variant
- Inactive: `--text-secondary`, outline icon variant
- Tabs: **Home | Recommend | History | Profile** (map DRISHTI's actual sections 
  to this 4-tab pattern — do not exceed 4 tabs)

### 5.10 Language Toggle
- Small pill switch, top-right of header or in Profile, two segments: "EN | हिं" 
  (extendable to 3 for Marathi prototype)
- Active segment: `--primary` bg, white text; inactive: transparent, `--text-secondary`

### 5.11 Voice Input Button (mic)
- Circular FAB, 56px diameter, `--accent-blue` background, white mic icon, 
  positioned bottom-right floating OR inline next to relevant input field
- Active/listening state: pulsing ring animation in `--accent-blue` at 40% opacity
- Post-transcription: opens an editable confirmation sheet (bottom sheet, 
  `24px` top radius) showing filled fields with edit pencils — never auto-submits

### 5.12 Community/History List Item (for logs, past recommendations)
- Horizontal card: small thumbnail/icon (48px, rounded `12px`) left, 
  title (`body-strong`) + meta line (`caption`) right, chevron or status 
  pill far right
- Divider `1px --border` between items, no card shadow — flat list style

## 6. Icons & Illustration

- Icon set: outline-style, 2px stroke, rounded joins (consistent single family 
  — do not mix icon packs)
- Category icon tints (used in circles behind icons):
  - Irrigation/water → `--accent-blue-light` bg, blue icon
  - Fertilizer/soil → `--primary-light` bg, green icon
  - Weather → `#FFF6E5` bg, orange/yellow icon
  - Alerts → tier-matched bg from section 2
- Onboarding-only: one warm, flat-illustration hero image of a farmer (matches 
  Oakdale Ranch style) — used once, on the welcome/Get Started screen only. 
  Rest of the app stays icon-and-data driven, no further illustrations, to 
  keep it fast and functional.

## 7. Motion

- Card entrance: fade + 8px slide-up, 200ms ease-out
- Alert banner appearance: scale from 96% + fade, 150ms
- Button press: 100ms scale to 97%
- No motion longer than 300ms anywhere — this app must feel instant, especially 
  for the live demo

## 8. Accessibility / Low-Literacy Requirements (non-negotiable)

- Every action that matters (irrigation amount, fertilizer amount, alert level) 
  is conveyed by **color + icon + number**, never text alone
- Minimum tap target: 44x44px
- Minimum text contrast: 4.5:1 against its background
- No text-only buttons — every primary/secondary button carries an icon
- Voice button always visible on any screen with a form

## 9. Screen-to-Pattern Mapping

| DRISHTI Screen | Pattern Source |
|---|---|
| Onboarding / Get Started | Illustrated hero + single CTA |
| Home Dashboard | Weather card + icon action grid |
| Input Form (crop/soil/temp/rainfall) | Clean input fields + inline mic button |
| Voice confirm sheet | Bottom sheet, editable fields |
| Result screen | Result card + alert banner + savings strip |
| History | Flat list, no shadows |
| Language toggle | Segmented pill, top-right |

Do not deviate from this file without updating it first — if a new component 
is needed mid-build, add its spec here before implementing.
