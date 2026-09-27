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
accounts and category budgets, calculate shared bills, and review or export
their own financial data. The application is an installable mobile PWA, with
online access and fresh authenticated pages. It is not a banking, payment,
investment, or professional accounting service.

## Operating Context

- The finance app renders below 861px. At wider viewports, the site shows a
  landing page about Spenles instead of the finance interface.
- The desktop landing's “Try Spenles on your phone” action leads to setup
  steps on the page: open the site on a phone, create an account or sign in,
  and record a first transaction. Visitors can copy the site link.
- Users enter and review amounts in IDR. Financial periods use Asia/Jakarta.
- The intended product UI language is English throughout. The current UI
  still mixes English and Indonesian; that is implementation drift, not a
  bilingual product decision.

## Capabilities and Constraints

- Personal income and expense transactions, categories, accounts, internal
  transfers, budgets, dashboard summaries, split bills, PDF reports, and a
  versioned JSON backup are in the current app.
- Registration, sign-in, and password recovery use Neon Auth. Financial data
  belongs to the authenticated user; split-bill contacts are personal records.
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
logo has no drawn tile in the interface; install icons use an opaque paper
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
