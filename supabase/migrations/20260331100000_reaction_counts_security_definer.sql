-- Reaction counter trigger must update cards rows owned by other users.
-- Without SECURITY DEFINER, RLS allows only the card owner to UPDATE cards,
-- so the trigger's UPDATE matched 0 rows (silent) and counts stayed at 0.

create or replace function public.published_card_reactions_count_apply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
  d_up bigint := 0;
  d_down bigint := 0;
  d_fav bigint := 0;
begin
  if tg_op = 'DELETE' then
    target := old.card_id;
    if old.vote = 1 then d_up := -1; elsif old.vote = -1 then d_down := -1; end if;
    if old.favorited then d_fav := -1; end if;
  elsif tg_op = 'UPDATE' then
    target := new.card_id;
    if old.vote = 1 then d_up := d_up - 1; elsif old.vote = -1 then d_down := d_down - 1; end if;
    if old.favorited then d_fav := d_fav - 1; end if;
    if new.vote = 1 then d_up := d_up + 1; elsif new.vote = -1 then d_down := d_down + 1; end if;
    if new.favorited then d_fav := d_fav + 1; end if;
  else
    target := new.card_id;
    if new.vote = 1 then d_up := 1; elsif new.vote = -1 then d_down := 1; end if;
    if new.favorited then d_fav := 1; end if;
  end if;

  update public.cards
  set
    upvote_count = greatest(0::bigint, upvote_count + d_up),
    downvote_count = greatest(0::bigint, downvote_count + d_down),
    favorite_count = greatest(0::bigint, favorite_count + d_fav)
  where id = target;

  return coalesce(new, old);
end;
$$;

revoke all on function public.published_card_reactions_count_apply() from public;

-- Backfill denormalized counts from reaction rows (fixes rows written while trigger hit RLS).
update public.cards c
set
  upvote_count = coalesce(sub.up, 0),
  downvote_count = coalesce(sub.down, 0),
  favorite_count = coalesce(sub.fav, 0)
from (
  select
    card_id,
    count(*) filter (where vote = 1)::bigint as up,
    count(*) filter (where vote = -1)::bigint as down,
    count(*) filter (where favorited)::bigint as fav
  from public.published_card_reactions
  group by card_id
) sub
where c.id = sub.card_id;
