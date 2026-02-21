-- Users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  phone text unique,
  email text unique,
  created_at timestamptz default now()
);

-- Markets
create table if not exists public.markets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  open_time time not null,
  close_time time not null,
  created_at timestamptz default now()
);

-- Wallets
create table if not exists public.wallets (
  user_id uuid primary key references public.users(id) on delete cascade,
  balance numeric(12,2) not null default 50000
);

-- Bets
create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade,
  game_type text not null check (game_type in ('single-digit','jodi','single-panna','double-panna','triple-panna')),
  selection text not null,
  amount numeric(12,2) not null check (amount > 0),
  placed_at timestamptz not null default now()
);
create index if not exists bets_by_user_day on public.bets (user_id, date(placed_at));
create index if not exists bets_by_market_day on public.bets (market_id, date(placed_at));
create index if not exists bets_by_selection_day on public.bets (selection, date(placed_at));

-- Results
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  result_date date not null,
  winning text not null,
  declared_at timestamptz default now(),
  unique(market_id, result_date)
);

-- Helper to check market open window for current day
create or replace function public.is_market_open(mid uuid) returns boolean as $$
declare
  ot time;
  ct time;
  nowt time;
begin
  select open_time, close_time into ot, ct from public.markets where id = mid;
  nowt := (now() at time zone 'UTC')::time; -- adjust to your tz
  return nowt between ot and ct;
end;
$$ language plpgsql stable;

-- Place bet with wallet deduction and time check
create or replace function public.place_bet(
  p_user uuid,
  p_market uuid,
  p_type text,
  p_selection text,
  p_amount numeric
) returns uuid as $$
declare
  bid uuid;
begin
  if not public.is_market_open(p_market) then
    raise exception 'Market closed';
  end if;

  update public.wallets
    set balance = balance - p_amount
    where user_id = p_user and balance >= p_amount;
  if not found then
    raise exception 'Insufficient balance or concurrent update';
  end if;

  insert into public.bets(user_id, market_id, game_type, selection, amount)
  values (p_user, p_market, p_type, p_selection, p_amount)
  returning id into bid;

  return bid;
end;
$$ language plpgsql volatile;
