-- S.A.H.A.S. feature additions
-- Adds tables for YouTube links, blogs, and members phone field,
-- plus RLS policies so the public can read published content and
-- admins can manage everything.

-- ============================================================
-- Add phone number to members (admin dashboard shows it)
-- ============================================================
alter table public.members add column if not exists phone text;

-- ============================================================
-- Table: youtube_links
-- Store YouTube videos featured on the homepage.
-- ============================================================
create table if not exists public.youtube_links (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  video_id    text not null,          -- the 11-char YouTube video id
  description text default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists update_youtube_links_modtime on public.youtube_links;
create trigger update_youtube_links_modtime
  before update on public.youtube_links
  for each row execute function update_modified_column();

-- ============================================================
-- Table: blogs
-- Blog posts stored with Hindi and English versions so admins
-- can maintain translations.
-- ============================================================
create table if not exists public.blogs (
  id          uuid primary key default gen_random_uuid(),
  title_hi    text not null,
  title_en    text not null default '',
  content_hi  text not null,
  content_en  text not null default '',
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists update_blogs_modtime on public.blogs;
create trigger update_blogs_modtime
  before update on public.blogs
  for each row execute function update_modified_column();

-- ============================================================
-- RLS
-- ============================================================
alter table public.youtube_links enable row level security;
alter table public.blogs enable row level security;

-- YouTube links: anyone can read; only admins manage
drop policy if exists "Anyone can read youtube links" on public.youtube_links;
create policy "Anyone can read youtube links"
  on public.youtube_links for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert youtube links" on public.youtube_links;
create policy "Admins can insert youtube links"
  on public.youtube_links for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update youtube links" on public.youtube_links;
create policy "Admins can update youtube links"
  on public.youtube_links for update
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete youtube links" on public.youtube_links;
create policy "Admins can delete youtube links"
  on public.youtube_links for delete
  to authenticated
  using (public.is_admin());

-- Blogs: anyone can read published; admins manage all
drop policy if exists "Anyone can read published blogs" on public.blogs;
create policy "Anyone can read published blogs"
  on public.blogs for select
  to anon, authenticated
  using (published = true OR public.is_admin());

drop policy if exists "Admins can insert blogs" on public.blogs;
create policy "Admins can insert blogs"
  on public.blogs for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update blogs" on public.blogs;
create policy "Admins can update blogs"
  on public.blogs for update
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete blogs" on public.blogs;
create policy "Admins can delete blogs"
  on public.blogs for delete
  to authenticated
  using (public.is_admin());
