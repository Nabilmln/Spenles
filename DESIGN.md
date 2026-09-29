---
name: Spenles
description: A phone-first personal finance interface with an ink-and-paper desktop introduction.
colors:
  primary-50: "#f2f2f0"
  primary-100: "#e3e3df"
  primary-300: "#b8b8b2"
  primary-500: "#555551"
  primary-600: "#1d1d1b"
  primary-700: "#111110"
  income: "#15803d"
  expense: "#ef4444"
  warning: "#f59e0b"
  analytics: "#168fe5"
  amount: "#0b70bc"
  background: "#f0f1f3"
  surface: "#ffffff"
  surface-subtle: "#f0f0f3"
  foreground: "#0f0f12"
  muted: "#4f505c"
  border: "#e2e2e8"
  landing-ink: "#171717"
  landing-background: "#ffffff"
  brand-icon-field: "#f7f7f5"
typography:
  display:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.6rem, 6.1vw, 6.4rem)"
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 3.5vw, 4.1rem)"
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
  pdf:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "9pt"
    fontWeight: 400
rounded:
  control: "0.65rem"
  card: "1.15rem"
  feature-card: "1.5rem"
  pill: "999px"
spacing:
  compact: "0.5rem"
  control-inline: "0.9rem"
  card-inset: "1rem"
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

Spenles makes everyday financial information feel approachable and legible. Its mobile app uses compact white surfaces, gentle borders, and ink-black actions so amounts, actions, and status remain easy to scan. Poppins gives the interface a friendly, steady voice.

The desktop landing uses the same open S mark, ink, font, and rounded forms at a more spacious scale. A centered three-phone hero leads into reasons to use the product, its main tools, an income/expense insights preview, and phone setup. The mark appears without a drawn container in the interface; mobile install icons use a plain paper canvas.

**Key Characteristics:**
- Light neutral canvas with crisp white working surfaces.
- Ink identifies primary action and selected state; financial colors carry meaning.
- Rounded controls and cards with soft, selective depth.
- Compact mobile task layouts and spacious desktop storytelling.

## Colors

The palette combines white and paper neutrals with dark ink for actions. The mobile app and landing share one light ink-and-paper style.

### Primary

- **Ink Scale:** The primary scale marks actions, selected navigation, focus, and the logo. Pale neutrals support selected surfaces; darker values carry controls.

### Neutral

- **Cool Paper:** A light gray `#f0f1f3` canvas separates the app from its white cards without heavy outlines.
- **White Surface:** Cards, fields where appropriate, and elevated panels remain bright and readable.
- **Deep Ink:** Foreground text and the landing call to action use near-black neutrals for strong hierarchy.
- **Quiet Gray:** Muted text and fine borders support detail without competing with amounts.

### Semantic

- **Income Green, Expense Red, Warning Amber:** These colors communicate financial or warning meaning where status needs it. The Reports cash-flow line uses ink for income to fit the chart's neutral visual language. Bright sky blue `#168fe5` marks expense trends; its accessible text companion `#0b70bc` marks transaction amounts in lists. Signs and text labels still distinguish income, payments, and transfers.

**The Accent Meaning Rule.** Reserve ink for brand, action, focus, and selected state; preserve income, expense, and warning colors for their semantic roles.

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

The mobile app is the working surface below 861px. It uses stacked cards, compact spacing, a bottom floating navigation bar, and page groups with a 1.5rem rhythm. Individual cards usually use a 1rem inset. A few controls adapt further at 540px.

Visual refinement keeps each menu's sections, order, controls, and interactions intact. Pages load without staggered card entrances; motion is reserved for state feedback.

At 861px and above, the desktop landing has five sections: centered introduction with three phone previews; reasons to use Spenles; feature stories led by split bills, budgets, and reports; a dark income/expense insights panel; and phone setup. The three-phone hero compresses at the mobile boundary; the insights panel stacks below 980px. These compositions are specific to the landing, while type, color, shape, and depth are shared.

## Elevation & Depth

The app uses pale canvas contrast and fine borders for most separation. A low ambient card shadow adds lift to working surfaces. Stronger shadows are reserved for floating mobile navigation, dialogs, and prominent landing phone previews. Dark feature panels use tonal contrast instead of many nested shadows.

### Shadow Vocabulary

- **Card:** `0 5px 18px rgb(15 15 18 / 4%)` on standard light cards.
- **Floating navigation:** `0 10px 32px rgb(15 15 18 / 22%)` on the mobile navigation bar.

**The Quiet Depth Rule.** Use a border or surface shift first; reserve strong elevation for floating elements and focal previews.

## Shapes

Working controls use gently rounded corners, with cards slightly rounder than controls. Larger financial cards and landing panels use broader corners. Navigation pills and landing actions are fully rounded. Fine borders help pale surfaces remain distinct, while large dark panels can stand on tonal contrast alone.

## Components

### Buttons

