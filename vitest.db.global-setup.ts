import { execFileSync } from "node:child_process";

// テストを走らせる前に 1 度だけ、テスト用 DB へマイグレーションを流す。
// スキーマの持ち主は Drizzle なので、Supabase 側のマイグレーション機構は使わない。
export default function setup() {
  process.loadEnvFile(".env.test");

  execFileSync("npx", ["drizzle-kit", "migrate"], {
    env: { ...process.env, ENV_FILE: ".env.test" },
    stdio: "inherit",
  });
}
