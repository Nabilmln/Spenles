# Spenles Product

<!-- impeccable:product-schema 1 -->

This is a short, durable product record. For detailed approved behavior, use
`docs/product/PRD.md`, `docs/product/BUSINESS-RULES.md`, and
`docs/product/SCOPE.md`. Those documents are local to this workspace because
`/docs` is intentionally ignored by Git.

## Platform

web

## Users

Individuals who use a phone to record and understand their own finances. The
service supports multiple registered people, each with a separate private
account and financial dataset. Split-bill participants do not need accounts.

## Product Purpose

Spenles helps users record income and expenses, understand cash flow, manage
accounts and category budgets, calculate shared bills, and review
their own financial data. The application is an installable mobile PWA, with
online access and fresh authenticated pages. It is not a banking, payment,
investment, or professional accounting service.

## Operating Context

- The login and finance app render only through 600px of viewport width. At
  tablet and desktop widths (601px and wider), the site shows a landing page
  about Spenles instead of the finance interface.
- The desktop landing Try Spenles action leads to three setup paths: use the
  app on a phone, preview its phone layout with browser device tools, or run
  a personal development copy with repository access and separate service
  credentials. The desktop preview does not make the finance UI a desktop app.
- Users enter and review amounts in IDR. Financial periods use Asia/Jakarta.
- The intended product UI language is English throughout. The current UI
  still mixes English and Indonesian; that is implementation drift, not a
  bilingual product decision.

## Capabilities and Constraints

- Personal income and expense transactions, categories, accounts, internal
  transfers, budgets, dashboard summaries, split bills, interactive reports,
  are in the current app. PDF report generation, report email delivery, and
  personal-data download have been removed.
- Registration, sign-in, and password recovery use Neon Auth. Financial data
  belongs to the authenticated user; split-bill contacts are personal records.
- Split-bill friends use one of five bundled portrait avatars. Owners can choose
  a portrait when adding or editing a friend; older contacts receive a stable
  default portrait until changed.
- Profile photos use the same five bundled portraits. Users can change theirs
  from the profile sheet; an unchanged profile keeps a stable default portrait.
- Users choose one owned account whose balance appears on Home. Every owned
  account remains available for transactions and transfers; Accounts shows the
  combined total separately.
- Authoritative money amounts are integer rupiah and financial calculations
  happen on the server. Split-bill totals reconcile exactly.
- The PWA caches static assets, not authenticated page navigation or API data.
  Offline transaction use is not currently supported.
- Recurring transactions were removed. A CSV export is described in an old
  phase brief but has no current route and is not part of the current product
  contract.
- Future payment or bank import integrations require separate product decisions.

## Brand Commitments

The product name is **Spenles**. Ink black and neutral paper surfaces are the
shared visual direction for the desktop landing and mobile app. The open S
logo has no drawn tile in the interface; users do not choose a theme. Install icons use an opaque paper
background required by mobile platforms. `DESIGN.md` records the system.

## Evidence on Hand

- Current app routes and modules: `src/app/` and `src/modules/`.
- Existing product requirements and rules: `docs/product/` (local, Git ignored).
- PWA implementation: `src/app/manifest.ts` and `public/sw.js`.
- Desktop landing and mobile boundary: `src/app/layout.tsx` and
  `src/components/landing/`.

## Product Principles

1. Keep each person's financial records private.
2. Make daily entry and review practical on a phone.
3. Calculate money deterministically and preserve historical integrity.
4. Use clear English financial language without requiring accounting expertise.
5. Separate shipped behavior from proposed future work in planning documents.
