---
name: Spenles
description: A calm, phone-first personal finance interface with a light desktop introduction.
colors:
  primary-50: "#eef2ff"
  primary-100: "#e0e7ff"
  primary-500: "#6366f1"
  primary-600: "#4f46e5"
  primary-700: "#4338ca"
  income: "#22c55e"
  expense: "#ef4444"
  warning: "#f59e0b"
  background: "#f5f5f7"
  surface: "#ffffff"
  surface-subtle: "#f0f0f3"
  foreground: "#0f0f12"
  muted: "#4f505c"
  border: "#e2e2e8"
  landing-ink: "#19191c"
  landing-background: "#f7f7f8"
  dark-background: "#08080a"
  dark-surface: "#101013"
  dark-surface-subtle: "#17171c"
  dark-foreground: "#ededf0"
  dark-muted: "#a3a3af"
  dark-border: "#1f1f26"
typography:
  display:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.55rem, 4.9vw, 5.45rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.038em"
  headline:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 3.4vw, 3.6rem)"
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 500
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
rounded:
  control: "0.65rem"
  card: "0.85rem"
  feature-card: "1.5rem"
  pill: "999px"
spacing:
  compact: "0.5rem"
  control-inline: "0.9rem"
  card-inset: "0.9rem"
  section-gap: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0.55rem 0.9rem"
    height: "2.6rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-700}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0.55rem 0.9rem"
  field:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0.6rem 0.8rem"
    height: "2.6rem"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-inset}"
  landing-action:
    backgroundColor: "{colors.landing-ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.5rem"
    height: "3.625rem"
---

# Design System: Spenles

## Overview

**Creative North Star: "Clear Money, Calm Hands"**

Spenles makes everyday financial information feel approachable and legible. Its mobile app uses compact white surfaces, gentle borders, and a restrained indigo accent so amounts, actions, and status remain easy to scan. Poppins gives the interface a friendly, steady voice.

The desktop introduction uses the same brand mark, font, accent, and rounded forms at a more spacious scale. Its dark call to action and illustrative phone previews provide emphasis without replacing the mobile app's visual identity.

**Key Characteristics:**
- Light neutral canvas with crisp white working surfaces.
- Indigo identifies primary action and selected state; financial colors carry meaning.
- Rounded controls and cards with soft, selective depth.
- Compact mobile task layouts and spacious desktop storytelling.

## Colors

The palette combines cool paper neutrals with a clear indigo action color. The app has explicit light and dark themes; the landing page is light by design.

### Primary

- **Clear Indigo:** The primary scale marks actions, selected navigation, focus, and small branded accents. The bright end works as a pale tint behind icons; the deeper end supports hovered controls.

### Neutral

- **Cool Paper:** The background and subtle surface separate the canvas from white cards without heavy outlines.
- **White Surface:** Cards, fields where appropriate, and elevated panels remain bright and readable.
- **Deep Ink:** Foreground text and the landing call to action use near-black neutrals for strong hierarchy.
- **Quiet Gray:** Muted text and fine borders support detail without competing with amounts.
- **Dark App Surfaces:** The app's dark theme swaps the canvas, cards, borders, and text to near-black and soft white, while retaining the same hierarchy and indigo role. The desktop landing keeps its light palette.

### Semantic

- **Income Green, Expense Red, Warning Amber:** These colors communicate financial or warning meaning in the app. They are not decorative accents.

**The Accent Meaning Rule.** Reserve indigo for brand, action, focus, and selected state; preserve income, expense, and warning colors for their semantic roles.

## Typography

**Display Font:** Poppins with system sans-serif fallback.  
**Body Font:** Poppins with system sans-serif fallback.

The app uses short, readable labels and modest body text. The landing page enlarges the same typeface for its hero and section headings, with tighter tracking and balanced wrapping. Financial amounts use tabular numerals.

### Hierarchy

