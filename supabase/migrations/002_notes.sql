-- ============================================================
-- 002 — Notes table (LinkJar "Keep" mode)
-- ============================================================

-- Buat tabel notes
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  content text,
  color text not null default 'default' check (color in ('default','muted','dark')),
  pinned boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Aktifkan RLS
alter table notes enable row level security;

-- RLS policies — pola sama persis dengan tabel links
create policy "notes: baca milik sendiri" on notes
  for select using (auth.uid() = user_id);

create policy "notes: insert milik sendiri" on notes
  for insert with check (auth.uid() = user_id);

create policy "notes: update milik sendiri" on notes
  for update using (auth.uid() = user_id);

create policy "notes: delete milik sendiri" on notes
  for delete using (auth.uid() = user_id);
