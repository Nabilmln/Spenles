ALTER TABLE "friends" ADD COLUMN "avatar_index" smallint;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_avatar_index_range" CHECK ("friends"."avatar_index" BETWEEN 1 AND 5);