- **Display:** Landing hero only; large, semibold, and tightly tracked.
- **Headline:** Landing section titles; semibold with short line lengths.
- **Title:** App section and entity headings; medium weight and slight negative tracking.
- **Body:** App explanations and form text; compact but comfortably spaced.
- **Label:** Controls, field names, and navigation; medium weight.

**The Amount Clarity Rule.** Give monetary figures clear contrast and tabular alignment; supporting labels remain visibly quieter.

## Layout

The mobile app is the working surface below 861px. It uses stacked cards, compact spacing, a bottom floating navigation bar, and page groups with a 1.5rem rhythm. Individual cards usually use a 0.9rem inset. A few controls adapt further at 540px.

At 861px and above, the desktop introduction uses a centered container with generous side margins, a text-and-phone hero, a two-column feature section, and a distinct setup panel. Its layout stacks below 1220px, with additional width and section adjustments below 980px. These landing compositions are specific to that surface; the shared system is its type, colors, shapes, and depth.

## Elevation & Depth

The app uses pale canvas contrast and fine borders for most separation. A low ambient card shadow adds lift to working surfaces. Stronger shadows are reserved for the brand mark, floating mobile navigation, dialogs, and prominent landing phone previews. Dark panels use tonal contrast instead of many nested shadows.

### Shadow Vocabulary

- **Card:** `0 1px 3px rgb(0 0 0 / 7%), 0 6px 20px rgb(0 0 0 / 6%)` on standard light cards.
- **Floating navigation:** `0 10px 40px rgb(15 15 18 / 18%)` on the mobile navigation bar.
- **Brand mark:** `0 4px 16px rgb(79 70 229 / 40%)` gives the compact logo its small glow.

**The Quiet Depth Rule.** Use a border or surface shift first; reserve strong elevation for floating elements and focal previews.

## Shapes

Working controls use gently rounded corners, with cards slightly rounder than controls. Larger financial cards and landing panels use broader corners. Navigation pills and landing actions are fully rounded. Fine borders help pale surfaces remain distinct, while large dark or indigo panels can stand on tonal contrast alone.

## Components

### Buttons

- **App primary:** Indigo fill, white medium-weight text, compact control radius, and a minimum height of 2.6rem. Hover deepens the fill and shadow; active state shifts down one pixel. Disabled state reduces opacity.
- **App ghost:** Transparent fill and foreground text, gaining a subtle surface on hover.
- **Landing action:** Dark ink fill and white text in a pill, with greater height and padding. Its hover state lifts slightly.
- **Focus:** Keyboard focus remains visible. The landing uses a stronger indigo outline than the app's shared focus ring.

### Cards / Containers

- **Standard card:** White surface, fine border, 0.85rem corners, 0.9rem padding, and the low card shadow.
- **Financial card:** Broader corners, indigo gradient, white text, and stronger depth for summary information.
- **Landing panel:** A large dark rounded block creates a clear destination for phone setup steps.

### Inputs / Fields

- **Style:** Subtle gray fill, fine border, 0.65rem corners, and at least 2.6rem height.
- **Focus:** Indigo border with a soft matching ring. Disabled fields reduce opacity and signal the inactive state.
- **Labels:** Medium-weight text stays near the field; helper and error text use quieter or semantic colors.

### Navigation

- **Mobile app:** A floating rounded bar holds icon links and expands the active label in a pale indigo pill.
- **Brand:** The shared indigo rounded-square wallet mark anchors app and landing navigation.
- **Landing:** Simple text links and one dark action keep the desktop header light.

## Do's and Don'ts

### Do:

- **Do** use the shared Poppins, indigo, white surface, and rounded-control language when extending either surface.
- **Do** keep financial figures stronger than supporting labels.
- **Do** preserve visible focus and reduced-motion behavior when adding interactions.

### Don't:

- **Don't** use income, expense, or warning colors as arbitrary decoration.
- **Don't** turn the spacious landing composition into the density standard for mobile tasks.
- **Don't** add stronger shadows to every card; depth has a specific floating or focal purpose.
