ALTER TABLE "friends" DROP CONSTRAINT "friends_avatar_index_range";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_avatar_index_range";--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_avatar_index_range" CHECK ("friends"."avatar_index" BETWEEN 1 AND 6);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_index_range" CHECK ("profiles"."avatar_index" between 1 and 6);