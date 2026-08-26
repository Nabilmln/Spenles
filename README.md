# Spenles

Spenles adalah aplikasi web pengelolaan keuangan pribadi berbahasa Indonesia.
Fase 01 menyediakan fondasi aplikasi dan Fase 02 menyediakan transaksi
pemasukan/pengeluaran, kalkulator aman, riwayat transaksi, serta pengelolaan
kategori. Fase 03 menyediakan dashboard arus kas dengan periode tervalidasi,
ringkasan perbandingan, tiga grafik aksesibel, profil arus kas, dan transaksi
terbaru. Fase 04 menyediakan banyak akun IDR, saldo otoritatif, transfer
internal, anggaran kategori bulanan, transaksi berulang idempoten, scheduler
aman, dan peringatan dalam aplikasi. Fase 05 menyediakan split bill dengan
perhitungan rupiah deterministik dan snapshot final. Fase 06 menyediakan
laporan PDF privat, ekspor transaksi CSV yang aman untuk spreadsheet, dan
backup data pribadi JSON berversi.

## Persyaratan

- Node.js 22 LTS (di-pin oleh `.nvmrc` dan `.node-version`; `engines` di
  `package.json` adalah `>=22 <23`)
- npm
- Proyek Neon PostgreSQL dengan Neon Auth aktif

Gunakan Node 22 LTS saat mengembangkan dan sebelum rilis. Pada Windows,
pakai Node Version Manager untuk Windows (`nvm` dari coreybutler) lalu
`nvm install 22` dan `nvm use`; pada sistem POSIX pakai `fnm`/`nvm`/`asdf`.
Saat ini repo di-pin ke Node 22; verifikasi dengan `node --version` sebelum
menjalankan `npm ci`/`npm run build`.

## Menjalankan secara lokal

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `DATABASE_URL`, `NEON_AUTH_BASE_URL`,
   `NEON_AUTH_COOKIE_SECRET`, dan `CRON_SECRET`. `CRON_SECRET` harus berupa
   rahasia acak server-only dengan sedikitnya 32 karakter.
3. Pasang dependensi dan migrasikan database:

```bash
npm ci
npm run db:migrate
```

4. Jalankan aplikasi:

```bash
npm run dev
```

Buka `http://localhost:3000`. Gunakan npm saja; jangan membuat lockfile Yarn,
pnpm, atau Bun.

## Perintah

```bash
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
npm run db:generate
npm run db:migrate
npm run db:studio
```

Kode aplikasi berada di `src/`. Akses database hanya boleh melalui modul
server-only di `src/db/`.

## Database integration test

Database integration test wajib memakai Neon branch/database terpisah melalui
`TEST_DATABASE_URL`. Command berikut akan berhenti tanpa membuka koneksi bila
variabel tersebut hilang, sama dengan `DATABASE_URL`, atau target
teridentifikasi sebagai production:

```bash
npm run test:integration
```

Jangan arahkan `TEST_DATABASE_URL` ke database development atau production.

## End-to-end test (Playwright)

Suite E2E berjalan melawan server dev lokal dan Neon branchable Auth
terisolasi. Salin `.env.e2e.example` menjadi `.env.e2e.local` dan isi semua
variabel, lalu:

```bash
npm run test:e2e
```

Konfigurasi E2E fail-closed: tanpa `.env.e2e.local` yang lengkap, perintah
berhenti dan mencantumkan variabel yang hilang. Target E2E wajib non-production
(lokal/preview/test/dev), `TEST_DATABASE_URL` harus berbeda dari `DATABASE_URL`,
endpoint Auth uji harus berbeda dari endpoint aplikasi, dan
`E2E_TEST_TARGET_ID` harus sama dengan `E2E_AUTH_TEST_TARGET_ID` (satu target
Neon branchable yang sama untuk database dan Auth). Jangan pernah mengisi
`.env.e2e.local` dengan target production atau credential nyata dan jangan
commit file tersebut.

## Scheduler transaksi berulang

Vercel Cron memanggil `GET /api/cron/recurring-transactions` setiap jam sesuai
`vercel.json`. Endpoint hanya menerima `Authorization: Bearer CRON_SECRET`,
tidak menggunakan sesi browser sebagai otoritas, tidak menerima user ID, dan
hanya mengembalikan hitungan operasional aman. Pastikan paket Vercel yang
digunakan mendukung jadwal per jam sebelum rilis.

`CRON_SECRET` wajib diisi (sedikitnya 32 karakter) untuk rilis: `npm run
validate:env` gagal bila tidak tersedia, dan endpoint cron mengembalikan
`401 Tidak diizinkan` (fail-closed, tanpa menjalankan pekerjaan) selama secret
kosong/keliru. Jangan pernah menempatkan secret pada nilai yang menyerupai
konfigurasi contoh di `.env.example`. Generate secret misalnya dengan:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Jadwal Vercel Cron berjalan dalam UTC. Karena aplikasi menggunakan timezone
Asia/Jakarta (UTC+7), penjadwalan "setiap jam" memakai pukul UTC; catat bahwa
transaksi berulang dinilai terhadap waktu server aplikasi, bukan terhadap
zona waktu per pengguna.

## Laporan dan ekspor

Halaman `/reports` menyediakan laporan PDF bulanan, tahunan, atau rentang
khusus; CSV transaksi; dan backup JSON versi 1.0. Semua unduhan dibuat
server-side dari sesi terverifikasi, dibatasi ukurannya, dan memakai respons
private/no-store. Backup mencakup data finansial pribadi tetapi tidak mencakup
password, sesi, token, credential, atau secret.

nwjondoawjndwon