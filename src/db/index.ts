import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { requireEnv } from "@/lib/require-env";

const dbUrl = requireEnv(process.env.DATABASE_URL, "DATABASE_URL");

const globalForDb = globalThis as unknown as { conn?: postgres.Sql };

const conn = globalForDb.conn ?? postgres(dbUrl, { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema, casing: "snake_case" });
