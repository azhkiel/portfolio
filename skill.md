# SKILL.md — Portfolio + LinkJar Migration (Next.js + Supabase)

## 1. Project Overview

Migrasi dua aplikasi statis yang sudah ada menjadi **satu aplikasi Next.js terpadu**:

- **Portfolio** (`portfolio.html`) — situs personal Azriel, saat ini pure HTML + Tailwind CDN + Alpine.js.
- **LinkJar** (`linkjar.html`) — tool penyimpan link, saat ini Alpine.js + Google Apps Script/Google Sheets sebagai backend.

Target akhir: satu Next.js app, Supabase sebagai auth + database + storage, deploy ke **Vercel**.

Agent yang mengerjakan proyek ini WAJIB membaca seluruh dokumen ini sebelum menulis kode apa pun.

---

## 2. Tech Stack

- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS
- Supabase: Postgres + Auth + Storage, via `@supabase/supabase-js` dan `@supabase/ssr`
- Deployment: **Vercel** (bukan shared hosting — jadi tidak ada batasan cPanel/queue `sync` seperti proyek Kedungpari)

---

## 3. Roles & Auth Model

- **Supabase Auth** (email/password) dipakai untuk SEMUA user — baik admin maupun user LinkJar.
- Tabel `profiles` sebagai extension dari `auth.users`, dengan kolom `role enum('admin','user')`, default `'user'`.
- **Hanya ada 1 admin** (Azriel sendiri). Tidak perlu flow invite admin — role admin di-set manual lewat Supabase dashboard/SQL setelah akun pertama dibuat.
- **Portfolio CRUD** → admin-only, route `/dashboard/portfolio`.
- **LinkJar** → semua user yang login boleh pakai, tapi tiap user cuma bisa lihat/kelola link miliknya sendiri (isolasi via RLS berdasarkan `user_id`) — ini menggantikan konsep "username" lama yang dikelola manual lewat Google Sheets, sekarang jadi self-service register.
- **Pengunjung publik** → bisa lihat halaman portfolio (`/`) tanpa login; LinkJar sama sekali tidak terlihat tanpa login.

---

## 4. Routes / Information Architecture

| Route | Akses | Keterangan |
|---|---|---|
| `/` | Publik | **Entry gate**: game Snake ("Play to enter") → skor 3 atau tombol Skip → fade transition → tampilkan Portfolio (Home, About, Projects[dinamis], Skills, Contact) di halaman yang sama. Detail lengkap lihat §13. |
| `/login` | Publik | Login bersama — setelah login redirect sesuai role (admin → `/dashboard/portfolio`, user → `/links`) |
| `/register` | Publik | Signup khusus untuk user LinkJar (akun admin tidak self-registerable) |
| `/dashboard/portfolio` | Admin only | CRUD proyek portfolio (create/edit/delete + upload gambar) |
| `/links` | Authenticated | Dashboard LinkJar (CRUD link milik sendiri) |

---

## 5. Database Schema (Supabase/Postgres)

