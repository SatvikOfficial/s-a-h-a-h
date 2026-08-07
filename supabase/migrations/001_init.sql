-- S.A.H.A.S. Database Schema
-- Run this in your Supabase SQL editor at:
-- https://zsmxukduotxauwahvhpa.supabase.co

-- ============================================================
-- Table: members
-- Stores registered members (linked to Supabase Auth users)
-- ============================================================
create table if not exists public.members (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  first_name  text not null,
  last_name   text not null,
  email       text not null unique,
  state       text not null default '',
  district    text not null default '',
  city        text not null default '',
  member_code text unique,
  role        text not null default 'member', -- 'member' or 'admin'
  created_at  timestamptz not null default now()
);

-- Auto-generate member code on insert
create or replace function generate_member_code()
returns trigger as $$
begin
  new.member_code := 'SAHAS' || upper(substring(md5(new.id::text) from 1 for 6));
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_member_code on public.members;
create trigger set_member_code
  before insert on public.members
  for each row execute function generate_member_code();

-- ============================================================
-- Table: join_requests
-- Stores homepage join-interest submissions (no auth required)
-- ============================================================
create table if not exists public.join_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  mobile     text not null,
  email      text,
  city       text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Table: reports
-- Stores incident reports submitted by members
-- ============================================================
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid references public.members(id) on delete cascade,
  reporter_name text not null,
  incident_type text not null,
  location      text not null,
  latitude      float8,
  longitude     float8,
  date          date not null,
  time          time not null,
  description   text not null,
  photos        text[] default '{}',
  status        text not null default 'new',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at on reports
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_reports_modtime on public.reports;
create trigger update_reports_modtime
  before update on public.reports
  for each row execute function update_modified_column();

-- ============================================================
-- Row Level Security (RLS) Setup
-- ============================================================

alter table public.members enable row level security;
alter table public.join_requests enable row level security;
alter table public.reports enable row level security;

-- Helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.members
    where user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- ------------------------------------------------------------
-- Policies for members
-- ------------------------------------------------------------
-- 1. Users can insert their own profile
create policy "Users can insert their own profile"
  on public.members for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 2. Users can read their own profile
create policy "Users can read own profile"
  on public.members for select
  to authenticated
  using (auth.uid() = user_id);

-- 3. Admins can read all profiles
create policy "Admins can read all profiles"
  on public.members for select
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- Policies for join_requests
-- ------------------------------------------------------------
-- Anyone can insert a join request (anonymous)
create policy "Anyone can insert join requests"
  on public.join_requests for insert
  to anon, authenticated
  with check (true);

-- Admins can read join requests
create policy "Admins can read join requests"
  on public.join_requests for select
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- Policies for reports
-- ------------------------------------------------------------
-- 1. Members can insert reports (linked to their profile)
create policy "Members can insert own reports"
  on public.reports for insert
  to authenticated
  with check (
    member_id in (select id from public.members where user_id = auth.uid())
  );

-- 2. Members can read their own reports
create policy "Members can read own reports"
  on public.reports for select
  to authenticated
  using (
    member_id in (select id from public.members where user_id = auth.uid())
  );

-- 3. Admins can read all reports
create policy "Admins can read all reports"
  on public.reports for select
  to authenticated
  using (public.is_admin());

-- 4. Admins can update reports (status changes)
create policy "Admins can update reports"
  on public.reports for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- Supabase Storage Setup
-- ============================================================

-- Create a storage bucket for report photos
insert into storage.buckets (id, name, public) 
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

-- Set up Storage RLS
-- 1. Anyone can view report photos
create policy "Anyone can view report photos"
  on storage.objects for select
  to anon, authenticated
  using ( bucket_id = 'report-photos' );

-- 2. Authenticated users can upload photos
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'report-photos' );

-- ============================================================
-- Realtime Setup
-- ============================================================
-- Enable realtime for the reports table
alter publication supabase_realtime add table reports;