- **App primary:** Ink fill, white medium-weight text, compact control radius, and a minimum height of 2.6rem. Hover deepens the fill; active state shifts down one pixel. Disabled state reduces opacity.
- **App ghost:** Transparent fill and foreground text, gaining a subtle surface on hover.
- **Landing action:** Dark ink fill and white text in a pill, with greater height and padding. Its hover state lifts slightly.
- **Focus:** Keyboard focus remains visible. The landing uses a strong neutral outline.

### Cards / Containers

- **Standard card:** White surface, fine border, 1.15rem corners, 1rem padding, and a very light card shadow when needed. Account cards use solid graphite without decorative gradients or circles.
- **Transaction rows:** A quiet grey outer surface holds the transaction description below a white inner row. The inner row keeps its existing icon, category, type, amount, date, and action positions; rows without a description show "No Description" in the same footer. Description text is small and uses a darker grey for legibility. Category icons use ink on one quiet gray circle regardless of saved category color. Transaction amounts use the accessible blue amount token. Recent activity has no duplicate day headings or title action because each row shows its date and transactions remain available through navigation.
- **Financial card:** A large transparent cutout illustration shows one graphite card with lightly textured surfaces and “VISA” lettering baked into the image. It has no issuer identity or fake card details. The front pocket leaves room for the live lower-left “Balance:” label, total, and adjacent visibility control rendered by the UI. The dashboard card omits income and expense totals. No rectangular dark panel surrounds the cutout. The illustration is decorative and does not imply an issued payment card.
- **Statistics:** Mobile transaction and report trends use line charts. The transaction overview shows month-to-date cumulative expenses under a Total Expenses label, with the first and last calendar dates of the current Jakarta month at the chart ends. Its blue basis curve and restrained fill fade to transparent over faint vertical grey guides and a matching grey baseline above the dates, without a surrounding card. Future-dated transactions do not enter the current total, and the line ends at today. The Reports cash-flow chart uses the same open chart treatment, with smooth ink-black income and blue expense lines and a matching fading fill under each. Its first and last labels show the selected filter dates exactly; zero-value days or months retain their proper positions within that range. Tooltips identify both IDR series. Labels and values carry meaning beyond color.
- **PDF reports:** Exported reports use the same ink, paper, and semantic colors. Noto Sans is embedded for dependable PDF glyph coverage; it is not an app interface font.
- **Landing insights:** A large dark panel frames illustrative income and expense trends from January through December. Landing chart previews use smooth ink and sky-blue lines, a fading blue expense fill, and faint grey guides. Budget progress in the landing and app uses sky-blue fill, a small position marker, and a clearly blue-tinted striped remainder. Budget status stays in readable text outside the track, with semantic warning or exceeded color. The page reserves its one directional arrow for the main phone setup action; the phone setup section returns to a pale surface.

### Inputs / Fields

- **Style:** Subtle gray fill, fine border, 0.65rem corners, and at least 2.6rem height.
- **Focus:** Ink border with a visible neutral outline. Disabled fields reduce opacity and signal the inactive state.
- **Labels:** Medium-weight text stays near the field; helper and error text use quieter or semantic colors.

### Notifications

- **In-app feedback:** Success, error, and info messages use one white bottom sheet at a time with a striped badge, a short heading, the original action message, and a dark Done button. Success uses the analytics blue, errors retain a distinct red, and info uses ink. A floating close control and backdrop dismiss the sheet; otherwise it closes after four seconds. Messages that arrive together wait their turn. Save actions that change pages return success feedback and a destination; the shared hook queues the sheet before navigating so the result remains visible on the next page.

### Navigation

- **Mobile header:** The shared header stays at the top while pages scroll, using the same canvas color without a separate panel treatment. The dashboard shows the bare open S logo at left and the profile portrait at right. Secondary screens keep their back control at left with the arrow in a small white circle, and the portrait at right. Five coordinated 3D illustrated portraits are assigned as stable default avatars by user ID; the same portrait appears in the profile sheet. Avatar customization is a later feature.
- **Mobile app:** A solid graphite floating bar holds the existing icon links and expands the active label in a quiet translucent pill. The add button is white with an ink icon.
- **Brand:** The shared open S in ink anchors app and landing navigation without a drawn tile. Favicon and install icons use the same vector; opaque PWA canvases and centered Android maskable exports meet platform requirements.
- **Landing:** Simple text links and one dark action keep the desktop header light. It stays visible while scrolling, and section links leave space for its height.

## Do's and Don'ts

### Do:

- **Do** use the shared Poppins, ink, white surface, and rounded-control language when extending either surface.
- **Do** keep financial figures stronger than supporting labels.
- **Do** preserve visible focus and reduced-motion behavior when adding interactions.

### Don't:

- **Don't** use income, expense, or warning colors as arbitrary decoration.
- **Don't** turn the spacious landing composition into the density standard for mobile tasks.
- **Don't** add stronger shadows to every card; depth has a specific floating or focal purpose.
