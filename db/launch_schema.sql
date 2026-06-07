-- DiscPlus launch schema. Safe to run multiple times in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  username text unique,
  display_name text,
  home_course_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists home_course_id text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
create unique index if not exists profiles_username_lower_idx on public.profiles(lower(username)) where username is not null;
create unique index if not exists profiles_email_lower_idx on public.profiles(lower(email)) where email is not null;
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  course_name text,
  score integer,
  notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  course_name text,
  total_score integer not null,
  holes_played integer not null default 18,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.checkins add column if not exists course_name text;
alter table public.checkins add column if not exists score integer;
alter table public.checkins add column if not exists notes text;
alter table public.rounds add column if not exists course_name text;
alter table public.rounds add column if not exists holes_played integer not null default 18;
alter table public.rounds add column if not exists notes text;
alter table public.profiles enable row level security;
alter table public.checkins enable row level security;
alter table public.rounds enable row level security;
drop policy if exists "Profiles public read" on public.profiles;
drop policy if exists "Profiles self insert" on public.profiles;
drop policy if exists "Profiles self update" on public.profiles;
drop policy if exists "Checkins public read" on public.checkins;
drop policy if exists "Checkins self insert" on public.checkins;
drop policy if exists "Rounds public read" on public.rounds;
drop policy if exists "Rounds self insert" on public.rounds;
create policy "Profiles public read" on public.profiles for select using (true);
create policy "Profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles self update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Checkins public read" on public.checkins for select using (true);
create policy "Checkins self insert" on public.checkins for insert with check (auth.uid() = user_id);
create policy "Rounds public read" on public.rounds for select using (true);
create policy "Rounds self insert" on public.rounds for insert with check (auth.uid() = user_id);
create index if not exists checkins_course_idx on public.checkins(course_id, created_at desc);
create index if not exists checkins_user_idx on public.checkins(user_id, created_at desc);
create index if not exists rounds_course_score_idx on public.rounds(course_id, total_score asc, created_at desc);
create index if not exists rounds_user_idx on public.rounds(user_id, created_at desc);
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, display_name)
  values (
    new.id,
    new.email,
    lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update set
    email = excluded.email,
    username = coalesce(public.profiles.username, excluded.username),
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    updated_at = now();
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
