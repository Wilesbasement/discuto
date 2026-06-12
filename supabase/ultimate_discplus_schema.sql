create extension if not exists pgcrypto;

-- Core course registry. Source of truth for your future API.
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'osm',
  source_id text,
  osm_type text,
  osm_id text,
  google_place_id text,
  google_maps_uri text,
  name text not null,
  description text,
  latitude double precision,
  longitude double precision,
  address text,
  city text,
  state text,
  country text,
  postal_code text,
  hole_count integer,
  rating numeric,
  website text,
  phone text,
  tags jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses add column if not exists source text not null default 'osm';
alter table public.courses add column if not exists source_id text;
alter table public.courses add column if not exists osm_type text;
alter table public.courses add column if not exists osm_id text;
alter table public.courses add column if not exists google_place_id text;
alter table public.courses add column if not exists google_maps_uri text;
alter table public.courses add column if not exists description text;
alter table public.courses add column if not exists latitude double precision;
alter table public.courses add column if not exists longitude double precision;
alter table public.courses add column if not exists address text;
alter table public.courses add column if not exists city text;
alter table public.courses add column if not exists state text;
alter table public.courses add column if not exists country text;
alter table public.courses add column if not exists postal_code text;
alter table public.courses add column if not exists hole_count integer;
alter table public.courses add column if not exists rating numeric;
alter table public.courses add column if not exists website text;
alter table public.courses add column if not exists phone text;
alter table public.courses add column if not exists tags jsonb not null default '{}'::jsonb;
alter table public.courses add column if not exists status text not null default 'active';
alter table public.courses add column if not exists created_at timestamptz not null default now();
alter table public.courses add column if not exists updated_at timestamptz not null default now();

update public.courses set source = coalesce(source, 'osm');
update public.courses set source_id = coalesce(source_id, osm_type || '-' || osm_id, id::text);
update public.courses set status = coalesce(status, 'active');

create unique index if not exists courses_source_source_id_unique_idx on public.courses (source, source_id);
create index if not exists courses_name_idx on public.courses (name);
create index if not exists courses_city_state_idx on public.courses (city, state);
create index if not exists courses_country_idx on public.courses (country);
create index if not exists courses_location_idx on public.courses (latitude, longitude);
create index if not exists courses_google_place_id_idx on public.courses (google_place_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

alter table public.courses enable row level security;
drop policy if exists "Courses are public readable" on public.courses;
create policy "Courses are public readable" on public.courses for select using (true);

-- Saved courses. Keep course_id as text so it works with UUID course IDs and old local IDs.
create table if not exists public.user_course_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.user_course_saves enable row level security;
drop policy if exists "Users can read own saved courses" on public.user_course_saves;
create policy "Users can read own saved courses" on public.user_course_saves for select using (auth.uid() = user_id);
drop policy if exists "Users can save courses" on public.user_course_saves;
create policy "Users can save courses" on public.user_course_saves for insert with check (auth.uid() = user_id);
drop policy if exists "Users can unsave own courses" on public.user_course_saves;
create policy "Users can unsave own courses" on public.user_course_saves for delete using (auth.uid() = user_id);

-- Check-ins. Add missing columns safely for older builds.
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  course_name text,
  score integer,
  note text,
  notes text,
  playing_now boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.checkins add column if not exists course_id text;
alter table public.checkins add column if not exists course_name text;
alter table public.checkins add column if not exists score integer;
alter table public.checkins add column if not exists note text;
alter table public.checkins add column if not exists notes text;
alter table public.checkins add column if not exists playing_now boolean not null default true;
alter table public.checkins add column if not exists created_at timestamptz not null default now();
update public.checkins set notes = coalesce(notes, note), note = coalesce(note, notes);
create index if not exists checkins_course_id_idx on public.checkins(course_id);
create index if not exists checkins_user_id_idx on public.checkins(user_id);
create index if not exists checkins_created_at_idx on public.checkins(created_at desc);

alter table public.checkins enable row level security;
drop policy if exists "Checkins are public readable" on public.checkins;
create policy "Checkins are public readable" on public.checkins for select using (true);
drop policy if exists "Users can create own checkins" on public.checkins;
create policy "Users can create own checkins" on public.checkins for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own checkins" on public.checkins;
create policy "Users can update own checkins" on public.checkins for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own checkins" on public.checkins;
create policy "Users can delete own checkins" on public.checkins for delete using (auth.uid() = user_id);

-- Rounds / scorecards.
create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  course_name text,
  total_score integer not null,
  holes_played integer not null default 18,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.rounds add column if not exists course_id text;
alter table public.rounds add column if not exists course_name text;
alter table public.rounds add column if not exists total_score integer;
alter table public.rounds add column if not exists holes_played integer not null default 18;
alter table public.rounds add column if not exists notes text;
alter table public.rounds add column if not exists created_at timestamptz not null default now();
create index if not exists rounds_course_score_idx on public.rounds(course_id, total_score asc);
create index if not exists rounds_user_id_idx on public.rounds(user_id);
create index if not exists rounds_created_at_idx on public.rounds(created_at desc);

alter table public.rounds enable row level security;
drop policy if exists "Rounds are public readable" on public.rounds;
create policy "Rounds are public readable" on public.rounds for select using (true);
drop policy if exists "Users can create own rounds" on public.rounds;
create policy "Users can create own rounds" on public.rounds for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own rounds" on public.rounds;
create policy "Users can update own rounds" on public.rounds for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own rounds" on public.rounds;
create policy "Users can delete own rounds" on public.rounds for delete using (auth.uid() = user_id);

-- Course claims for club / league director wedge.
create table if not exists public.course_claims (
  id uuid primary key default gen_random_uuid(),
  course_id text,
  course_name text,
  user_id uuid references auth.users(id) on delete cascade,
  requester_name text,
  requester_email text,
  role text,
  role_requested text not null default 'course_admin',
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_claims add column if not exists course_id text;
alter table public.course_claims add column if not exists course_name text;
alter table public.course_claims add column if not exists requester_name text;
alter table public.course_claims add column if not exists requester_email text;
alter table public.course_claims add column if not exists role text;
alter table public.course_claims add column if not exists role_requested text not null default 'course_admin';
alter table public.course_claims add column if not exists message text;
alter table public.course_claims add column if not exists status text not null default 'pending';
alter table public.course_claims add column if not exists created_at timestamptz not null default now();
alter table public.course_claims add column if not exists updated_at timestamptz not null default now();

drop trigger if exists course_claims_set_updated_at on public.course_claims;
create trigger course_claims_set_updated_at before update on public.course_claims for each row execute function public.set_updated_at();

alter table public.course_claims enable row level security;
drop policy if exists "Users can create course claims" on public.course_claims;
create policy "Users can create course claims" on public.course_claims for insert with check (auth.uid() = user_id);
drop policy if exists "Users can read own course claims" on public.course_claims;
create policy "Users can read own course claims" on public.course_claims for select using (auth.uid() = user_id);

create table if not exists public.course_admins (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);

alter table public.course_admins enable row level security;
drop policy if exists "Course admins can read own admin rows" on public.course_admins;
create policy "Course admins can read own admin rows" on public.course_admins for select using (auth.uid() = user_id);

-- Public API views.
drop view if exists public.api_courses;
create view public.api_courses as
select
  id,
  source,
  source_id,
  osm_type,
  osm_id,
  google_place_id,
  google_maps_uri,
  name,
  description,
  latitude,
  longitude,
  address,
  city,
  state,
  country,
  postal_code,
  hole_count,
  rating,
  website,
  phone,
  status,
  created_at,
  updated_at
from public.courses
where status = 'active';
