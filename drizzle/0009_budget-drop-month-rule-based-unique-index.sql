ALTER TABLE "budgets" DROP CONSTRAINT "budgets_month_first_day";--> statement-breakpoint
DROP INDEX "budgets_user_category_month_active_uidx";--> statement-breakpoint
DROP INDEX "budgets_user_month_status_idx";--> statement-breakpoint
DROP INDEX "budgets_user_category_month_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "budgets_user_category_active_uidx" ON "budgets" USING btree ("user_id","category_id") WHERE "budgets"."status" = 'active';--> statement-breakpoint
CREATE INDEX "budgets_user_status_idx" ON "budgets" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "budgets_user_category_idx" ON "budgets" USING btree ("user_id","category_id");--> statement-breakpoint
CREATE INDEX "budgets_user_custom_period_idx" ON "budgets" USING btree ("user_id","period_start","period_end");--> statement-breakpoint
ALTER TABLE "budgets" DROP COLUMN "budget_month";