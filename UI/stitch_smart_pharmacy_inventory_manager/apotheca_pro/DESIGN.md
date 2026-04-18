# Design System Document: The Clinical Curator

## 1. Overview & Creative North Star
In the high-stakes environment of pharmaceutical logistics, "standard" UI is a liability. This design system moves beyond the sterile, grid-locked templates of legacy medical software to embrace **"The Clinical Curator"**—a creative north star defined by precision transparency, editorial authority, and tonal depth.

We reject the "flat" web. Instead, we utilize layered surfaces and sophisticated typography to guide the pharmacist’s eye. The system breaks traditional layouts through **intentional asymmetry**: information-dense data tables are balanced by expansive, breathable dashboard headers. This is a high-end tool that feels less like a database and more like a premium command center.

## 2. Colors & Tonal Architecture
The palette transitions from deep, authoritative blues to refreshing medicinal teals, anchored by a rigorous semantic system for inventory safety.

### The Color Palette (Material Logic)
- **Primary Hub (#00507d):** Used for core navigation and high-level actions.
- **Secondary Vitality (#006a61):** Used for "healthy" system states and secondary navigation.
- **The Expiry Semantic:** 
    - **Critical (<30d):** `error` (#EF4444) text on `error_container`.
    - **Warning (<90d):** `tertiary` (#F59E0B) text on `tertiary_container`.
    - **Stable:** `secondary` (#10B981) text on `secondary_container`.

### The "No-Line" Rule
To achieve a high-end editorial feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined through background color shifts. 
- Use `surface-container-low` for the main canvas background.
- Use `surface-container-lowest` (pure white) for primary content cards.
- Use `surface-container-high` for interactive side panels.
*The transition between these tones provides all the structural definition required.*

### The Glass & Gradient Rule
For the "Signature Inventory Hero" widgets, use a subtle linear gradient: `primary` (#00507d) to `primary_container` (#0369a1) at a 135-degree angle. Floating action panels should utilize **Glassmorphism**: a semi-transparent `surface` color with a `24px` backdrop blur to maintain a sense of environmental depth.

## 3. Typography: Editorial Precision
We pair the geometric authority of **Manrope** for large-scale displays with the surgical legibility of **Inter** for data-heavy environments.

- **Display & Headlines (Manrope):** These are your "Editorial" voices. Use `display-lg` for inventory totals and `headline-sm` for widget titles. The wide apertures of Manrope convey modern, trustworthy transparency.
- **Titles & Body (Inter):** The "Functional" voice. Use `title-md` for table headers and `body-md` for patient/drug names.
- **Labels (Inter):** `label-sm` is reserved for micro-data (lot numbers, SKU codes). The high x-height of Inter ensures these remain legible even at 11px.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often messy. In this system, hierarchy is achieved through **Stacking Tiers.**

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a "soft lift."
- **Ambient Shadows:** For floating modals, use an extra-diffused shadow: `0px 12px 32px rgba(11, 28, 48, 0.06)`. The shadow color is a tinted version of `on-surface`, not a neutral grey.
- **The Ghost Border:** If a visual separator is required for accessibility in dense tables, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.

## 5. Components

### Dashboard Widgets
Widgets should not have borders. Use the **Signature Texture**: a 4px vertical accent bar on the left side of the card using the `primary` or `secondary` token to indicate the category of the data. 

### Data Tables
- **No Divider Lines:** Separate rows using vertical white space (16px) or a subtle hover state shift to `surface-container-high`.
- **Zebra Striping:** Use `surface-container-lowest` for odd rows and `surface-container-low` for even rows.
- **Header Alignment:** `title-sm` in `on-surface-variant`, all-caps with 0.05em tracking for an architectural feel.

### Status Badges (Expiry System)
Badges use a "Soft-Fill" style.
- **Critical:** `on-error-container` text on `error-container` background.
- **Warning:** `on-tertiary-fixed-variant` text on `tertiary-fixed` background.
Roundedness should be set to `full` (pill-shaped) for badges to contrast against the `md` roundedness of cards.

### Action Buttons
- **Primary:** Linear gradient from `primary` to `primary_container` with `on-primary` text. No border.
- **Secondary:** `surface-container-high` background with `primary` text.
- **Ghost:** No background; `primary` text; `outline-variant` at 20% opacity for the "Ghost Border" effect on hover.

### Input Fields
Inputs must use `surface-container-lowest`. When focused, the "Ghost Border" becomes a 2px solid `primary` stroke. Labels must always be visible using `label-md` to ensure pharmacists never lose context during rapid entry.

## 6. Do’s and Don’ts

### Do:
- **Do** use whitespace as a functional tool. A 40px gap between inventory categories is better than a line.
- **Do** use `surface-bright` for search bars to make them the focal point of the navigation.
- **Do** ensure the `error` red is only used for items expiring in <30 days to prevent "alert fatigue."

### Don't:
- **Don't** use pure black (#000) for text. Use `on-surface` (#0b1c30) to maintain a premium, softer contrast.
- **Don't** use standard "drop shadows" on every card. Rely on tonal shifts between `surface-container` tiers first.
- **Don't** use 100% opaque borders. They clutter the medical professional's field of vision and increase cognitive load.