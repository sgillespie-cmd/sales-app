create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create type public.member_role as enum ('owner', 'editor', 'viewer');
create type public.venue_status as enum ('researching', 'contacted', 'toured', 'shortlisted', 'rejected', 'selected');
create type public.preferred_channel as enum ('email', 'phone', 'sms');
create type public.interaction_type as enum ('call', 'email', 'tour', 'meeting', 'note');
create type public.doc_kind as enum ('brochure', 'menu', 'pricing', 'contract', 'floorplan', 'other');
create type public.task_status as enum ('open', 'in_progress', 'done');

create table public.wedding_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.account_members (
  account_id uuid not null references public.wedding_accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'viewer',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (account_id, user_id)
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.wedding_accounts(id) on delete cascade,
  name text not null,
  city text,
  state_region text,
  address text,
  website_url text,
  capacity_min int,
  capacity_max int,
  price_estimate_min numeric(12,2),
  price_estimate_max numeric(12,2),
  status public.venue_status not null default 'researching',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint venue_capacity_check
    check (capacity_min is null or capacity_max is null or capacity_min <= capacity_max),
  constraint venue_price_check
    check (price_estimate_min is null or price_estimate_max is null or price_estimate_min <= price_estimate_max)
);

create table public.score_factors (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.wedding_accounts(id) on delete cascade,
  key text not null,
  label text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (account_id, key)
);

create table public.factor_weights (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.wedding_accounts(id) on delete cascade,
  factor_id uuid not null references public.score_factors(id) on delete cascade,
  weight numeric(8,3) not null default 1.0 check (weight >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (account_id, factor_id)
);

create table public.venue_scores (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.wedding_accounts(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  factor_id uuid not null references public.score_factors(id) on delete cascade,
  score int not null check (score between 1 and 10),
  rationale text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (venue_id, factor_id)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.wedding_accounts(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  preferred_channel public.preferred_channel,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.wedding_accounts(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  interaction_type public.interaction_type not null,
  occurred_at timestamptz not null,
  summary text not null,
  transcript_text text,
  next_action text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.wedding_accounts(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  doc_kind public.doc_kind not null default 'other',
  extracted_text text,
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.wedding_accounts(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  title text not null,
  status public.task_status not null default 'open',
  due_at timestamptz,
  assignee uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.wedding_accounts(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (account_id, name)
);

create table public.venue_tags (
  venue_id uuid not null references public.venues(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (venue_id, tag_id)
);

create index venues_account_idx on public.venues(account_id);
create index venues_status_idx on public.venues(status);
create index venues_city_idx on public.venues(city);
create index score_factors_account_idx on public.score_factors(account_id);
create index factor_weights_account_idx on public.factor_weights(account_id);
create index venue_scores_venue_idx on public.venue_scores(venue_id);
create index contacts_venue_idx on public.contacts(venue_id);
create index interactions_venue_occurred_idx on public.interactions(venue_id, occurred_at desc);
create index documents_venue_idx on public.documents(venue_id);
create index tasks_venue_status_idx on public.tasks(venue_id, status);
create index tags_account_idx on public.tags(account_id);

create trigger trg_wedding_accounts_updated_at
before update on public.wedding_accounts
for each row execute function public.set_updated_at();

create trigger trg_venues_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

create trigger trg_score_factors_updated_at
before update on public.score_factors
for each row execute function public.set_updated_at();

create trigger trg_factor_weights_updated_at
before update on public.factor_weights
for each row execute function public.set_updated_at();

create trigger trg_venue_scores_updated_at
before update on public.venue_scores
for each row execute function public.set_updated_at();

create trigger trg_contacts_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger trg_interactions_updated_at
before update on public.interactions
for each row execute function public.set_updated_at();

create trigger trg_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create or replace view public.venue_score_summary as
select
  v.id as venue_id,
  v.account_id,
  round(
    (
      sum(case when vs.score is not null then vs.score::numeric * fw.weight end)
      / nullif(sum(case when vs.score is not null then fw.weight end), 0)
    )::numeric
  , 2) as weighted_score,
  round(
    (
      count(vs.score)::numeric / nullif(count(sf.id), 0) * 100
    )::numeric
  , 1) as completeness_pct,
  count(vs.score) as scored_factor_count,
  count(sf.id) as active_factor_count
from public.venues v
left join public.score_factors sf
  on sf.account_id = v.account_id
 and sf.active = true
left join public.factor_weights fw
  on fw.account_id = v.account_id
 and fw.factor_id = sf.id
left join public.venue_scores vs
  on vs.account_id = v.account_id
 and vs.venue_id = v.id
 and vs.factor_id = sf.id
group by v.id, v.account_id;
