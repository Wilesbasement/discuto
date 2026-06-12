create extension if not exists pgcrypto;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'osm',
  source_id text not null,
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
  updated_at timestamptz not null default now(),
  unique (source, source_id)
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

alter table public.courses alter column source_id set not null;

create unique index if not exists courses_source_source_id_unique_idx on public.courses (source, source_id);
create index if not exists courses_source_idx on public.courses (source, source_id);
create index if not exists courses_google_place_id_idx on public.courses (google_place_id);
create index if not exists courses_location_idx on public.courses (latitude, longitude);
create index if not exists courses_name_idx on public.courses (name);
create index if not exists courses_city_state_idx on public.courses (city, state);
create index if not exists courses_country_idx on public.courses (country);

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
create policy "Courses are public readable"
on public.courses
for select
using (true);

create table if not exists public.user_course_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.user_course_saves enable row level security;

drop policy if exists "Users can read own saved courses" on public.user_course_saves;
create policy "Users can read own saved courses"
on public.user_course_saves
for select
using (auth.uid() = user_id);

drop policy if exists "Users can save courses" on public.user_course_saves;
create policy "Users can save courses"
on public.user_course_saves
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can unsave own courses" on public.user_course_saves;
create policy "Users can unsave own courses"
on public.user_course_saves
for delete
using (auth.uid() = user_id);

create table if not exists public.course_claims (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_requested text not null default 'course_admin',
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, user_id)
);

drop trigger if exists course_claims_set_updated_at on public.course_claims;
create trigger course_claims_set_updated_at
before update on public.course_claims
for each row execute function public.set_updated_at();

alter table public.course_claims enable row level security;

drop policy if exists "Users can create course claims" on public.course_claims;
create policy "Users can create course claims"
on public.course_claims
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can read own course claims" on public.course_claims;
create policy "Users can read own course claims"
on public.course_claims
for select
using (auth.uid() = user_id);

create table if not exists public.course_admins (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);

alter table public.course_admins enable row level security;

drop policy if exists "Course admins can read own admin rows" on public.course_admins;
create policy "Course admins can read own admin rows"
on public.course_admins
for select
using (auth.uid() = user_id);

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
