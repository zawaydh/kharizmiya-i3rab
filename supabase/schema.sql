create table if not exists public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_code text not null,
  level text not null default 'متوسط',
  percent int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_code)
);

alter table public.progress enable row level security;

drop policy if exists "Progress: read own" on public.progress;
create policy "Progress: read own"
on public.progress for select
using (auth.uid() = user_id);

drop policy if exists "Progress: insert own" on public.progress;
create policy "Progress: insert own"
on public.progress for insert
with check (auth.uid() = user_id);

drop policy if exists "Progress: update own" on public.progress;
create policy "Progress: update own"
on public.progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
