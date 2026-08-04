# Spenles

Spenles adalah aplikasi web pengelolaan keuangan pribadi berbahasa Indonesia.
Fase 01 menyediakan fondasi aplikasi: Neon Auth, profil pengguna, kategori
bawaan, akun `Kas Utama`, layout responsif, dan tema terang/gelap. Fitur
transaksi dan analisis keuangan belum termasuk.

## Persyaratan

- Node.js 22 LTS
- npm
- Proyek Neon PostgreSQL dengan Neon Auth aktif

## Menjalankan secara lokal

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `DATABASE_URL`, `NEON_AUTH_BASE_URL`, dan
   `NEON_AUTH_COOKIE_SECRET`.
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
npm run build
npm run db:generate
npm run db:migrate
npm run db:studio
```

Kode aplikasi berada di `src/`. Akses database hanya boleh melalui modul
server-only di `src/db/`.
