# Spenles

Spenles adalah aplikasi web pengelolaan keuangan pribadi untuk satu pengguna
(proyek privat). Aplikasi berbahasa Indonesia, berbasis IDR, dan dikembangkan
dengan pendekatan mobile-first. Tujuan utamanya adalah mencatat arus kas
harian, mengelola pengeluaran per kategori, membagi tagihan, dan menyajikan
laporan finansial dengan perhitungan yang deterministik dan dapat diaudit.

Aplikasi ini bukan platform bank, pembayaran, investasi, atau akuntansi
profesional.

## Fitur utama

- **Transaksi pemasukan dan pengeluaran** dengan kalkulasi server-side yang
  aman dan bebas floating point (rupiah disimpan sebagai integer).
- **Kategori transaksi** personal yang dapat dikelola per pengguna, termasuk
  kategori bawaan untuk pemasukan dan pengeluaran.
- **Dashboard arus kas** dengan periode tervalidasi, ringkasan perbandingan,
  grafik aksesibel (Recharts), profil saldo, dan transaksi terbaru.
- **Banyak akun/wallet IDR** dengan saldo otoritatif dan transfer internal
  antar-akun.
- **Anggaran kategori bulanan** dan pemantauan pemakaian.
- **Transaksi berulang** dengan scheduler idempotent dan peringatan dalam
  aplikasi.
- **Split bill** dengan rincian tanggung jawab per orang yang deterministik:
  subtotal, diskon, pajak, service charge, dan total final yang tersimpan
  sebagai snapshot bernomor versi.
- **Laporan dan ekspor**: laporan PDF privat, ekspor transaksi CSV yang aman
  untuk spreadsheet, dan backup data pribadi JSON ber-versi.

## Manfaat

- **Kontrol keuangan harian** dalam satu aplikasi, tanpa spreadsheet yang
  rawan salah hitung.
- **Perhitungan yang dapat dipercaya**: semua operasi keuangan dilakukan di
  server dengan integer rupiah, sehingga hasil selalu deterministik dan
  konsisten.
- **Privasi data**: data dipisahkan per pengguna, laporan dibuat server-side
  dari sesi terverifikasi, dan tidak ada kredensial database yang bocor ke
  browser.
- **Mudah berbagi tagihan**: fitur split bill menghitung otomatis berapa
  tanggung jawab masing-masing orang, termasuk pajak dan service charge.
- **Keputusan berbasis data** berkat grafik, laporan, dan ringkasan bulanan.

## Hal yang dipelajari dari proyek ini

- **Next.js App Router** untuk aplikasi full-stack modular monolith yang
  benar-benar server-first.
- **TypeScript strict** dan pola pemisahan kode server-only dari komponen
  client.
- **Drizzle ORM + Neon PostgreSQL** dengan migrasi ber-versi dan Database yang
  memiliki constraint untuk menjamin integritas finansial.
- **Authentikasi server-side** (Neon Auth) dengan otorisasi pada setiap query
  berdasarkan sesi pengguna.
- **Kalkulasi uang yang benar**: penyimpanan integer rupiah, perhitungan
  otoritatif di server, dan penanganan pembulatan secara eksplisit.
- **Server Actions dan Route Handlers** untuk mutasi internal dan
  eksternal yang aman.
- **Pengujian berlapis**: unit test (Vitest), integration test terisolasi
  (Neon branch), dan E2E (Playwright + aksesibilitas).
- **Deployment serverless dan scheduler**: Vercel, Vercel Cron yang
  fail-closed, dan validasi environment saat rilis.

## Tech stack

- Next.js (App Router) + React + TypeScript strict
- Neon PostgreSQL + Drizzle ORM + driver serverless Neon + Neon Auth
- Tailwind CSS, Recharts, Zod
- Vitest, Testing Library, Playwright
- npm sebagai satu-satunya package manager

## Prasyarat

- Node.js 22 LTS (di-pin oleh `.nvmrc` / `.node-version`; `engines` =
  `>=22 <23`)
- Dashboard Neon PostgreSQL dengan Neon Auth aktif
- npm

Gunakan Node 22 LTS: `node --version` diharapkan 22.x sebelum menjalankan
`npm ci` / `npm run build`.

## Set up lokal

```bash
# 1. Install dependensi dengan npm saja
npm ci

# 2. Siapkan environment
cp .env.example .env.local
```

Isi `.env.local`:

- `DATABASE_URL` — koneksi PostgreSQL server-only
- `NEON_AUTH_BASE_URL` — endpoint Neon Auth
- `NEON_AUTH_COOKIE_SECRET` — rahasia acak minimal 32 karakter
- `CRON_SECRET` — rahasia server-only minimal 32 karakter (diwajibkan saat
  rilis; endpoint cron mengembalikan 401 jika kosong)
- `NEXT_PUBLIC_APP_URL` — URL aplikasi

```bash
# 3. Migrasikan database
npm run db:migrate

# 4. Jalankan aplikasi
npm run dev
```

Buka `http://localhost:3000`.

## Testing

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run test          # unit test (Vitest)
npm run test:integration  # integration test wajib memakai TEST_DATABASE_URL
```

Integration test menggunakan Neon branch/database terpisah melalui
`TEST_DATABASE_URL` dan berhenti jika variabel hilang, sama dengan
`DATABASE_URL`, atau mengarah ke target production.

E2E (Playwright) berjalan melawan server dev lokal dan isolated Neon
branchable Auth:

```bash
cp .env.e2e.example .env.e2e.local  # isi semua variabel
npm run test:e2e
```

Konfigurasi E2E fail-closed: tanpa `.env.e2e.local` yang lengkap, perintah
berhenti. Jangan pernah mengisi target production atau kredensial nyata pada
file tersebut.

## Deployment (Vercel)

1. Impor repositori ke Vercel dan atur framework preset Next.js (Node 22).
2. Tambahkan variabel environment di dashboard Vercel (lihat daftar pada
   bagian set up lokal). Jangan pernah mengekspos `DATABASE_URL` ke browser.
3. Sebelum atau setelah deployment, jalankan migrasi terhadap database
   tujuan:

   ```bash
   npm run db:migrate
   ```

4. Pastikan `npm run validate:env` lolos dengan environment rilis.
5. Scheduler transaksi berulang memanggil `GET /api/cron/recurring-transactions`
   setiap jam sesuai `vercel.json`, memakai `Authorization: Bearer CRON_SECRET`.
   Simpan `CRON_SECRET` (minimal 32 karakter) di environment Vercel:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

Catatan: jadwal Vercel Cron berjalan dalam UTC sedangkan aplikasi memakai
timezone Asia/Jakarta. Jangan commit `.env.local` / `.env.e2e.local`.

## Perintah umum

```bash
npm run dev             # server development
npm run build           # build produksi
npm run start           # menjalankan hasil build
npm run lint            # lint
npm run typecheck       # type check
npm run test            # unit test
npm run test:integration
npm run test:e2e        # E2E (Playwright)
npm run validate:env    # validasi environment rilis
npm run db:generate     # generate migrasi Drizzle
npm run db:migrate      # jalankan migrasi
npm run db:studio       # browse schema
```

Kode aplikasi berada di `src/`. Akses database hanya boleh melalui modul
server-only di `src/db/`.

## Lisensi

Proyek ini bersifat privat (`"private": true` pada `package.json`) dan
belum dilisensikan untuk penggunaan publik; seluruh hak cipta dilindungi.
Tetapkan lisensi terbuka yang sesuai sebelum proyek ini dirilis ke publik.