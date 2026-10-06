# Spenles

Spenles is a personal finance app for tracking income, expenses, accounts, budgets, and shared bills. It helps you see where your money goes without turning daily tracking into accounting work.

[Try Spenles](https://spenles.vercel.app/) · Designed for phones as an installable web app. On larger screens, the site shows a product overview and phone setup guide.

## What you can do

- Record income and expenses, organize categories, and move money between your own accounts.
- See balances, recent activity, spending trends, and reports for a selected date range.
- Set monthly category budgets and calculate itemized split bills with tax and service charges.

Spenles tracks money; it does not hold funds or process payments. Amounts are stored as whole Indonesian rupiah (IDR), and each user's records are private.

## Architecture

![Spenles architecture: phone app, Next.js server, Neon Auth, domain modules, Drizzle, and Neon PostgreSQL](public/spenles-architecture.png)

The app is a Next.js modular monolith. Server actions and routes check the user session before domain code reads or changes records in Neon PostgreSQL.

## Tech stack

| Icon | Technology | Role |
| :---: | --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" width="22" alt="" /> | **Next.js + React** | App Router, server rendering, and the PWA |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="22" alt="" /> | **TypeScript** | Typed application code |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" width="22" alt="" /> | **Tailwind CSS** | Interface styling; Recharts draws reports |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" width="22" alt="" /> | **Neon PostgreSQL + Drizzle** | Data storage and migrations; Neon Auth handles sign-in |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitest/vitest-original.svg" width="22" alt="" /> | **Vitest + Playwright** | Unit and browser tests |

## Use Spenles

To use the hosted app, open [Spenles](https://spenles.vercel.app/) on a phone and create an account. No installation, database, or code setup is needed.

To keep your own copy, follow the steps below. Your copy uses your own database and accounts; it does not share data with the hosted app.

## Set up your own copy

You need accounts for [GitHub](https://github.com/), [Neon](https://console.neon.tech/), and [Vercel](https://vercel.com/), plus [Node.js 22](https://nodejs.org/) on your laptop. Each service offers a free option for a small personal project, subject to its current limits. Node includes npm, the tool that installs this project's code packages.

1. **Get the code.** Open the [Spenles repository](https://github.com/Nabilmln/Spenles), choose **Fork** to make a copy in your GitHub account, then clone your fork to your laptop with GitHub Desktop or Git. Open the folder containing `package.json` in a terminal (a command window) and run `npm ci`. On Windows, open that folder in File Explorer, type `powershell` in the address bar, and press Enter to open a terminal there.
2. **Create your database.** In Neon, create a project and enable **Neon Auth** for the branch you will use. Click **Connect** and copy the PostgreSQL connection string. Also copy that branch's Auth URL. Use credentials from the **same Neon branch** for both values. [Neon connection guide](https://neon.com/docs/get-started/connect-neon).
3. **Add local settings.** Copy `.env.example` to `.env.local` (`Copy-Item .env.example .env.local` in PowerShell; `cp .env.example .env.local` on macOS/Linux). Open `.env.local` and replace the example values:

   | Setting | What to enter |
   | --- | --- |
   | `DATABASE_URL` | The Neon connection string from **Connect**. |
   | `NEON_AUTH_BASE_URL` | The Auth URL for the same Neon branch. |
   | `NEON_AUTH_COOKIE_SECRET` | A random secret of at least 32 characters; keep it private and stable. |
   | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local use. |
   | `NEXT_PUBLIC_APP_NAME` | Keep `Spenles`. |

   To create a cookie secret, run `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and copy the result. Never upload `.env.local` to GitHub.
4. **Prepare and open the app.** Run `npm run db:migrate` once to create the app's tables, then `npm run dev`. Visit [localhost:3000](http://localhost:3000) on your laptop. The finance UI is designed for phones; use your browser's phone preview to try it on a laptop. If sign-in is blocked locally, check that Neon Auth allows `localhost`. [Neon domain guide](https://neon.com/docs/auth/guides/configure-domains).

### Put your copy online

5. **Import your fork into Vercel.** In Vercel choose **Add New → Project**, connect GitHub, and select your fork. Keep the **Next.js** framework and set **Root Directory** to the folder containing `package.json` (normally the repository root). The project specifies Node.js 22 in `package.json`. A Vercel `*.vercel.app` address is enough; buying a domain is optional. [Vercel Git guide](https://vercel.com/docs/git).
6. **Add production settings before deploying.** On the import screen, add `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `NEXT_PUBLIC_APP_NAME=Spenles`, and `NEXT_PUBLIC_APP_URL=https://YOUR-PROJECT.vercel.app` under **Environment Variables**. Use the same Neon branch as your local setup. For `NEXT_PUBLIC_APP_URL`, use the Vercel address based on the project name you chose; you can correct it after deployment. Keep `TEST_DATABASE_URL` out of Vercel. [Vercel environment guide](https://vercel.com/docs/environment-variables).
7. **Deploy, then confirm the address.** Click **Deploy**. Copy the actual production address Vercel gives you. If it differs from `NEXT_PUBLIC_APP_URL`, change that variable under **Project → Settings → Environment Variables** and choose **Redeploy**. Changes to environment variables do not update an earlier deployment. [Vercel deployment guide](https://vercel.com/docs/git).
8. **Allow sign-in and test.** In Neon Auth, add the exact Vercel production URL (including `https://`, without a trailing slash) as a trusted domain. Open the deployed site on a phone, register a new account, and add a small test transaction. Later pushes to your fork's production branch deploy automatically. [Neon domain guide](https://neon.com/docs/auth/guides/configure-domains).

If you use a different Neon database for production, run `npm run db:migrate` with that database's `DATABASE_URL` before testing the deployed app. The migration command changes the database named in your local `.env.local`, so check that value first.

Use a separate `TEST_DATABASE_URL` only when running integration tests.

## Checks

Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` before shipping changes.
