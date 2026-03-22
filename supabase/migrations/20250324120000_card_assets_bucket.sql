-- Public bucket for user-scoped card/statblock images (HTTPS URLs in cards.data JSON).
-- Path pattern: {auth.uid()}/{uuid}-{kind}.ext

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-assets',
  'card-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Policies (RLS on storage.objects is enabled by default in Supabase)

drop policy if exists "Public read card-assets" on storage.objects;
create policy "Public read card-assets"
on storage.objects for select
using (bucket_id = 'card-assets');

drop policy if exists "Users insert own folder card-assets" on storage.objects;
create policy "Users insert own folder card-assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'card-assets'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users update own objects card-assets" on storage.objects;
create policy "Users update own objects card-assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'card-assets'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'card-assets'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users delete own objects card-assets" on storage.objects;
create policy "Users delete own objects card-assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'card-assets'
  and split_part(name, '/', 1) = auth.uid()::text
);
