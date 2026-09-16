CREATE TYPE "public"."budget_period_type" AS ENUM('monthly', 'weekly', 'custom');--> statement-breakpoint
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_warning_threshold_valid";--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "warning_threshold_bps" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "warning_threshold_bps" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "period_type" "budget_period_type" DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "period_start" date;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "period_end" date;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "warning_days_remaining" smallint;--> statement-breakpoint
-- Existing budgets are per-month rows. The new model allows only one active
-- budget per category, so archive duplicate active budgets per category while
-- keeping the most recent month (existing rows become monthly recurring rules).
UPDATE "budgets" AS "b"
SET "status" = 'archived', "updated_at" = now()
WHERE "b"."status" = 'active'
  AND "b"."id" <> (
    SELECT "b2"."id"
    FROM "budgets" AS "b2"
    WHERE "b2"."user_id" = "b"."user_id"
      AND "b2"."category_id" = "b"."category_id"
      AND "b2"."status" = 'active'
    ORDER BY "b2"."budget_month" DESC, "b2"."created_at" DESC, "b2"."id" DESC
    LIMIT 1
  );--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_warning_mode_exclusive" CHECK (("budgets"."warning_threshold_bps" is not null) <> ("budgets"."warning_days_remaining" is not null));--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_warning_days_valid" CHECK ("budgets"."warning_days_remaining" is null or "budgets"."warning_days_remaining" in (1, 3, 5));--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_period_dates_valid" CHECK ((
        "budgets"."period_type" = 'custom'
        and "budgets"."period_start" is not null
        and "budgets"."period_end" is not null
        and "budgets"."period_end" >= "budgets"."period_start"
      ) or (
        "budgets"."period_type" <> 'custom'
        and "budgets"."period_start" is null
        and "budgets"."period_end" is null
      ));--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_warning_threshold_valid" CHECK ("budgets"."warning_threshold_bps" is null or "budgets"."warning_threshold_bps" between 100 and 10000);