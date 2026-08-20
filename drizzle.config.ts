import { defineConfig } from "drizzle-kit";

process.loadEnvFile(".env.local");

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined in .env.local file.");
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
