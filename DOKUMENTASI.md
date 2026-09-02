# Dokumentasi Penggunaan — Portfolio + LinkJar

> Aplikasi Next.js 14 terpadu: **Portfolio personal** (publik) + **LinkJar** (tool simpan link, login required).  
> Backend: Supabase (Auth + Postgres + Storage). Deploy target: Vercel.

---

## Daftar Isi

1. [Setup Awal](#1-setup-awal)
2. [Konfigurasi Supabase](#2-konfigurasi-supabase)
3. [Menjalankan Aplikasi](#3-menjalankan-aplikasi)
4. [Alur Pengguna — Portfolio (Publik)](#4-alur-pengguna--portfolio-publik)
5. [Alur Pengguna — LinkJar](#5-alur-pengguna--linkjar)
6. [Dashboard Admin](#6-dashboard-admin)
7. [Deploy ke Vercel](#7-deploy-ke-vercel)
8. [Struktur Folder](#8-struktur-folder)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Setup Awal

### Prasyarat
- Node.js >= 18
- npm >= 9
- Akun [Supabase](https://supabase.com) (gratis)
- Akun [Vercel](https://vercel.com) (untuk deploy)

### Install dependencies
```bash
cd portfolio-app
npm install
```

### Isi environment variable
Buka file `.env.local` dan isi dengan kredensial Supabase milikmu:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> **Cara dapat nilai ini:**  
> Supabase Dashboard → Project Settings → API  
> - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`  
> - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
> - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`  
>
> ⚠️ Pastikan URL **tidak** ada `/rest/v1/` di belakangnya. Harus murni `https://xxxx.supabase.co`

---

## 2. Konfigurasi Supabase

### 2a. Jalankan migrasi database
Buka **Supabase Dashboard → SQL Editor**, salin seluruh isi file berikut lalu klik **Run**:

```
supabase/migrations/001_init.sql
```

File ini membuat tabel:
| Tabel | Fungsi |
|---|---|
| `profiles` | Data user (username, role) |
| `projects` | Proyek portfolio |
| `links` | Link tersimpan per user |
| `contact_info` | Info kontak (GitHub, Email, dll) |

Dan mengaktifkan Row Level Security (RLS) di semua tabel.

### 2b. Buat Storage Bucket
Supabase Dashboard → **Storage** → **New bucket**:
- Name: `portfolio-images`
- Public bucket: **ON** (centang)
- Klik **Save**

## 2. Konfigurasi Supabase

### 2a. Jalankan migrasi database
Buka **Supabase Dashboard → SQL Editor**, salin seluruh isi file berikut lalu klik **Run**:

```
supabase/migrations/001_init.sql
```

File ini membuat tabel:
| Tabel | Fungsi |
|---|---|
| `profiles` | Data user (username, role) |
| `projects` | Proyek portfolio |
| `links` | Link tersimpan per user |
| `contact_info` | Info kontak (GitHub, Email, dll) |

Dan mengaktifkan Row Level Security (RLS) di semua tabel.

### 2b. Buat Storage Bucket
Supabase Dashboard → **Storage** → **New bucket**:
- Name: `portfolio-images`
- Public bucket: **ON** (centang)
- Klik **Save**

### 2c. Buat akun admin (dua cara)

**Cara 1 — Pakai seed script (direkomendasikan)**
```bash
npm run seed:admin
```
Perintah ini otomatis membuat akun admin dengan kredensial:

| Field | Value |
|---|---|
| Email | `admin@azriel.dev` |
| Password | `Admin1234!` |
| Username | `azriel` |
| Role | `admin` |

> ⚠️ Ganti password setelah pertama kali login jika deploy ke production.

**Cara 2 — Manual**
1. Buka `/register`, daftar dengan username kamu
2. Jalankan di Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE username = 'azriel';
```

---

## 3. Menjalankan Aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`

| URL | Halaman |
|---|---|
| `localhost:3000` | Portfolio (publik) |
| `localhost:3000/login` | Halaman login |
| `localhost:3000/register` | Halaman daftar |
| `localhost:3000/links` | Dashboard LinkJar |
| `localhost:3000/dashboard/portfolio` | Dashboard admin |

---

## 4. Alur Pengguna — Portfolio (Publik)

Halaman utama (`/`) bisa diakses siapa saja tanpa login.

### Sections
- **Beranda** — nama, tagline, tombol CV, tombol Hubungi Saya
- **Tentang** — foto dan bio singkat
- **Proyek** — grid proyek yang dimuat dari Supabase secara dinamis
- **Skills** — marquee logo teknologi (scroll kiri atas, scroll kanan bawah; pause on hover; grid di mobile)
- **Kontak** — tombol GitHub, Email, LinkedIn, Instagram

### Navigasi
- Desktop: link di navbar atas
- Mobile: hamburger menu (tap untuk buka/tutup)
- Semua link navigasi adalah anchor scroll (`#section`)

---

## 5. Alur Pengguna — LinkJar

### Daftar Akun
1. Buka `/register`
2. Isi username (min. 3 karakter), email, password (min. 6 karakter)
3. Klik **Daftar Sekarang**
4. Otomatis masuk dan diarahkan ke `/links`

### Login
1. Buka `/login`
2. Isi email dan password
3. Klik **Masuk**
4. Diarahkan ke `/links` (user) atau `/dashboard/portfolio` (admin)

### Dashboard LinkJar (`/links`)
Setelah login, kamu bisa:

**Menambah link**
1. Tap tombol **+** (pojok kanan bawah)
2. Isi URL (wajib) dan Caption (opsional)
3. Klik **Tambah**

**Mencari link**
- Ketik di kolom pencarian — filter realtime berdasarkan URL atau caption

**Mengedit link**
- Hover pada link card → muncul tombol ✏️
- Klik ✏️, ubah data, klik **Simpan**

**Menghapus link**
- Hover pada link card → muncul tombol 🗑️
- Klik 🗑️ → konfirmasi di modal → klik **Hapus**

**Keluar**
- Klik tombol **Keluar** di header

### Fitur Link Card
Setiap kartu link menampilkan:
- Favicon website otomatis
- Caption atau URL sebagai judul (klikable, buka tab baru)
- Domain pill (label nama domain)
- Waktu relatif ("2 jam yang lalu", "3 hari yang lalu", dll)

---

## 6. Dashboard Admin

Hanya bisa diakses oleh akun dengan `role = 'admin'`.  
URL: `/dashboard/portfolio`

Dashboard admin memiliki 3 tab: **Proyek**, **Kontak**, dan **Pengguna**.

### Tab Proyek

**Tambah proyek baru**
1. Klik tombol **+ Tambah Proyek**
2. Isi form:
   - **Gambar** — klik area upload, pilih file (otomatis dikompresi & diupload ke Supabase Storage)
   - **Judul** — nama proyek (wajib)
   - **Deskripsi** — deskripsi singkat
   - **Tags** — pisahkan dengan koma, contoh: `Laravel, React, Tailwind`
   - **Link Proyek** — URL GitHub atau live demo (opsional)
   - **Urutan Tampil** — angka kecil = tampil lebih dahulu di portfolio
3. Klik **Tambah**

**Edit proyek**
1. Klik tombol **Edit** di samping proyek
2. Ubah data yang diinginkan
3. Klik **Simpan**

**Hapus proyek**
1. Klik tombol **Hapus** di samping proyek
2. Konfirmasi di dialog → klik **Hapus**
3. Gambar di Storage ikut terhapus otomatis

### Tab Kontak

Menampilkan dan mengelola info kontak yang tampil di halaman portfolio publik.

**Edit kontak**
1. Klik tombol **Edit Kontak**
2. Ubah URL GitHub, Email, LinkedIn, atau Instagram
3. Klik **Simpan** — perubahan langsung tampil di halaman portfolio

### Tab Pengguna

Menampilkan semua akun user LinkJar yang terdaftar.

| Kolom | Keterangan |
|---|---|
| Username | Username yang dipilih saat daftar |
| Role | Selalu `user` untuk pengguna biasa |
| Terdaftar | Tanggal akun dibuat |

**Hapus akun pengguna**
1. Klik tombol **Hapus Akun** di baris pengguna
2. Konfirmasi di dialog → klik **Hapus**
3. Akun, profil, dan semua link milik pengguna tersebut dihapus permanen

> ⚠️ Admin tidak bisa menghapus akunnya sendiri dari sini.

### Lihat Portfolio
Klik tombol **Lihat Portfolio ↗** di header untuk preview halaman publik di tab baru.

---

## 7. Deploy ke Vercel

### Cara deploy
```bash
# Install Vercel CLI (jika belum)
npm i -g vercel

# Deploy dari folder portfolio-app
cd portfolio-app
vercel
```

Ikuti prompt, pilih project baru atau link ke project yang ada.

### Set Environment Variables di Vercel
Vercel Dashboard → Project → **Settings** → **Environment Variables**

Tambahkan:
| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` |

Setelah itu klik **Redeploy**.

### Custom Domain (opsional)
Vercel Dashboard → Project → **Domains** → tambahkan domain kamu.

---

## 8. Struktur Folder

```
portfolio-app/
├── app/
│   ├── globals.css              # Semua style global (portfolio + linkjar)
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Halaman portfolio publik
│   ├── login/page.tsx           # Halaman login
│   ├── register/page.tsx        # Halaman register
│   ├── links/
│   │   ├── page.tsx             # Server: fetch links user
│   │   └── LinksDashboard.tsx   # Client: UI dashboard LinkJar
│   └── dashboard/portfolio/
│       ├── page.tsx             # Guard admin
│       ├── PortfolioDashboard.tsx
│       ├── ProjectFormModal.tsx # Form tambah/edit proyek
│       └── ContactFormModal.tsx # Form edit kontak
│
├── components/
│   ├── portfolio/
│   │   ├── Nav.tsx              # Navbar + hamburger mobile
│   │   ├── Hero.tsx             # Section hero
│   │   ├── About.tsx            # Section tentang
│   │   ├── ProjectCard.tsx      # Card proyek
│   │   ├── SkillsMarquee.tsx    # Marquee logo skills
│   │   ├── Contact.tsx          # Section kontak
│   │   └── Footer.tsx           # Footer
│   └── linkjar/
│       ├── LinkCard.tsx         # Card link (favicon + actions)
│       ├── LinkModal.tsx        # Modal tambah/edit link
│       ├── DeleteModal.tsx      # Modal konfirmasi hapus
│       ├── SearchBar.tsx        # Input pencarian
│       └── Toast.tsx            # Notifikasi toast
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Supabase client (browser)
│   │   └── server.ts            # Supabase client (server/RSC)
│   └── auth.ts                  # Helper requireAdmin(), requireUser()
│
├── middleware.ts                 # Proteksi route /links dan /dashboard
├── supabase/migrations/
│   └── 001_init.sql             # SQL: buat tabel + RLS policies
├── public/images/               # Foto lokal (azriel.jpg, dll)
└── .env.local                   # Environment variables (jangan di-commit)
```

---

## 9. Troubleshooting

### URL Supabase double path (`/rest/v1/rest/v1/...`)
**Penyebab:** `NEXT_PUBLIC_SUPABASE_URL` mengandung `/rest/v1/` di belakangnya.  
**Solusi:** Hapus trailing path, biarkan hanya `https://xxxx.supabase.co`

### 404 saat request ke Supabase
**Kemungkinan:** Tabel belum dibuat atau RLS memblokir.  
**Solusi:** Pastikan sudah menjalankan `001_init.sql` di SQL Editor Supabase.

### Login/Register gagal
**Cek:**
1. Supabase URL dan anon key sudah benar di `.env.local`
2. Dev server sudah di-restart setelah ubah `.env.local`
3. Email Confirmation di Supabase — jika aktif, cek inbox dulu

**Matikan email confirmation (opsional, untuk development):**  
Supabase Dashboard → Authentication → Providers → Email → **Confirm email: OFF**

### Upload gambar gagal
**Pastikan:**
1. Bucket `portfolio-images` sudah dibuat dan status **Public**
2. Akun yang login memiliki `role = 'admin'`

### Halaman `/dashboard` redirect ke `/`
**Penyebab:** Role akun bukan `admin`.  
**Solusi:** Jalankan SQL berikut di Supabase:
```sql
UPDATE profiles SET role = 'admin' WHERE username = 'azriel';
```

### Error `scroll-behavior: smooth` di console
Ini hanya warning dari Next.js, tidak mempengaruhi fungsi aplikasi. Bisa diabaikan.

### Build error: `@import rules must precede all rules`
**Penyebab:** `@import` di CSS bukan di baris pertama.  
**Solusi:** Pastikan semua `@import` ada di bagian paling atas `globals.css`, sebelum rule CSS lain.
