-- Run this only if the older email-based schema was already applied.
-- Existing roommates from that older flow need PIN reset/recreation because their old PINs cannot be recovered.

drop policy if exists "groups_select_own" on public.groups;
drop policy if exists "groups_insert_authenticated" on public.groups;
drop policy if exists "groups_update_admin" on public.groups;

drop policy if exists "roommates_select_same_group" on public.roommates;
drop policy if exists "roommates_insert_self_or_admin" on public.roommates;
drop policy if exists "roommates_update_self_or_admin" on public.roommates;

drop policy if exists "expenses_select_involved_or_admin" on public.expenses;
drop policy if exists "expenses_insert_current_group" on public.expenses;

drop policy if exists "expense_members_select_involved_or_admin" on public.expense_members;
drop policy if exists "expense_members_insert_current_group" on public.expense_members;

drop policy if exists "balances_select_private_pair" on public.balances;

drop policy if exists "payments_select_private" on public.payments;
drop policy if exists "payments_insert_private" on public.payments;
drop policy if exists "payments_update_receiver" on public.payments;

drop policy if exists "disputes_select_involved" on public.disputes;
drop policy if exists "disputes_insert_member" on public.disputes;
drop policy if exists "disputes_update_own_pending" on public.disputes;

drop policy if exists "reminders_select_private" on public.reminders;
drop policy if exists "reminders_insert_private" on public.reminders;

drop policy if exists "audit_logs_select_admin" on public.audit_logs;

drop function if exists public.apply_confirmed_payment(uuid, uuid, uuid, integer);
drop function if exists public.apply_expense_balance(uuid, uuid, uuid, integer);
drop function if exists public.expense_visible_to_current(uuid);
drop function if exists public.roommate_in_current_group(uuid);
drop function if exists public.is_group_admin(uuid);
drop function if exists public.current_group_id();
drop function if exists public.current_roommate_id();

alter table public.groups disable row level security;
alter table public.roommates disable row level security;
alter table public.expenses disable row level security;
alter table public.expense_members disable row level security;
alter table public.balances disable row level security;
alter table public.payments disable row level security;
alter table public.disputes disable row level security;
alter table public.reminders disable row level security;
alter table public.audit_logs disable row level security;

alter table public.roommates
  drop column if exists auth_user_id;

alter table public.roommates
  add column if not exists pin_hash text;

update public.roommates
set pin_hash = 'scrypt$reset-needed$reset-needed'
where pin_hash is null;

alter table public.roommates
  alter column pin_hash set not null;

do $$
begin
  alter table public.roommates
    add constraint roommates_pin_hash_length check (char_length(pin_hash) > 20);
exception when duplicate_object then null;
end $$;

create table if not exists public.roommate_sessions (
  id uuid primary key default gen_random_uuid(),
  roommate_id uuid not null references public.roommates(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists roommate_sessions_roommate_id_idx on public.roommate_sessions(roommate_id);
create index if not exists roommate_sessions_expires_at_idx on public.roommate_sessions(expires_at);

alter table public.groups enable row level security;
alter table public.roommates enable row level security;
alter table public.roommate_sessions enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_members enable row level security;
alter table public.balances enable row level security;
alter table public.payments enable row level security;
alter table public.disputes enable row level security;
alter table public.reminders enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "service_role_all_groups" on public.groups;
create policy "service_role_all_groups" on public.groups
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_all_roommates" on public.roommates;
create policy "service_role_all_roommates" on public.roommates
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_all_roommate_sessions" on public.roommate_sessions;
create policy "service_role_all_roommate_sessions" on public.roommate_sessions
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_all_expenses" on public.expenses;
create policy "service_role_all_expenses" on public.expenses
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_all_expense_members" on public.expense_members;
create policy "service_role_all_expense_members" on public.expense_members
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_all_balances" on public.balances;
create policy "service_role_all_balances" on public.balances
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_all_payments" on public.payments;
create policy "service_role_all_payments" on public.payments
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_all_disputes" on public.disputes;
create policy "service_role_all_disputes" on public.disputes
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_all_reminders" on public.reminders;
create policy "service_role_all_reminders" on public.reminders
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_all_audit_logs" on public.audit_logs;
create policy "service_role_all_audit_logs" on public.audit_logs
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
