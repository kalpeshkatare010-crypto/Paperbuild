-- Paper Build: tighten access to helper functions, and track refunds.

-- These helpers are for the database itself (triggers and payment functions), not for the public API.
revoke execute on function public.sync_admin(uuid) from public, anon, authenticated;
revoke execute on function public.is_pro(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_update() from public, anon, authenticated;
revoke execute on function public.papers_limit() from public, anon, authenticated;

-- Refunds: remember when a payment was refunded.
alter table public.payments add column if not exists refunded_at timestamptz;
