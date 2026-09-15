import { execFileSync } from "node:child_process";

// E2E を走らせる前に 1 度だけ、ローカル Supabase の DB へマイグレーションを流す。
// vitest.db.global-setup.ts と同じことをしている（接続先も同じ .env.test）。
export default function setup() {
  execFileSync("npx", ["drizzle-kit", "migrate"], {
    env: { ...process.env, ENV_FILE: ".env.test" },
    stdio: "inherit",
  });
}
