ALTER TABLE "articles" RENAME COLUMN "price_minor" TO "price";--> statement-breakpoint
ALTER TABLE "articles" DROP CONSTRAINT "price_non_negative";--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "price_non_negative" CHECK ("articles"."price" >= 0);