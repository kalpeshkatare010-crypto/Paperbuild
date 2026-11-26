-- Paper Build: admin accounts get every Pro feature free, and payments can be in INR or USD.

-- Admin emails. Anyone who signs up (and confirms) with one of these emails is an admin.
create table if not exists public.admin_emails (
  email text primary key
);
alter table public.admin_emails enable row level security;
-- No policies: only the database itself (security definer functions) can read this list.

insert into public.admin_emails (email) values ('kalpeshkatare010@gmail.com')
  on conflict (email) do nothing;

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Admins are always Pro.
create or replace function public.is_pro(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select is_admin or coalesce(pro_until > now(), false) from public.profiles where id = uid), false)
$$;

-- Mark admins when the profile is created, and when an email is confirmed or changed.
create or replace function public.sync_admin(uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles p
     set is_admin = exists (
           select 1 from auth.users u
             join public.admin_emails a on lower(a.email) = lower(u.email)
            where u.id = uid and u.email_confirmed_at is not null),
         email = (select email from auth.users where id = uid)
   where p.id = uid;
end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, phone, full_name)
  values (new.id, new.email, new.phone, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  perform public.sync_admin(new.id);
  return new;
end $$;

create or replace function public.handle_user_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.sync_admin(new.id);
  return new;
end $$;
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated after update of email, email_confirmed_at on auth.users
  for each row execute function public.handle_user_update();

-- Accounts that already exist.
select public.sync_admin(id) from auth.users;

-- Payments: record the currency (INR for India, USD elsewhere).
alter table public.payments add column if not exists currency text not null default 'INR';