```sql
-- profiles: extend auth.users
create table profiles (
  id uuid references auth.users(id) primary key,
  username text unique not null,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz default now()
);

-- projects (portfolio)
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  tags text[] default '{}',
  link text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- links (LinkJar)
create table links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  link text not null,
  caption text,
  created_at timestamptz default now()
);

-- notes (LinkJar — mode "Keep")
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text,
  content text,
  color text not null default 'default' check (color in ('default','muted','dark')),
  pinned boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**RLS Policies (wajib diaktifkan):**
- `profiles`: user hanya boleh baca row miliknya sendiri; admin boleh baca semua.
- `projects`: SELECT publik (anon + authenticated); INSERT/UPDATE/DELETE hanya untuk `role = 'admin'`.
- `links`: SELECT/INSERT/UPDATE/DELETE hanya untuk row dengan `user_id = auth.uid()`.
- `notes`: SELECT/INSERT/UPDATE/DELETE hanya untuk row dengan `user_id = auth.uid()` (pola sama persis dengan `links`).

---

## 6. Storage

- Bucket `portfolio-images` (public read) menggantikan file statis di `img/*.png`.
- Alur upload: admin pilih file di dashboard → upload ke Supabase Storage → simpan public URL ke `projects.image_url`.
- Kompres/resize gambar di client sebelum upload agar ukuran wajar. Crop UI tidak perlu kecuali diminta belakangan.

---

## 7. Design System / Anti-Slop Rules

### ⚠️ Wajib Dicek Sebelum Nulis Styling Apa Pun
Cek dulu apakah ada folder **`Anti-AI-UI`** di root repo project. Kalau ada, itu berisi referensi/anti-pattern buat menghindari tampilan "khas AI-generated" (gradient ungu-pink generic, shadow berlebihan, semua serba `rounded-full`, dst) — ikuti panduan di dalamnya sebagai prioritas di atas aturan default di bawah. Kalau folder tidak ada, pakai baseline di bawah ini.

### Update Penting: Satu Bahasa Visual Monokrom untuk Seluruh App
**Perubahan dari versi sebelumnya** — LinkJar (termasuk Notes) TIDAK LAGI punya palet sky-blue/Duolingo sendiri. Sekarang disamakan dengan bahasa visual Portfolio. Jadi Portfolio, LinkJar, Notes, Login, dan Register semuanya berbagi satu design language:

- **Palet**: hitam/putih/grayscale saja. Gradient text halus (`#000000` → `#4a4a4a`) dipakai di judul besar seperti di Portfolio.
- **Font**: Inter di semua tempat — LinkJar berhenti pakai Nunito.
- **Tombol primary**: `bg-black text-white hover:bg-gray-800` (persis tombol "Lihat CV" di Portfolio).
- **Tombol outline/secondary**: `border-2 border-black text-black hover:bg-black hover:text-white` (persis tombol "Hubungi Saya").
- **Card**: putih, `border border-gray-200`, shadow tipis (`shadow-sm`/`shadow-md`) — bukan shadow tebal warna-warni ala LinkJar lama.
- **Radius**: sedang (`rounded-lg`/`rounded-xl`). JANGAN `rounded-3xl`/`rounded-4xl` super membulat ala LinkJar lama.
- **Motion**: minimal — fade/slide seperti di Portfolio. HAPUS animasi "chunky 3D button" (box-shadow offset + translateY tebal ala Duolingo) dan modal bounce-in yang playful.
- **Toast notification**: monokrom (putih/hitam/border tipis), bukan lagi solid hijau/merah/biru.
- **Satu-satunya pengecualian warna**: aksi destruktif (tombol/ikon delete) boleh pakai aksen merah tipis di teks/ikon (bukan background solid besar) supaya tetap jelas — di luar itu tetap monokrom.
- **Tone copy**: tetap Bahasa Indonesia, boleh tetap ramah, tapi visualnya sudah tidak "playful/Duolingo" lagi — lebih clean & profesional seperti Portfolio.

### Entry Gate (`/` sebelum menang game, lihat §13)
Tetap bagian dari bahasa visual monokrom yang sama — bukan identitas keempat yang beda. Tambahan khasnya cuma: logo Next.js + font Geist/Inter, card center-screen border tipis, sebagai "momen" pembuka sebelum reveal Portfolio.

### JANGAN
- Glassmorphism
- Gradient ungu/indigo/pink generic
- `hover:scale-105` generic tanpa alasan
- Warna solid penuh sebagai background besar (sky-500, green-500, dll) — itu bahasa visual lama yang sudah di-retire
- Marquee logo skill (scroll kiri/kanan, pause on hover, fallback grid mobile) tetap dipertahankan dari Portfolio asli — ini bukan bagian yang diganti

---

## 8. Feature Parity Checklist

**Entry Gate (baru, lihat §13):**
- [ ] Snake game Canvas + kontrol WASD/Arrow
- [ ] High score tersimpan di `localStorage`
- [ ] Skor 3 → fade transition 500ms → reveal Portfolio
- [ ] Tombol "Skip" langsung reveal Portfolio tanpa main

**Dari `portfolio.html`:**
- [ ] Nav (desktop + hamburger mobile, Alpine state → React state)
- [ ] Hero + tombol CV + CTA kontak
- [ ] About (foto + bio)
- [ ] Projects grid — **sekarang dinamis dari Supabase**, bukan array hardcoded; layout card & hover tetap; tombol "Lihat Detail" buka `link` kalau ada
- [ ] Skills marquee (dual-direction scroll + mobile grid fallback)
- [ ] Contact (GitHub/Email/LinkedIn/Instagram — URL asli dipertahankan)
- [ ] Footer

**Dari `linkjar.html`:**
- [ ] Login — ganti backend Google Sheets dengan Supabase Auth
- [ ] Tambah flow **Register** (dulu akun dikelola admin manual, sekarang self-service signup)
- [ ] Dashboard: badge jumlah link, search/filter, empty state, loading state
- [ ] Link card: favicon (tetap pakai `google.com/s2/favicons`), domain pill, relative time, tombol edit/delete
- [ ] Modal Add/Edit dengan validasi URL + caption
- [ ] Modal konfirmasi delete
- [ ] Toast notification
- [ ] Floating "+" button di mobile

**LinkJar — Notes (baru, lihat §14):**
- [ ] Tab switcher "Links" / "Notes" di dashboard
- [ ] Quick-add note (klik area kosong → expand jadi form)
- [ ] Notes grid masonry + section "Pinned" terpisah
- [ ] Pin / unpin note
- [ ] Archive / unarchive note
- [ ] Delete note (modal konfirmasi shared dengan link)
- [ ] Color picker (varian monokrom: default/putih, abu-abu muda, inverted/gelap — lihat §14)
- [ ] Search notes (title + content)
- [ ] Empty state khusus notes

---

## 9. Environment Variables (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only, kalau perlu aksi admin bypass RLS
```

---

## 10. Folder Structure (App Router)

```
app/
  page.tsx                    # Entry gate (Snake) → reveal Portfolio, lihat §13
  (auth)/
    login/page.tsx
    register/page.tsx
  dashboard/
    portfolio/
      page.tsx                 # list + CRUD admin
      new/page.tsx
      [id]/edit/page.tsx
  links/
    page.tsx                   # LinkJar dashboard
  layout.tsx
components/
  SnakeGame.tsx                # entry gate game, dipakai di app/page.tsx
  portfolio/
    PortfolioPage.tsx          # bungkus semua section, di-mount setelah gate lolos/skip
    Nav.tsx  Hero.tsx  About.tsx  ProjectCard.tsx  SkillsMarquee.tsx  Contact.tsx  Footer.tsx
  linkjar/
    LinkCard.tsx  LinkModal.tsx  DeleteModal.tsx  Toast.tsx  SearchBar.tsx
    TabSwitcher.tsx              # toggle Links / Notes
    NoteCard.tsx  NoteModal.tsx  NotesGrid.tsx
  ui/                           # primitives bersama
lib/
  supabase/client.ts  server.ts  middleware.ts
  auth.ts                       # helper requireAdmin(), requireUser()
middleware.ts                   # proteksi /dashboard/* dan /links
```

---

## 11. Middleware / Route Protection

- Gunakan pola middleware `@supabase/ssr`.
- `/dashboard/**` → redirect ke `/login` jika belum login ATAU `role !== 'admin'`.
- `/links` → redirect ke `/login` jika belum login.
- `/login`, `/register` → kalau sudah login, redirect ke halaman sesuai role.

---

## 12. Non-Goals / Constraints

- Tidak ada lagi Google Apps Script/Sheets — full cutover ke Supabase.
- Seluruh app (Portfolio, LinkJar, Notes, Login/Register) pakai satu bahasa visual monokrom (lihat §7) — palet sky-blue/Duolingo versi lama LinkJar sudah di-retire, jangan dipakai lagi.
- Target deploy Vercel — tidak ada batasan cPanel/shared hosting seperti proyek Kedungpari.
- Hanya 1 admin — tidak perlu flow invite admin.

---

## 13. Entry Gate — Snake Game (Home Page)

`/` bukan langsung menampilkan Portfolio. Halaman ini adalah **satu route, dua state**: gate game dulu, baru portfolio ter-reveal — bukan redirect ke route lain.

### Konsep
Pengunjung harus main Snake dulu sebelum masuk ke portfolio (atau klik Skip). Ini elemen personality/easter-egg di landing, terpisah total dari identitas visual Portfolio maupun LinkJar.

### Tech
- React + Tailwind CSS
- Game Snake pakai **HTML `<canvas>` murni, tanpa library game** (render loop manual pakai `requestAnimationFrame`)
- Framer Motion **hanya** untuk fade transition antar state (gate → portfolio) — jangan dipakai untuk hover/micro-interaction lain di gate ini
- Font: Geist atau Inter

### Desain Visual (identitas ketiga, terpisah dari §7)
- Monokrom, minimalis ala Next.js — banyak whitespace, tanpa warna aksen
- Layout: card sederhana dengan border tipis, center di tengah layar (vertikal & horizontal)
- Header di dalam card: logo Next.js + tulisan "Azriel" saja, tanpa nav item lain
- Copy:
  - Teks utama: **"Play to enter."**
  - Subtitle: **"Reach score 3 to unlock the portfolio."**
- Tombol **"Skip"** bergaya outline (border tipis, tanpa fill), langsung reveal Portfolio tanpa main

### Kontrol Game
- WASD dan Arrow Keys, keduanya aktif bersamaan (bukan pilih salah satu)
- Snake, food, collision detection, score counter — mekanik Snake klasik standar

### Alur State
1. Mount `/` → tampilkan card gate (game + "Play to enter.")
2. Skor mencapai **3** ATAU user klik **Skip** →
3. Fade transition **500ms** (Framer Motion, `opacity` in/out) →
4. Reveal `PortfolioPage.tsx` (isi Portfolio dari §8) di route yang sama

### Persistensi
- Simpan **high score** ke `localStorage` (mis. key `snake_highscore`), tampilkan di UI gate kalau ada skor sebelumnya
- Status "sudah pernah lolos gate" TIDAK perlu disimpan — setiap kunjungan ke `/` selalu mulai dari gate lagi (kecuali diminta lain oleh El)

### Pemisahan Kode (wajib)
- `components/SnakeGame.tsx` — murni logic + rendering canvas game (state skor, loop, kontrol keyboard, high score localStorage), terima prop `onWin` (dipanggil saat skor capai 3) dan/atau expose skor ke parent
- `app/page.tsx` — orkestrasi state gate vs portfolio (`showPortfolio` boolean), render `SnakeGame` + tombol Skip saat gate, render `PortfolioPage` + fade transition saat lolos

### Non-Goals untuk Entry Gate
- Bukan gate keamanan — hanya UX/personality touch, tidak boleh menghalangi search engine crawler mengindeks Portfolio (pertimbangkan SSR portfolio tetap ada di HTML awal untuk SEO, gate murni klien-side overlay — catat ini sebagai keputusan teknis yang perlu dicek saat implementasi)

---

## 14. LinkJar — Notes Feature ("Keep" Mode)

### Konsep
LinkJar diperluas jadi tempat simpan **link ATAU catatan bebas** (title + body), terinspirasi Google Keep — tapi mengikuti bahasa visual monokrom yang sama dengan Portfolio (lihat §7), **bukan** warna-warni ala Keep asli. Diakses di route yang sama (`/links`), ditambah **tab switcher "Links" / "Notes"** di bagian atas dashboard, di bawah header dan di atas search bar.

### Schema
Lihat tabel `notes` di §5. RLS mengikuti pola persis tabel `links`.

### UI / Layout
- **Tab switcher**: pill toggle "Links" | "Notes", active state `bg-black text-white`, inactive `text-gray-500 hover:text-black` — konsisten dengan tombol monokrom lain.
- **View "Notes"**:
  - Quick-add di atas grid: area placeholder "Tulis catatan..." (`border border-gray-200 rounded-lg`) → klik → expand jadi form (title, textarea, color picker, toggle pin, tombol simpan `bg-black text-white`).
  - Grid **masonry** (CSS `columns` atau grid `break-inside-avoid`), tiap card background sesuai `color` (lihat tabel warna di bawah — semua tetap dalam palet grayscale).
  - Section **"Pinned"** tampil terpisah di atas grid utama kalau ada note yang di-pin.
  - Tiap card: title (bold, opsional), content (multi-baris, truncate kalau panjang), icon pin (toggle, `text-gray-400` → `text-black` saat aktif), icon archive, icon delete (`text-red-400 hover:text-red-600` — satu-satunya aksen warna, lihat aturan destruktif di §7; buka `DeleteModal` yang digeneralisasi dengan prop `itemType: 'link' | 'note'`).
  - Klik card (di luar tombol aksi) → buka `NoteModal` untuk edit (title, content, color, pin).
  - Toggle "Tampilkan arsip" untuk lihat note yang di-archive (default disembunyikan dari grid utama).
- **Search**: search bar yang sama dipakai untuk filter, logic menyesuaikan tab aktif — di tab Notes match ke `title` + `content`; di tab Links tetap match `caption` + `link`.

### Warna (monokrom, konsisten dengan §7 — bukan color wheel)
| Value | Tampilan |
|---|---|
| `default` | putih, `border border-gray-200` (sama seperti card biasa) |
| `muted` | `bg-gray-50` — sedikit beda tone buat variasi visual tanpa keluar dari grayscale |
| `dark` | inverted: `bg-black text-white` — dipakai buat note yang mau "ditonjolkan" tanpa pakai warna |

### Interaksi (konsisten dengan §7)
- Toast tetap dipakai, tapi versi monokrom: "Catatan disimpan!", "Catatan dihapus!", "Catatan diarsipkan!" — background putih/border tipis, bukan solid warna.
- Tombol simpan pakai `bg-black text-white hover:bg-gray-800` (sama seperti tombol primary di seluruh app).
- Empty state khusus kalau belum ada note sama sekali: ilustrasi sederhana (grayscale) + copy ("Belum ada catatan, yuk tulis yang pertama.").

### Komponen Baru
```
components/linkjar/
  TabSwitcher.tsx    # toggle Links / Notes
  NoteCard.tsx
  NoteModal.tsx      # dipakai untuk create & edit (quick-add expand ke bentuk ini)
  NotesGrid.tsx       # masonry layout + grouping Pinned/Others
```
`DeleteModal.tsx` yang sudah ada digeneralisasi (terima `itemType`) alih-alih dibuat modal baru.

### Non-Goals (v1) — Sengaja Tidak Dibuat Dulu
- Tidak ada trash bin / undo-delete — delete langsung permanen, modal konfirmasi jadi satu-satunya safety net. Bisa ditambah nanti kalau dibutuhkan.
- Tidak ada checklist item di dalam note (Keep asli punya to-do list per note) — v1 cuma title + free text.
- Tidak ada label/tag system — v1 cuma color + pin + archive.
- Tidak ada share/collaborative note ke user lain — tetap privat per user via RLS.
- Tidak ada reminder/notification.

---

## 15. Open Items — Konfirmasi ke El Saat Build

- Copy/branding: data personal (nama, CV link, sosmed) dipertahankan apa adanya dari HTML lama, kecuali diminta ganti.
- LinkJar: tampilkan `profiles.username` atau email di UI?
- Kontak (GitHub/LinkedIn/IG/Email) tetap hardcode di kode, atau mau jadi editable dari dashboard admin? (default: hardcode seperti sebelumnya)
- Notes: perlu fitur trash/undo-delete di v1, atau delete langsung permanen dulu cukup? (default: langsung permanen, lihat §14 Non-Goals)
- Folder `Anti-AI-UI`: pastikan folder ini benar-benar ada di root repo sebelum agent mulai styling (lihat §7) — kalau ternyata belum dibuat/di-push, beri tahu agent supaya pakai baseline default di §7 saja.