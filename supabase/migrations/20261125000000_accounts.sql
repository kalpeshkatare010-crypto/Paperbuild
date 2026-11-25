-- Paper Build: accounts, saved papers, payments, figure storage.

-- Profiles: one row per user, created automatically at sign-up.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  phone text,
  full_name text,
  pro_until timestamptz,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
-- Users can read their own profile. Only the payment functions (service role) change pro_until.
create policy "read own profile" on public.profiles for select using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, phone, full_name)
  values (new.id, new.email, new.phone, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_pro(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select pro_until > now() from public.profiles where id = uid), false)
$$;

-- Saved papers. Free accounts can keep 1; Pro is unlimited.
create table if not exists public.papers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists papers_user_idx on public.papers (user_id, updated_at desc);
alter table public.papers enable row level security;
create policy "read own papers"   on public.papers for select using (auth.uid() = user_id);
create policy "add own papers"    on public.papers for insert with check (auth.uid() = user_id);
create policy "edit own papers"   on public.papers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own papers" on public.papers for delete using (auth.uid() = user_id);

create or replace function public.papers_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_pro(new.user_id)
     and (select count(*) from public.papers where user_id = new.user_id) >= 1 then
    raise exception 'FREE_LIMIT: Free accounts can save 1 paper. Upgrade to Pro to save more.';
  end if;
  return new;
end $$;
drop trigger if exists papers_limit on public.papers;
create trigger papers_limit before insert on public.papers
  for each row execute function public.papers_limit();

-- Payments made through Razorpay.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  razorpay_order_id text unique not null,
  razorpay_payment_id text,
  plan text not null check (plan in ('monthly', 'yearly')),
  amount integer not null,
  status text not null default 'created',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
alter table public.payments enable row level security;
create policy "read own payments" on public.payments for select using (auth.uid() = user_id);

-- Figure images, stored privately per user in figures/<user id>/<figure id>.jpg
insert into storage.buckets (id, name, public) values ('figures', 'figures', false)
  on conflict (id) do nothing;
create policy "read own figures" on storage.objects for select
  using (bucket_id = 'figures' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "add own figures" on storage.objects for insert
  with check (bucket_id = 'figures' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "replace own figures" on storage.objects for update
  using (bucket_id = 'figures' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own figures" on storage.objects for delete
  using (bucket_id = 'figures' and (storage.foldername(name))[1] = auth.uid()::text);
