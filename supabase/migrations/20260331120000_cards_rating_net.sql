-- Denormalized net score for explore leaderboards (up − down). Kept in sync when vote columns change.
alter table public.cards
  add column if not exists rating_net bigint generated always as (upvote_count - downvote_count) stored;

create index if not exists cards_published_rating_net_idx
  on public.cards (item_type, rating_net desc, upvote_count desc, published_at desc nulls last)
  where is_published = true;
