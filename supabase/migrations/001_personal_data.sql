-- Run once in your own Supabase project's SQL editor.
create table public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (key in ('workoutSettings','soundSettings','allExercises','playlist','workoutHistory','workoutPlans','musicPlaylist')),
  value jsonb not null check (octet_length(value::text) <= 1048576),
  primary key (user_id, key)
);
alter table public.user_data enable row level security;
revoke all on public.user_data from anon;
grant select, insert, update, delete on public.user_data to authenticated;
create policy "Read own data" on public.user_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own data" on public.user_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own data" on public.user_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own data" on public.user_data for delete to authenticated using ((select auth.uid()) = user_id);

