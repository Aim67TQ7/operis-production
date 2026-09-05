-- Generic template schema.
-- Every table has RLS enabled and its GRANTs in this same migration.

-- Roles live in their own table, never as a column on a profile.
create type public.app_role as enum ('admin', 'member', 'viewer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Security-definer so policies can call it without recursing through RLS.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- External systems this deployment can talk to. Credentials are NOT stored
-- here — auth_secret_ref names a server-side secret held by the edge function.
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  system_type text not null default 'rest',
  display_name text not null,
  base_url text not null,
  auth_secret_ref text,
  metadata_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cross-app links rendered by the breadcrumb bar.
create table public.app_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  is_new boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.user_roles    enable row level security;
alter table public.user_settings enable row level security;
alter table public.connections   enable row level security;
alter table public.app_items     enable row level security;

-- user_roles: readable by the owner and admins; only admins may write.
create policy "read own roles" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- user_settings: strictly own row.
create policy "read own settings" on public.user_settings
  for select to authenticated using (user_id = auth.uid());
create policy "upsert own settings" on public.user_settings
  for insert to authenticated with check (user_id = auth.uid());
create policy "update own settings" on public.user_settings
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- connections: any signed-in user may read; only admins may change.
create policy "read connections" on public.connections
  for select to authenticated using (true);
create policy "admins manage connections" on public.connections
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- app_items: readable by signed-in users; only admins may change.
create policy "read app items" on public.app_items
  for select to authenticated using (true);
create policy "admins manage app items" on public.app_items
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select on public.user_roles, public.connections, public.app_items to authenticated;
grant select, insert, update on public.user_settings to authenticated;
grant insert, update, delete on public.user_roles, public.connections, public.app_items to authenticated;
