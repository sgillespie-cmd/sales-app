create or replace function public.create_wedding_account(account_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_account_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(trim(account_name), '') = '' then
    raise exception 'Account name is required';
  end if;

  insert into public.wedding_accounts (name, created_by)
  values (trim(account_name), auth.uid())
  returning id into new_account_id;

  insert into public.account_members (account_id, user_id, role)
  values (new_account_id, auth.uid(), 'owner');

  insert into public.score_factors (account_id, key, label, description, active)
  values
    (new_account_id, 'location', 'Location', 'Convenience and travel practicality', true),
    (new_account_id, 'cost', 'Cost', 'Total expected cost and value', true),
    (new_account_id, 'aesthetic', 'Aesthetic', 'Style, look, and atmosphere', true),
    (new_account_id, 'lodging', 'Lodging', 'Nearby/on-site accommodations', true),
    (new_account_id, 'food', 'Food', 'Catering and meal quality/options', true),
    (new_account_id, 'flexibility', 'Flexibility', 'Contract and customization flexibility', true);

  insert into public.factor_weights (account_id, factor_id, weight)
  select new_account_id, sf.id, 1.0
  from public.score_factors sf
  where sf.account_id = new_account_id;

  return new_account_id;
end;
$$;

revoke all on function public.create_wedding_account(text) from public;
grant execute on function public.create_wedding_account(text) to authenticated;
