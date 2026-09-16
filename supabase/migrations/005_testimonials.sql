-- Testimonials untuk /assistance
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service text,
  rating smallint check (rating between 1 and 5),
  message text not null,
  screenshot_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table testimonials enable row level security;

-- Publik (anon) hanya bisa baca yang published
create policy "testimonials: publik baca published" on testimonials
  for select using (is_published = true);

-- Admin bisa semua (select/insert/update/delete) via is_admin helper
create policy "testimonials: admin select" on testimonials
  for select using (is_admin(auth.uid()));

create policy "testimonials: admin insert" on testimonials
  for insert with check (is_admin(auth.uid()));

create policy "testimonials: admin update" on testimonials
  for update using (is_admin(auth.uid()));

create policy "testimonials: admin delete" on testimonials
  for delete using (is_admin(auth.uid()));
