-- سجّل أخطاء الواجهة من مسار الخادم فقط، من دون كشف السجل للعميل.
begin;

create table if not exists public.app_error_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  source text not null check (char_length(source) between 1 and 40),
  message text not null check (char_length(message) between 1 and 500),
  digest text check (digest is null or char_length(digest) <= 120),
  route text not null check (char_length(route) between 1 and 240),
  user_agent text not null check (char_length(user_agent) between 1 and 320),
  created_at timestamptz not null default now()
);

create index if not exists app_error_events_created_at_idx
  on public.app_error_events (created_at desc);
create index if not exists app_error_events_user_created_at_idx
  on public.app_error_events (user_id, created_at desc)
  where user_id is not null;

alter table public.app_error_events enable row level security;
revoke all on table public.app_error_events from anon, authenticated;

commit;
