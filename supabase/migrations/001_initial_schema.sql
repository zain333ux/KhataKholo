create extension if not exists pgcrypto;

do $$
begin
  create type public.roommate_role as enum ('admin', 'member');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.split_type as enum ('equal', 'custom');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('confirmed', 'pending_confirmation', 'disputed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.dispute_status as enum ('pending', 'resolved', 'rejected');
exception when duplicate_object then null;
end $$;

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  room_code text not null unique check (room_code ~ '^[A-Z0-9]{3,20}$'),
  created_by_roommate_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roommates (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  login_id text not null check (char_length(login_id) between 2 and 80),
  phone text,
  pin_hash text not null check (char_length(pin_hash) > 20),
  role public.roommate_role not null default 'member',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roommates_group_login_unique unique (group_id, login_id)
);

alter table public.groups
  drop constraint if exists groups_created_by_roommate_id_fkey;

alter table public.groups
  add constraint groups_created_by_roommate_id_fkey
  foreign key (created_by_roommate_id) references public.roommates(id) on delete set null;

create table if not exists public.roommate_sessions (
  id uuid primary key default gen_random_uuid(),
  roommate_id uuid not null references public.roommates(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  amount_paisa integer not null check (amount_paisa > 0),
  paid_by_roommate_id uuid not null constraint expenses_paid_by_roommate_id_fkey references public.roommates(id),
  created_by_roommate_id uuid not null constraint expenses_created_by_roommate_id_fkey references public.roommates(id),
  split_type public.split_type not null,
  expense_date date not null default current_date,
  note text,
  receipt_url text,
  receipt_public_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expense_members (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null constraint expense_members_expense_id_fkey references public.expenses(id) on delete cascade,
  roommate_id uuid not null constraint expense_members_roommate_id_fkey references public.roommates(id) on delete cascade,
  share_paisa integer not null check (share_paisa >= 0),
  created_at timestamptz not null default now(),
  constraint expense_members_unique unique (expense_id, roommate_id)
);

create table if not exists public.balances (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  roommate_one_id uuid not null constraint balances_roommate_one_id_fkey references public.roommates(id) on delete cascade,
  roommate_two_id uuid not null constraint balances_roommate_two_id_fkey references public.roommates(id) on delete cascade,
  debtor_roommate_id uuid not null constraint balances_debtor_roommate_id_fkey references public.roommates(id) on delete cascade,
  creditor_roommate_id uuid not null constraint balances_creditor_roommate_id_fkey references public.roommates(id) on delete cascade,
  amount_paisa integer not null default 0 check (amount_paisa >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint balances_pair_unique unique (group_id, roommate_one_id, roommate_two_id),
  constraint balances_no_self_pair check (roommate_one_id <> roommate_two_id),
  constraint balances_sorted_pair check (roommate_one_id::text < roommate_two_id::text),
  constraint balances_direction_in_pair check (
    debtor_roommate_id in (roommate_one_id, roommate_two_id)
    and creditor_roommate_id in (roommate_one_id, roommate_two_id)
    and debtor_roommate_id <> creditor_roommate_id
  )
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  from_roommate_id uuid not null constraint payments_from_roommate_id_fkey references public.roommates(id) on delete cascade,
  to_roommate_id uuid not null constraint payments_to_roommate_id_fkey references public.roommates(id) on delete cascade,
  amount_paisa integer not null check (amount_paisa > 0),
  status public.payment_status not null,
  initiated_by_roommate_id uuid not null constraint payments_initiated_by_roommate_id_fkey references public.roommates(id) on delete cascade,
  confirmed_by_roommate_id uuid constraint payments_confirmed_by_roommate_id_fkey references public.roommates(id) on delete set null,
  note text,
  confirmed_at timestamptz,
  disputed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_no_self check (from_roommate_id <> to_roommate_id)
);

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null constraint disputes_expense_id_fkey references public.expenses(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  raised_by_roommate_id uuid not null constraint disputes_raised_by_roommate_id_fkey references public.roommates(id) on delete cascade,
  reason text not null check (char_length(reason) between 5 and 500),
  suggested_correction_paisa integer check (suggested_correction_paisa is null or suggested_correction_paisa >= 0),
  status public.dispute_status not null default 'pending',
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  from_roommate_id uuid not null constraint reminders_from_roommate_id_fkey references public.roommates(id) on delete cascade,
  to_roommate_id uuid not null constraint reminders_to_roommate_id_fkey references public.roommates(id) on delete cascade,
  amount_paisa integer not null check (amount_paisa > 0),
  message text not null check (char_length(message) between 5 and 500),
  created_at timestamptz not null default now(),
  constraint reminders_no_self check (from_roommate_id <> to_roommate_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete set null,
  actor_roommate_id uuid references public.roommates(id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists roommates_group_id_idx on public.roommates(group_id);
create index if not exists roommate_sessions_roommate_id_idx on public.roommate_sessions(roommate_id);
create index if not exists roommate_sessions_expires_at_idx on public.roommate_sessions(expires_at);
create index if not exists expenses_group_date_idx on public.expenses(group_id, expense_date desc);
create index if not exists expense_members_roommate_idx on public.expense_members(roommate_id);
create index if not exists balances_debtor_idx on public.balances(debtor_roommate_id);
create index if not exists balances_creditor_idx on public.balances(creditor_roommate_id);
create index if not exists payments_involved_idx on public.payments(from_roommate_id, to_roommate_id, created_at desc);
create index if not exists disputes_group_idx on public.disputes(group_id, created_at desc);
create index if not exists reminders_involved_idx on public.reminders(from_roommate_id, to_roommate_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_groups_updated_at on public.groups;
create trigger set_groups_updated_at before update on public.groups
for each row execute function public.set_updated_at();

drop trigger if exists set_roommates_updated_at on public.roommates;
create trigger set_roommates_updated_at before update on public.roommates
for each row execute function public.set_updated_at();

drop trigger if exists set_expenses_updated_at on public.expenses;
create trigger set_expenses_updated_at before update on public.expenses
for each row execute function public.set_updated_at();

drop trigger if exists set_balances_updated_at on public.balances;
create trigger set_balances_updated_at before update on public.balances
for each row execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists set_disputes_updated_at on public.disputes;
create trigger set_disputes_updated_at before update on public.disputes
for each row execute function public.set_updated_at();

