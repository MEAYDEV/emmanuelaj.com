-- The Loft — Supabase setup
-- Run this once in your Supabase project's SQL editor.
-- Creates the books + photos tables, RLS policies (public read /
-- authenticated write), and the public "photos" storage bucket.

create extension if not exists pgcrypto;

-- ---------- books ----------
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  status text default 'read' check (status in ('read', 'reading')),
  notes text,
  buy_url text,
  color text default '#5f7d5a',
  cover_url text,
  sort integer default 0,
  created_at timestamptz default now()
);

alter table public.books enable row level security;

drop policy if exists "books public read" on public.books;
create policy "books public read"
  on public.books for select
  to anon, authenticated
  using (true);

drop policy if exists "books admin write" on public.books;
create policy "books admin write"
  on public.books for all
  to authenticated
  using (true)
  with check (true);

-- ---------- photos ----------
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption text,
  sort integer default 0,
  created_at timestamptz default now()
);

alter table public.photos enable row level security;

drop policy if exists "photos public read" on public.photos;
create policy "photos public read"
  on public.photos for select
  to anon, authenticated
  using (true);

drop policy if exists "photos admin write" on public.photos;
create policy "photos admin write"
  on public.photos for all
  to authenticated
  using (true)
  with check (true);

-- ---------- storage bucket ----------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photo files public read" on storage.objects;
create policy "photo files public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'photos');

drop policy if exists "photo files admin insert" on storage.objects;
create policy "photo files admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

drop policy if exists "photo files admin update" on storage.objects;
create policy "photo files admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos');

drop policy if exists "photo files admin delete" on storage.objects;
create policy "photo files admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos');

-- Finally: create your admin user in
-- Supabase Dashboard -> Authentication -> Users -> "Add user"
-- (email + password), then sign in at /admin.
