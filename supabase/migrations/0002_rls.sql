-- Helper functions (SECURITY DEFINER prevents recursive RLS lookups)
create or replace function public.is_account_member(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.account_members m
    where m.account_id = target_account_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_account_owner(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.account_members m
    where m.account_id = target_account_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
$$;

revoke all on function public.is_account_member(uuid) from public;
revoke all on function public.is_account_owner(uuid) from public;
grant execute on function public.is_account_member(uuid) to authenticated;
grant execute on function public.is_account_owner(uuid) to authenticated;

-- Enable RLS
alter table public.wedding_accounts enable row level security;
alter table public.account_members enable row level security;
alter table public.venues enable row level security;
alter table public.score_factors enable row level security;
alter table public.factor_weights enable row level security;
alter table public.venue_scores enable row level security;
alter table public.contacts enable row level security;
alter table public.interactions enable row level security;
alter table public.documents enable row level security;
alter table public.tasks enable row level security;
alter table public.tags enable row level security;
alter table public.venue_tags enable row level security;

-- wedding_accounts
create policy "accounts_select_member"
on public.wedding_accounts for select
using (public.is_account_member(id));

create policy "accounts_insert_creator"
on public.wedding_accounts for insert
with check (created_by = auth.uid());

create policy "accounts_update_owner"
on public.wedding_accounts for update
using (public.is_account_owner(id))
with check (public.is_account_owner(id));

create policy "accounts_delete_owner"
on public.wedding_accounts for delete
using (public.is_account_owner(id));

-- account_members
create policy "members_select_member"
on public.account_members for select
using (public.is_account_member(account_id));

create policy "members_insert_owner"
on public.account_members for insert
with check (
  public.is_account_owner(account_id)
  or (
    user_id = auth.uid()
    and exists (
      select 1
      from public.wedding_accounts a
      where a.id = account_id
        and a.created_by = auth.uid()
    )
  )
);

create policy "members_update_owner"
on public.account_members for update
using (public.is_account_owner(account_id))
with check (public.is_account_owner(account_id));

create policy "members_delete_owner"
on public.account_members for delete
using (public.is_account_owner(account_id));

-- Common member CRUD policy pattern
create policy "venues_member_select" on public.venues for select using (public.is_account_member(account_id));
create policy "venues_member_insert" on public.venues for insert with check (public.is_account_member(account_id));
create policy "venues_member_update" on public.venues for update using (public.is_account_member(account_id)) with check (public.is_account_member(account_id));
create policy "venues_member_delete" on public.venues for delete using (public.is_account_member(account_id));

create policy "factors_member_select" on public.score_factors for select using (public.is_account_member(account_id));
create policy "factors_member_insert" on public.score_factors for insert with check (public.is_account_member(account_id));
create policy "factors_member_update" on public.score_factors for update using (public.is_account_member(account_id)) with check (public.is_account_member(account_id));
create policy "factors_member_delete" on public.score_factors for delete using (public.is_account_member(account_id));

create policy "weights_member_select" on public.factor_weights for select using (public.is_account_member(account_id));
create policy "weights_member_insert" on public.factor_weights for insert with check (public.is_account_member(account_id));
create policy "weights_member_update" on public.factor_weights for update using (public.is_account_member(account_id)) with check (public.is_account_member(account_id));
create policy "weights_member_delete" on public.factor_weights for delete using (public.is_account_member(account_id));

create policy "scores_member_select" on public.venue_scores for select using (public.is_account_member(account_id));
create policy "scores_member_insert" on public.venue_scores for insert with check (public.is_account_member(account_id));
create policy "scores_member_update" on public.venue_scores for update using (public.is_account_member(account_id)) with check (public.is_account_member(account_id));
create policy "scores_member_delete" on public.venue_scores for delete using (public.is_account_member(account_id));

create policy "contacts_member_select" on public.contacts for select using (public.is_account_member(account_id));
create policy "contacts_member_insert" on public.contacts for insert with check (public.is_account_member(account_id));
create policy "contacts_member_update" on public.contacts for update using (public.is_account_member(account_id)) with check (public.is_account_member(account_id));
create policy "contacts_member_delete" on public.contacts for delete using (public.is_account_member(account_id));

create policy "interactions_member_select" on public.interactions for select using (public.is_account_member(account_id));
create policy "interactions_member_insert" on public.interactions for insert with check (public.is_account_member(account_id));
create policy "interactions_member_update" on public.interactions for update using (public.is_account_member(account_id)) with check (public.is_account_member(account_id));
create policy "interactions_member_delete" on public.interactions for delete using (public.is_account_member(account_id));

create policy "documents_member_select" on public.documents for select using (public.is_account_member(account_id));
create policy "documents_member_insert" on public.documents for insert with check (public.is_account_member(account_id));
create policy "documents_member_update" on public.documents for update using (public.is_account_member(account_id)) with check (public.is_account_member(account_id));
create policy "documents_member_delete" on public.documents for delete using (public.is_account_member(account_id));

create policy "tasks_member_select" on public.tasks for select using (public.is_account_member(account_id));
create policy "tasks_member_insert" on public.tasks for insert with check (public.is_account_member(account_id));
create policy "tasks_member_update" on public.tasks for update using (public.is_account_member(account_id)) with check (public.is_account_member(account_id));
create policy "tasks_member_delete" on public.tasks for delete using (public.is_account_member(account_id));

create policy "tags_member_select" on public.tags for select using (public.is_account_member(account_id));
create policy "tags_member_insert" on public.tags for insert with check (public.is_account_member(account_id));
create policy "tags_member_update" on public.tags for update using (public.is_account_member(account_id)) with check (public.is_account_member(account_id));
create policy "tags_member_delete" on public.tags for delete using (public.is_account_member(account_id));

create policy "venue_tags_member_select"
on public.venue_tags for select
using (
  exists (
    select 1
    from public.venues v
    where v.id = venue_id
      and public.is_account_member(v.account_id)
  )
);

create policy "venue_tags_member_insert"
on public.venue_tags for insert
with check (
  exists (
    select 1
    from public.venues v
    where v.id = venue_id
      and public.is_account_member(v.account_id)
  )
);

create policy "venue_tags_member_delete"
on public.venue_tags for delete
using (
  exists (
    select 1
    from public.venues v
    where v.id = venue_id
      and public.is_account_member(v.account_id)
  )
);
