# Portfolio + LinkJar — Next.js + Supabase

## Setup

### 1. Isi `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 2. Jalankan SQL di Supabase SQL Editor
Salin isi `supabase/migrations/001_init.sql` dan run di Supabase > SQL Editor.

### 3. Buat Storage Bucket
Supabase Dashboard > Storage > New bucket:
- Name: `portfolio-images`
- Public: **ON**

### 4. Daftar akun admin
- Buka `/register`, buat akun dengan username kamu
- Lalu di Supabase SQL Editor:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE username = 'azriel';
  ```

### 5. Deploy ke Vercel
```bash
npx vercel
```
Set env vars di Vercel dashboard sesuai `.env.local`.

## Routes
| Route | Akses |
|---|---|
| `/` | Portfolio publik |
| `/login` | Login (redirect by role) |
| `/register` | Signup user LinkJar |
| `/links` | Dashboard LinkJar (login required) |
| `/dashboard/portfolio` | CRUD proyek (admin only) |
# portfolio
