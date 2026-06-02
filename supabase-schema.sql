create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  picture text,
  role text not null default 'user' check (role in ('user', 'admin', 'client')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text,
  business_type text not null,
  email text,
  phone text,
  instagram_handle text,
  package text not null default 'basic' check (package in ('basic', 'standard', 'premium')),
  status text not null default 'trial' check (status in ('active', 'inactive', 'trial')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  business_type text not null,
  tone text not null,
  platform text not null,
  offer text,
  variations jsonb not null,
  selected_variation integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'approved', 'delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  business_type text not null,
  business_name text,
  city text,
  service_interest text,
  message text,
  source text default 'website',
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'lost')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  business_type text not null,
  ideas jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reel_scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  business_type text not null,
  topic text not null,
  tone text not null,
  script jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  business_type text not null,
  service text not null,
  preferred_date date not null,
  preferred_time text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.generated_content enable row level security;
alter table public.leads enable row level security;
alter table public.content_ideas enable row level security;
alter table public.reel_scripts enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "leads public insert" on public.leads;
create policy "leads public insert"
on public.leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "leads service role full access" on public.leads;
create policy "leads service role full access"
on public.leads
for all
to service_role
using (true)
with check (true);

drop policy if exists "bookings public insert" on public.bookings;
create policy "bookings public insert"
on public.bookings
for insert
to anon, authenticated
with check (true);

drop policy if exists "bookings service role full access" on public.bookings;
create policy "bookings service role full access"
on public.bookings
for all
to service_role
using (true)
with check (true);

drop policy if exists "users service role full access" on public.users;
create policy "users service role full access"
on public.users
for all
to service_role
using (true)
with check (true);

drop policy if exists "clients service role full access" on public.clients;
create policy "clients service role full access"
on public.clients
for all
to service_role
using (true)
with check (true);

drop policy if exists "generated content service role full access" on public.generated_content;
create policy "generated content service role full access"
on public.generated_content
for all
to service_role
using (true)
with check (true);

drop policy if exists "content ideas service role full access" on public.content_ideas;
create policy "content ideas service role full access"
on public.content_ideas
for all
to service_role
using (true)
with check (true);

drop policy if exists "reel scripts service role full access" on public.reel_scripts;
create policy "reel scripts service role full access"
on public.reel_scripts
for all
to service_role
using (true)
with check (true);
