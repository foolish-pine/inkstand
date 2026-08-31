import { defineConfig } from "drizzle-kit";

// ENV_FILE で接続先を切り替える。テスト用 DB へマイグレーションを流すときに使う。
const envFile = process.env.ENV_FILE ?? ".env.local";

process.loadEnvFile(envFile);

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(`DATABASE_URL is not defined in ${envFile}.`);
}

export default defineConfig({
  out: "./drizzle",
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: dbUrl,
  },
  schemaFilter: ["public"],
  casing: "snake_case",
});
