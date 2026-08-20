import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  integer,
  varchar,
  text,
  timestamp,
  pgSchema,
  uniqueIndex,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const authSchema = pgSchema("auth");

const authUsers = authSchema.table("users", {
  id: uuid().primaryKey(),
});

export const profiles = pgTable(
  "profiles",
  {
    id: uuid()
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    username: varchar({ length: 30 }).notNull(),
    displayName: varchar({ length: 50 }).notNull(),
    avatarPath: text(),
    bio: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("profiles_username_lower_idx").on(sql`lower(${t.username})`),
  ],
);

export const articleStatus = pgEnum("article_status", ["draft", "published"]);

export const articles = pgTable(
  "articles",
  {
    id: varchar({ length: 21 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    authorId: uuid()
      .notNull()
      .references(() => profiles.id),
    title: varchar({ length: 200 }).notNull(),
    body: text().notNull(),
    status: articleStatus().notNull().default("draft"),
    priceMinor: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    publishedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    check("price_non_negative", sql`${t.priceMinor} >= 0`),
    check(
      "published_requires_date",
      sql`${t.status} <> 'published' OR ${t.publishedAt} IS NOT NULL`,
    ),
  ],
);
