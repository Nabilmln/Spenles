# Spenles Repository Instructions

## Project overview

Spenles is a personal finance management web application.

The application allows users to:

- record income and expenses;
- manage personal transaction categories;
- monitor monthly cash flow;
- create category budgets;
- manage multiple accounts or wallets;
- generate financial reports;
- calculate split bills;
- export personal financial data.

## Product defaults

- Product name: Spenles
- Application language: Indonesian
- Default currency: IDR
- Default timezone: Asia/Jakarta
- Primary system color: Blue
- Platform: Responsive web application
- Design approach: Mobile-first

## Required documents

Before implementing a task, read:

1. `docs/00-INDEX.md`
2. `docs/product/PRD.md`
3. `docs/product/SCOPE.md`
4. `docs/product/BUSINESS-RULES.md`
5. `docs/architecture/TECH-STACK.md`
6. `docs/architecture/SYSTEM-ARCHITECTURE.md`
7. `docs/database/DATABASE-SCHEMA.md`
8. `docs/quality/DEFINITION-OF-DONE.md`
9. The active phase document under `docs/planning/`

Do not implement features from another phase unless explicitly requested.

## Source-of-truth priority

When documentation conflicts, use this priority:

1. `docs/product/PRD.md`
2. `docs/product/BUSINESS-RULES.md`
3. `docs/product/SCOPE.md`
4. `docs/database/DATABASE-SCHEMA.md`
5. `docs/architecture/SYSTEM-ARCHITECTURE.md`
6. Active phase document
7. Existing implementation

Report unresolved conflicts before creating a new business rule.

## Technology rules

- Use Next.js App Router.
- Use TypeScript with strict mode.
- Use npm as the only package manager.
- Use Neon PostgreSQL.
- Use Drizzle ORM and Drizzle Kit.
- Use the Neon serverless driver.
- Use Neon Auth for authentication.
- Use Tailwind CSS.
- Use Zod for server-side validation.
- Use React Hook Form for complex forms.
- Use Recharts for charts.
- Do not introduce another ORM.
- Do not introduce another authentication provider.
- Do not introduce a new production dependency without a clear need.

## Architecture rules

- Use a modular monolith.
- Keep application routes under `src/app/`.
- Keep domain modules under `src/modules/`.
- Keep reusable UI under `src/components/`.
- Keep database access under `src/db/`.
- Keep server-only code outside client components.
- Do not query the database directly from client components.
- Use Server Actions for internal mutations when appropriate.
- Use Route Handlers for HTTP endpoints, exports, and external integrations.

## Authentication and authorization

- Obtain the user ID from the authenticated server session.
- Never trust a user ID submitted from the browser.
- Scope every user-owned database query by authenticated user ID.
- Verify ownership before update or delete operations.
- Never expose `DATABASE_URL` to the browser.
- Never place database credentials in a `NEXT_PUBLIC_` variable.

## Financial data rules

- Store IDR values as integer rupiah.
- Do not use floating-point storage for money.
- Perform authoritative financial calculations on the server.
- Transaction totals must be deterministic.
- Split-bill allocations must reconcile exactly with the final bill.
- Rounding differences must be handled explicitly.

## Database rules

- Define schema through Drizzle schema files.
- Generate a migration for every persistent schema change.
- Never modify a migration that has already been applied.
- Update `docs/database/DATABASE-SCHEMA.md` after schema changes.
- Add indexes for frequently filtered foreign keys and dates.
- Add seed data for default income and expense categories.

## Documentation rules

Update the relevant documentation when:

- business rules change;
- database schema changes;
- environment variables change;
- routes or APIs change;
- features are added or removed;
- acceptance criteria change.

## Planning rules

For significant features, migrations, or refactors:

1. Read `.agent/PLANS.md`.
2. Create an execution plan under `docs/exec-plans/`.
3. Keep the execution plan updated during implementation.
4. Record decisions, test results, and unresolved issues.

## Required checks

After relevant changes, run:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

Run end-to-end tests when the user flow changes and an E2E script is available.

Do not report work as complete when required checks fail.

## Completion response

After completing a task, report:

1. Summary of the implementation.
2. Files created, modified, or deleted.
3. Database migrations created.
4. Commands executed and their results.
5. Tests that passed or failed.
6. Documentation updated.
7. Remaining risks or limitations.
8. One suggested conventional commit message.

## Git rules

- Keep changes focused on the active task.
- Do not modify unrelated files.
- Do not commit secrets.
- Do not commit `.env.local`.
- Do not mix npm with another package manager.
- Do not commit generated build directories.

checkpoin streak github ehe