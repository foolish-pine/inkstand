import { defineConfig, devices } from "@playwright/test";

const port = 3200;
const baseURL = `http://127.0.0.1:${port}`;

// E2E はローカルの Supabase（npx supabase start）を見る。本番のプロジェクトを
// 使うと、実行のたびにユーザーと記事が増え続ける。
//
// ここに書いてあるのはローカル Supabase の既定値だけで、実物の鍵ではない
// （.env.test をリポジトリで追跡しているのと同じ理由）。
//
// この env はサーバーのプロセスに直接渡る。Next.js は「既に process.env に
// ある値」を .env.local で上書きしないので、こちらが勝つ（実測で確認済み）。
const serverEnv = {
  DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH",
  APP_URL: baseURL,
  // 決済とメールは E2E の対象外。import した時点で requireEnv() が走るので、
  // 値が無いとページを開く前に落ちる。
  STRIPE_SECRET_KEY: "sk_test_dummy",
  STRIPE_WEBHOOK_SECRET: "whsec_dummy",
  RESEND_API_KEY: "re_dummy",
};

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./playwright.global-setup.ts",
  // テスト間に依存を作らないため、既定で並列に走らせる。
  fullyParallel: true,
  // .only の消し忘れを CI で落とす
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    // 失敗して再実行したときだけ記録する。成功時に残すとすぐ肥大化する。
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // dev ではなく本番ビルドを見る。cacheComponents があるので、キャッシュや
    // プリレンダリングの挙動は dev と本番で違う。
    command: `npm run build && npm run start -- --port ${port}`,
    url: baseURL,
    env: serverEnv,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
