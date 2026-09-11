-- Supabase Storage（images バケット）のアクセス制御。
--
-- このファイルは npm run db:migrate では適用されない。
-- storage.objects の持ち主は supabase_storage_admin で、アプリが DATABASE_URL で
-- つなぐ postgres ロールはそのメンバーではないため、CREATE POLICY が権限エラーになる。
-- （ローカルの Supabase では postgres が superuser なので通ってしまう。つまり
-- 「ローカルでは通るのに本番で落ちる」形の差になる。）
--
-- 適用は SQL Editor から手で行う。リポジトリのこのファイルが正本。
--   本番     : Supabase ダッシュボード → SQL Editor
--   ローカル : http://127.0.0.1:54323 → SQL Editor
--
-- 適用後の確認:
--   select policyname, cmd, roles, qual, with_check
--   from pg_policies where schemaname = 'storage' and tablename = 'objects';
--
-- 何度でも流せるように、先に drop している。
--
-- パスの形は {userId}/covers/{nanoid}.{jpg|png|webp}。
-- 3 本とも (storage.foldername(name))[1]（＝先頭のフォルダ名）が自分の ID である
-- ことを条件にしている。見ているのは owner ではなくパスなので、「他人のフォルダに
-- 自分名義で置く」ができない。
--
-- UPDATE のポリシーは無い。上書きせず、常に新しいパスへ置いて古いものを DELETE
-- する方針のため。UPDATE を使うようになったら using と with check の両方が要る。
--
-- 注意: images は公開バケットなので、public URL の読み取りはこの SELECT ポリシー
-- を通らない（CDN が直接返す）。ここが効くのは API 経由の読み取り（list など）。

drop policy if exists "authenticated users can upload to own folder" on storage.objects;
drop policy if exists "authenticated users can read own folder" on storage.objects;
drop policy if exists "authenticated users can delete in own folder" on storage.objects;

create policy "authenticated users can upload to own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'images'
  and (select auth.uid()::text) = (storage.foldername(name))[1]
);

create policy "authenticated users can read own folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'images'
  and (select auth.uid()::text) = (storage.foldername(name))[1]
);

create policy "authenticated users can delete in own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'images'
  and (select auth.uid()::text) = (storage.foldername(name))[1]
);
