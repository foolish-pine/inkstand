# inkstand

誰でも記事を投稿でき、有料記事を単品購入できるプラットフォームです。Next.js（App Router）を実務と同レベルの構成で組み立てるための学習用プロジェクトです。

## 学習ターゲット

- Server Components / Client Components の使い分けと Server Actions
- Drizzle によるスキーマ設計・マイグレーション・クエリ
- Supabase Auth（`@supabase/ssr`）による認証と、アプリ層での認可
- Stripe（Checkout + Webhook）による決済と冪等性
- Supabase Storage による画像アップロードとアクセス制御
- Resend によるトランザクションメール
- Vitest / Playwright / GitHub Actions による品質担保
- Vercel への本番デプロイ

## 必要なもの

- Node.js 24.15.0（開発に使用しているバージョン）
- npm 11.12.1
- Docker（DB に接続するテストを走らせる場合のみ。ローカルの Supabase を起動するために使います）

外部サービスのアカウントは、必要になったステップで用意します。最初にすべてそろえる必要はありません。

| サービス | 用途                                        |
| -------- | ------------------------------------------- |
| Supabase | Postgres（Drizzle で直接接続）/ Auth / Storage |
| Stripe   | Checkout による単品購入（テストモード）     |
| Resend   | レシートメールの送信                        |
| GitHub   | リポジトリと CI                             |
| Vercel   | ホスティング                                |

## セットアップ

```bash
npm install
cp .env.example .env.local
```

`.env.local` に各サービスのキーを記入します。`.env.local` は git 管理外です（`.env.example` だけがコミットされます）。

```bash
npm run dev
```

http://localhost:3000 を開きます。

## npm scripts

| script      | 内容                                                        |
| ----------- | ----------------------------------------------------------- |
| `dev`       | 開発サーバー起動                                            |
| `build`     | 本番ビルド                                                  |
| `start`     | 本番ビルドの起動                                            |
| `lint`      | ESLint の検査 ＋ `prettier --check`（検査のみ。修正しない） |
| `format`    | `eslint --fix` ＋ `prettier --write`                        |
| `typecheck` | `tsc --noEmit`                                              |
| `test`      | 単体テスト（Vitest）。DB に接続しない                       |
| `test:db`   | DB に接続するテスト。ローカルの Supabase が必要             |
| `db:generate` | スキーマの差分からマイグレーションを生成                  |
| `db:migrate`  | `.env.local` の DB にマイグレーションを適用               |
| `db:migrate:test` | テスト用 DB にマイグレーションを適用                  |
| `db:studio` | Drizzle Studio で DB を閲覧                                 |

`lint` は検査だけを行います。自動修正したいときは `format` を使います。

## DB に接続するテスト

クエリが正しく絞り込んでいるか（他人の記事が混ざらない、下書きが公開一覧に出ない）は、
実際に DB へ入れて確かめないと検証できません。そのためのテストを `test` とは分けています。

```bash
npx supabase start   # 初回はイメージの取得で数分かかります
npm run test:db
npx supabase stop    # コンテナが常駐するので、使い終わったら止めます
```

- テストファイルは `*.db.test.ts` という名前にします。`npm run test` からは除外されます
- 各テストの前に `auth.users` を `TRUNCATE` するので、テスト間でデータは残りません
- スキーマの持ち主は Drizzle です。Supabase CLI は環境（Postgres / Auth / Storage）を提供するだけで、`supabase/migrations` は使いません
- 接続先は `.env.test` に書いてあります。ローカル Supabase の既定値しか含まないため、リポジトリで追跡しています

## Supabase Storage のポリシー

画像バケットのアクセス制御は `supabase/policies/storage.sql` に置いています。
**このファイルは `npm run db:migrate` では適用されません。**`storage.objects` の持ち主は
`supabase_storage_admin` で、アプリが `DATABASE_URL` でつなぐ `postgres` ロールは
そのメンバーではないため、`CREATE POLICY` が権限エラーになります。ローカルの Supabase では
`postgres` が superuser なので通ってしまい、**ローカルでは成功して本番だけ落ちる**差になります。

適用は SQL Editor から手で行います。ファイルは何度流しても同じ結果になります。

- 本番: Supabase ダッシュボード → SQL Editor
- ローカル: http://127.0.0.1:54323 → SQL Editor

適用できたかは次で確認します（3 行出ます）。

```sql
select policyname, cmd, roles, qual, with_check
from pg_policies where schemaname = 'storage' and tablename = 'objects';
```

バケットそのもの（`images` / 公開 / 10MB 上限 / MIME は jpeg・png・webp のみ）は
ダッシュボードで作成します。この設定はリポジトリには現れないので、環境を作り直すときは
ダッシュボードを確認してください。

## ディレクトリ構成

```
src/
  app/              # ルーティング（App Router）
  components/       # 共有コンポーネント
  db/               # Drizzle スキーマ・クライアント
  lib/
    dal/            # DB アクセス層。DB を触れるのはここだけ
    supabase/       # Supabase クライアント（browser 用 / server 用）
    ...             # stripe / resend のクライアント初期化
  actions/          # Server Actions
  test/             # テストの基盤（フィクスチャ・スタブ）
  types/            # 型定義
public/             # 静的ファイル
supabase/
  policies/         # Storage のポリシー（db:migrate では適用されない）
```

単体テストは対象ファイルの隣に `*.test.ts` として置きます（コロケーション）。

**`@/db` を import できるのは `src/lib/dal` の中だけです。**ページや Server Action から
DB を直接触ることは ESLint で禁止しています。DAL は「そこを通らないとデータに触れない」
境界があってはじめて、認可の置き場所として意味を持ちます。

## 技術スタック

| 種別             | 採用                                     | バージョン |
| ---------------- | ---------------------------------------- | ---------- |
| フレームワーク   | Next.js（App Router / Turbopack）        | 16.3.4     |
| UI               | React                                    | 19.2.8     |
| 言語             | TypeScript                               | 5.9.3      |
| スタイリング     | Tailwind CSS                             | 4.3.3      |
| DB / ORM         | Supabase Postgres + Drizzle ORM          | 0.45.2     |
| 認証             | Supabase Auth（`@supabase/ssr`）         | 0.12.4     |
| ストレージ       | Supabase Storage                         | 未導入     |
| 決済             | Stripe Checkout（テストモード）          | 22.6.1     |
| メール           | Resend                                   | 6.26.0     |
| 日付             | Day.js（`utc` / `timezone` プラグイン）  | 1.11.23    |
| Lint / Format    | ESLint + Prettier                        | 9.39.5 / 3.9.6 |
| 単体テスト       | Vitest + Testing Library                 | 4.1.11 / 16.3.2 |
| E2E              | Playwright                               | 未導入     |
| CI               | GitHub Actions                           | 未導入     |
| ホスティング     | Vercel                                   | 未導入     |

「未導入」のものは、対応する実装ステップに入った時点で追加します。

## エディタ設定

`.zed/settings.json` をコミットしてあります。保存時に Prettier で整形し、ESLint の安全な自動修正が当たります。Zed で開発する場合は、コマンドパレット（`zed: extensions`）から **Emmet** 拡張をインストールしてください。

`*.md` は `.prettierignore` で除外しています。日本語ドキュメントの表が崩れるのを防ぐためで、保存しても整形されないのが正しい挙動です。
