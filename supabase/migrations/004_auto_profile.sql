-- ============================================================
-- 4. AUTO-CREATE PROFILE saat user baru mendaftar di Auth
-- ============================================================
-- Masalah yang diselesaikan: insert `profiles` dari client saat register
-- gagal diam-diam ketika "Confirm email" aktif (belum ada session sehingga
-- RLS `auth.uid() = id` tidak lolos). Akibatnya user ada di
-- Authentication tapi tidak ada di tabel `profiles`, sehingga dashboard
-- admin menampilkan daftar kosong.
--
-- Trigger ini berjalan sebagai SECURITY DEFINER (bypass RLS) sehingga
-- baris profile selalu tercipta apa pun status konfirmasi email.
--
-- CARA PAKAI (wajib manual untuk database Supabase yang sudah berjalan):
--   1. Buka Supabase Dashboard > SQL Editor
--   2. Paste seluruh isi file ini > Run
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_username text;
begin
  desired_username := lower(coalesce(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1),
    'user'
  ));

  -- Hindari tabrakan username unik (tambah suffix angka bila perlu)
  if exists (select 1 from public.profiles where username = desired_username) then
    desired_username := desired_username || '_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (id, username, role)
  values (new.id, desired_username, 'user')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
