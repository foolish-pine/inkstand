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
| `test`      | Vitest 実行                                                 |

`lint` は検査だけを行います。自動修正したいときは `format` を使います。

## ディレクトリ構成

```
src/
  app/              # ルーティング（App Router）
  components/       # 共有コンポーネント
  db/               # Drizzle スキーマ・クライアント
  lib/
    supabase/       # Supabase クライアント（browser 用 / server 用）
    ...             # stripe / resend のクライアント初期化
  actions/          # Server Actions
  types/            # 型定義
public/             # 静的ファイル
```

単体テストは対象ファイルの隣に `*.test.ts` として置きます（コロケーション）。

## 技術スタック

| 種別             | 採用                                     | バージョン |
| ---------------- | ---------------------------------------- | ---------- |
| フレームワーク   | Next.js（App Router / Turbopack）        | 16.3.1     |
| UI               | React                                    | 19.2.8     |
| 言語             | TypeScript                               | 5.9.3      |
| スタイリング     | Tailwind CSS                             | 4.3.3      |
| DB / ORM         | Supabase Postgres + Drizzle ORM          | 未導入     |
| 認証             | Supabase Auth（`@supabase/ssr`）         | 未導入     |
| ストレージ       | Supabase Storage                         | 未導入     |
| 決済             | Stripe Checkout（テストモード）          | 未導入     |
| メール           | Resend                                   | 未導入     |
| Lint / Format    | ESLint + Prettier                        | 9.39.5 / 3.9.6 |
| 単体テスト       | Vitest + Testing Library                 | 4.1.11 / 16.3.2 |
| E2E              | Playwright                               | 未導入     |
| CI               | GitHub Actions                           | 未導入     |
| ホスティング     | Vercel                                   | 未導入     |

「未導入」のものは、対応する実装ステップに入った時点で追加します。

## エディタ設定

`.zed/settings.json` をコミットしてあります。保存時に Prettier で整形し、ESLint の安全な自動修正が当たります。Zed で開発する場合は、コマンドパレット（`zed: extensions`）から **Emmet** 拡張をインストールしてください。

`*.md` は `.prettierignore` で除外しています。日本語ドキュメントの表が崩れるのを防ぐためで、保存しても整形されないのが正しい挙動です。
