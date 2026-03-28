-- In-app notifications when others interact with your published cards (comments, votes, saves)

create table if not exists public.user_notifications (
  id uuid not null default gen_random_uuid (),
  recipient_id uuid not null references auth.users (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  card_id uuid not null references public.cards (id) on delete cascade,
  type text not null,
  comment_id uuid references public.published_card_comments (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz null,
  created_at timestamptz not null default now (),
  constraint user_notifications_type_check check (
    type in ('comment', 'upvote', 'downvote', 'favorite')
  )
);

create index if not exists user_notifications_recipient_created_idx
  on public.user_notifications (recipient_id, created_at desc);

create index if not exists user_notifications_recipient_unread_idx
  on public.user_notifications (recipient_id)
  where read_at is null;

alter table public.user_notifications enable row level security;

grant select, update on table public.user_notifications to authenticated;

drop policy if exists "Users read own notifications." on public.user_notifications;
create policy "Users read own notifications."
  on public.user_notifications for select
  using (auth.uid () = recipient_id);

drop policy if exists "Users update own notifications." on public.user_notifications;
create policy "Users update own notifications."
  on public.user_notifications for update
  using (auth.uid () = recipient_id);

-- No insert/delete for clients; rows created by triggers only

create or replace function public.notify_published_card_comment ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  card_title text;
begin
  select c.user_id, c.title into owner_id, card_title
  from public.cards c
  where c.id = new.card_id;

  if owner_id is null or owner_id = new.user_id then
    return new;
  end if;

  insert into public.user_notifications (
    recipient_id,
    actor_id,
    card_id,
    type,
    comment_id,
    metadata
  )
  values (
    owner_id,
    new.user_id,
    new.card_id,
    'comment',
    new.id,
    jsonb_build_object(
      'card_title',
      coalesce(nullif(trim(card_title), ''), 'Untitled')
    )
  );

  return new;
end;
$$;

create or replace function public.notify_published_card_reaction ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  card_title text;
  meta jsonb;
begin
  select c.user_id, c.title into owner_id, card_title
  from public.cards c
  where c.id = new.card_id;

  if owner_id is null or owner_id = new.user_id then
    return new;
  end if;

  meta := jsonb_build_object(
    'card_title',
    coalesce(nullif(trim(card_title), ''), 'Untitled')
  );

  if tg_op = 'INSERT' then
    if new.vote = 1 then
      insert into public.user_notifications (recipient_id, actor_id, card_id, type, metadata)
      values (owner_id, new.user_id, new.card_id, 'upvote', meta);
    end if;
    if new.vote = -1 then
      insert into public.user_notifications (recipient_id, actor_id, card_id, type, metadata)
      values (owner_id, new.user_id, new.card_id, 'downvote', meta);
    end if;
    if new.favorited then
      insert into public.user_notifications (recipient_id, actor_id, card_id, type, metadata)
      values (owner_id, new.user_id, new.card_id, 'favorite', meta);
    end if;
  elsif tg_op = 'UPDATE' then
    if (old.vote is distinct from 1) and new.vote = 1 then
      insert into public.user_notifications (recipient_id, actor_id, card_id, type, metadata)
      values (owner_id, new.user_id, new.card_id, 'upvote', meta);
    end if;
    if (old.vote is distinct from -1) and new.vote = -1 then
      insert into public.user_notifications (recipient_id, actor_id, card_id, type, metadata)
      values (owner_id, new.user_id, new.card_id, 'downvote', meta);
    end if;
    if (not old.favorited) and new.favorited then
      insert into public.user_notifications (recipient_id, actor_id, card_id, type, metadata)
      values (owner_id, new.user_id, new.card_id, 'favorite', meta);
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.notify_published_card_comment () from public;
revoke all on function public.notify_published_card_reaction () from public;

drop trigger if exists user_notifications_from_comment_trg on public.published_card_comments;
create trigger user_notifications_from_comment_trg
  after insert on public.published_card_comments
  for each row
  execute function public.notify_published_card_comment ();

drop trigger if exists user_notifications_from_reaction_trg on public.published_card_reactions;
create trigger user_notifications_from_reaction_trg
  after insert or update on public.published_card_reactions
  for each row
  execute function public.notify_published_card_reaction ();
