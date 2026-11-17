-- ==========================================================================
-- Prakruthi Aqua — homepage hero slides (image or video)
-- Run once in the Supabase SQL editor, after supabase/full-setup.sql.
-- Safe to re-run: every statement is idempotent and keeps admin edits.
--
-- What it does
--   0. Lets each homepage slide be an IMAGE banner or a VIDEO (admin's choice).
--      Every slide that is switched on shows in the hero, in display order.
--   1. Adds a desktop and a mobile video field to each homepage slide
--      (public.prakruthi_banners).
--   2. Creates the public `prakruthi-hero-videos` storage bucket with a
--      30 MB per-file limit (MP4, WebM or MOV). Anyone can watch the
--      videos; only approved store admins can upload, replace or delete.
--   3. Points the first two seeded slides at the bundled videos until you
--      upload your own from the admin panel.
-- ==========================================================================
begin;

-- 0. Image-or-video choice per slide. On first run, the two seeded slides become
--    video slides and the other three seeded slides are switched off; after that the
--    admin's choices are never overwritten.
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'prakruthi_banners' and column_name = 'mediaType') then
    alter table public.prakruthi_banners add column "mediaType" text not null default 'image';
    update public.prakruthi_banners set "mediaType" = 'video' where id in ('nutrition', 'plants');
    update public.prakruthi_banners set active = false where id in ('water', 'wellbeing', 'essentials');
  end if;
end $$;
alter table public.prakruthi_banners drop constraint if exists prakruthi_banners_media_type_valid;
alter table public.prakruthi_banners add constraint prakruthi_banners_media_type_valid check ("mediaType" in ('image', 'video'));

-- 1. Video fields on homepage slides (empty = use the bundled default video)
alter table public.prakruthi_banners add column if not exists "videoDesktop" text not null default '';
alter table public.prakruthi_banners add column if not exists "videoMobile" text not null default '';

-- Only local /videos/ paths or HTTPS URLs are accepted
alter table public.prakruthi_banners drop constraint if exists prakruthi_banners_video_desktop_safe;
alter table public.prakruthi_banners add constraint prakruthi_banners_video_desktop_safe
  check ("videoDesktop" = '' or "videoDesktop" ~ '^/videos/' or "videoDesktop" ~* '^https://');
alter table public.prakruthi_banners drop constraint if exists prakruthi_banners_video_mobile_safe;
alter table public.prakruthi_banners add constraint prakruthi_banners_video_mobile_safe
  check ("videoMobile" = '' or "videoMobile" ~ '^/videos/' or "videoMobile" ~* '^https://');

-- 2. Video storage: public to watch, 30 MB per file, admins only to change
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('prakruthi-hero-videos', 'prakruthi-hero-videos', true, 31457280, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Prakruthi Public hero videos" on storage.objects;
create policy "Prakruthi Public hero videos" on storage.objects
  for select using (bucket_id = 'prakruthi-hero-videos');
drop policy if exists "Prakruthi Admin hero video uploads" on storage.objects;
create policy "Prakruthi Admin hero video uploads" on storage.objects
  for insert to authenticated with check (bucket_id = 'prakruthi-hero-videos' and public.prakruthi_is_store_admin());
drop policy if exists "Prakruthi Admin hero video updates" on storage.objects;
create policy "Prakruthi Admin hero video updates" on storage.objects
  for update to authenticated using (bucket_id = 'prakruthi-hero-videos' and public.prakruthi_is_store_admin())
  with check (bucket_id = 'prakruthi-hero-videos' and public.prakruthi_is_store_admin());
drop policy if exists "Prakruthi Admin hero video deletes" on storage.objects;
create policy "Prakruthi Admin hero video deletes" on storage.objects
  for delete to authenticated using (bucket_id = 'prakruthi-hero-videos' and public.prakruthi_is_store_admin());

-- 3. Default videos for the two seeded slides (only fills empty fields)
update public.prakruthi_banners set "videoDesktop" = '/videos/hero-desktop.mp4' where id = 'nutrition' and "videoDesktop" = '';
update public.prakruthi_banners set "videoMobile"  = '/videos/hero-mobile.mp4'  where id = 'nutrition' and "videoMobile" = '';
update public.prakruthi_banners set "videoDesktop" = '/videos/hero-extra.mp4'   where id = 'plants'    and "videoDesktop" = '';
update public.prakruthi_banners set "videoMobile"  = '/videos/hero-extra.mp4'   where id = 'plants'    and "videoMobile" = '';

commit;
