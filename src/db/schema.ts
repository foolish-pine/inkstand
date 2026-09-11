import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
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
      .$onUpdate(() => sql`NOW()`),
  },
  (t) => [
    uniqueIndex("profiles_username_lower_idx").on(sql`lower(${t.username})`),
  ],
);

export const articleStatus = pgEnum("article_status", ["draft", "published"]);
export const ARTICLE_TITLE_MAX_LENGTH = 200;
export const PAID_ARTICLE_BODY_MIN_LENGTH = 1000;

export const articles = pgTable(
  "articles",
  {
    id: varchar({ length: 21 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    authorId: uuid()
      .notNull()
      .references(() => profiles.id),
    title: varchar({ length: ARTICLE_TITLE_MAX_LENGTH }).notNull(),
    body: text().notNull(),
    coverImagePath: text(),
    status: articleStatus().notNull().default("draft"),
    price: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`NOW()`),
    publishedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    check("price_non_negative", sql`${t.price} >= 0`),
    check(
      "published_requires_date",
      sql`${t.status} <> 'published' OR ${t.publishedAt} IS NOT NULL`,
    ),
    check(
      "paid_body_min_length",
      sql`${t.price} = 0 OR char_length(${t.body}) >= ${sql.raw(String(PAID_ARTICLE_BODY_MIN_LENGTH))}`,
    ),
    check(
      "cover_image_in_author_folder",
      sql`split_part(${t.coverImagePath}, '/', 1) = ${t.authorId}::text`,
    ),
  ],
);

export const purchases = pgTable(
  "purchases",
  {
    id: uuid().primaryKey().defaultRandom(),
    buyerId: uuid()
      .notNull()
      .references(() => profiles.id),
    articleId: varchar({ length: 21 })
      .notNull()
      .references(() => articles.id),
    paymentAmount: integer().notNull(),
    stripePaymentIntentId: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("payment_amount_positive", sql`${t.paymentAmount} > 0`),
    unique("purchases_buyer_id_and_article_id_unique").on(
      t.buyerId,
      t.articleId,
    ),
  ],
);
