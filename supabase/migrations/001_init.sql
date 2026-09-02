-- ============================================================
-- 1. PROFILES (extend auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz default now()
);

-- ============================================================
-- 2. PROJECTS (portfolio)
-- ============================================================
create table if not exists projects (
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

-- ============================================================
-- 3. LINKS (LinkJar)
-- ============================================================
create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  link text not null,
  caption text,
  created_at timestamptz default now()
);

-- ============================================================
-- 4. CONTACT_INFO (editable dari dashboard)
-- ============================================================
create table if not exists contact_info (
  id uuid primary key default gen_random_uuid(),
  github text default 'https://github.com/azhkiel',
  email text default 'azrielskm5@gmail.com',
  linkedin text default 'https://www.linkedin.com/in/moch-azriel-maulana-racmadhani-32435528b',
  instagram text default 'https://www.instagram.com/azhkiel/',
  updated_at timestamptz default now()
);

-- Insert default row
insert into contact_info (github, email, linkedin, instagram)
values (
  'https://github.com/azhkiel',
  'azrielskm5@gmail.com',
  'https://www.linkedin.com/in/moch-azriel-maulana-racmadhani-32435528b',
  'https://www.instagram.com/azhkiel/'
) on conflict do nothing;

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================

-- Aktifkan RLS
alter table profiles     enable row level security;
alter table projects     enable row level security;
alter table links        enable row level security;
alter table contact_info enable row level security;

-- Helper function bypass RLS untuk cek admin (mencegah infinite recursion)
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = user_id and role = 'admin'
  );
$$;

-- PROFILES
create policy "profiles: baca milik sendiri" on profiles
  for select using (auth.uid() = id);

create policy "profiles: admin baca semua" on profiles
  for select using (
    is_admin(auth.uid())
  );

create policy "profiles: insert saat register" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles: update milik sendiri" on profiles
  for update using (auth.uid() = id);

-- PROJECTS — select publik (anon + authenticated)
create policy "projects: publik bisa baca" on projects
  for select using (true);

create policy "projects: admin bisa insert" on projects
  for insert with check (
    is_admin(auth.uid())
  );

create policy "projects: admin bisa update" on projects
  for update using (
    is_admin(auth.uid())
  );

create policy "projects: admin bisa delete" on projects
  for delete using (
    is_admin(auth.uid())
  );

-- LINKS — isolasi per user
create policy "links: baca milik sendiri" on links
  for select using (auth.uid() = user_id);

create policy "links: insert milik sendiri" on links
  for insert with check (auth.uid() = user_id);

create policy "links: update milik sendiri" on links
  for update using (auth.uid() = user_id);

create policy "links: delete milik sendiri" on links
  for delete using (auth.uid() = user_id);

-- CONTACT_INFO — publik bisa baca, hanya admin yang bisa ubah
create policy "contact_info: publik bisa baca" on contact_info
  for select using (true);

create policy "contact_info: admin insert" on contact_info
  for insert with check (
    is_admin(auth.uid())
  );

create policy "contact_info: admin update" on contact_info
  for update using (
    is_admin(auth.uid())
  );

-- ============================================================
-- 6. STORAGE BUCKET (jalankan manual di Supabase dashboard
--    atau via API — SQL tidak bisa create bucket)
-- ============================================================
-- Buat bucket 'portfolio-images' dengan public = true di:
-- Storage > New bucket > Name: portfolio-images > Public: ON

-- ============================================================
-- 7. SET ADMIN (jalankan setelah akun Azriel dibuat)
-- ============================================================
-- UPDATE profiles SET role = 'admin' WHERE username = 'azriel';
