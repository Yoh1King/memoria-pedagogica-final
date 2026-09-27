create table public.profiles (
  id uuid primary key,
  name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), coalesce(new.email, ''));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create table public.classes (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid(),
  name text not null,
  subject text not null default '',
  shift text not null,
  days text[] not null default '{}',
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.students (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid(),
  class_id text not null references public.classes(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create table public.records (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid(),
  class_id text not null references public.classes(id) on delete cascade,
  date text not null,
  time text not null default '',
  topic text not null default '',
  type text not null,
  custom_type text,
  custom_classification text,
  scope text not null,
  student_ids text[] not null default '{}',
  detail text,
  created_at timestamptz not null default now()
);
create index on public.classes(user_id);
create index on public.students(user_id);
create index on public.records(user_id);

grant select, insert, update, delete on public.classes, public.students, public.records to authenticated;
grant all on public.classes, public.students, public.records to service_role;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.records enable row level security;
create policy "own classes" on public.classes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own students" on public.students for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own records" on public.records for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);