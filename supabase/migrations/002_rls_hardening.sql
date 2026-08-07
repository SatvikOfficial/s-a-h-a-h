-- S.A.H.A.S. RLS hardening
-- Drops any legacy permissive policies (e.g. `using (true)` on members/reports)
-- and (re)creates locked-down, role-based policies.
-- Safe to run against a fresh DB and against an existing one that still has the
-- old permissive policies from a previous schema.

-- ============================================================
-- 1. Ensure the role column exists (idempotent)
-- ============================================================
alter table public.members add column if not exists role text not null default 'member';

-- ============================================================
-- 2. Enable RLS (idempotent)
-- ============================================================
alter table public.members enable row level security;
alter table public.join_requests enable row level security;
alter table public.reports enable row level security;

-- ============================================================
-- 3. Recreate the admin helper (security definer, so it can
--    read the members table without recursing into RLS)
-- ============================================================
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.members
    where user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- ============================================================
-- 4. Drop legacy permissive policies (old schema names)
-- ============================================================
drop policy if exists "Authenticated can view all members" on public.members;
drop policy if exists "Users can insert their own member row" on public.members;
drop policy if exists "Users can read their own member row" on public.members;

drop policy if exists "Authenticated users can view join requests" on public.join_requests;
drop policy if exists "Anyone can submit join request" on public.join_requests;

drop policy if exists "Members can submit reports" on public.reports;
drop policy if exists "Authenticated can read all reports" on public.reports;
drop policy if exists "Authenticated can update report status" on public.reports;

-- ============================================================
-- 5. members policies — users only manage their own row; admins
--    can read every profile.
-- ============================================================
drop policy if exists "Users can insert their own profile" on public.members;
create policy "Users can insert their own profile"
  on public.members for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own profile" on public.members;
create policy "Users can read own profile"
  on public.members for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.members;
create policy "Users can update own profile"
  on public.members for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins can read all profiles" on public.members;
create policy "Admins can read all profiles"
  on public.members for select
  to authenticated
  using (public.is_admin());

-- ============================================================
-- 6. join_requests — anyone can submit; only admins can read.
-- ============================================================
drop policy if exists "Anyone can insert join requests" on public.join_requests;
create policy "Anyone can insert join requests"
  on public.join_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can read join requests" on public.join_requests;
create policy "Admins can read join requests"
  on public.join_requests for select
  to authenticated
  using (public.is_admin());

-- ============================================================
-- 7. reports — members only touch their own reports; admins can
--    read all and update status.
-- ============================================================
drop policy if exists "Members can insert own reports" on public.reports;
create policy "Members can insert own reports"
  on public.reports for insert
  to authenticated
  with check (
    member_id in (select id from public.members where user_id = auth.uid())
  );

drop policy if exists "Members can read own reports" on public.reports;
create policy "Members can read own reports"
  on public.reports for select
  to authenticated
  using (
    member_id in (select id from public.members where user_id = auth.uid())
  );

drop policy if exists "Admins can read all reports" on public.reports;
create policy "Admins can read all reports"
  on public.reports for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports"
  on public.reports for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 8. Storage — bucket is public-read; only authenticated users
--    can upload.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view report photos" on storage.objects;
create policy "Anyone can view report photos"
  on storage.objects for select
  to anon, authenticated
  using ( bucket_id = 'report-photos' );

drop policy if exists "Authenticated users can upload photos" on storage.objects;
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'report-photos' );
