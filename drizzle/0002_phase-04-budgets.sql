CREATE TYPE "public"."recurring_frequency" AS ENUM('daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."recurring_pause_reason" AS ENUM('user', 'blocked_account', 'blocked_category', 'generation_failure');--> statement-breakpoint
CREATE TYPE "public"."recurring_status" AS ENUM('active', 'paused', 'archived');--> statement-breakpoint
ALTER TYPE "public"."account_type" ADD VALUE 'bank';--> statement-breakpoint
ALTER TYPE "public"."account_type" ADD VALUE 'e_wallet';--> statement-breakpoint
ALTER TYPE "public"."account_type" ADD VALUE 'other';--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"category_id" uuid NOT NULL,
	"budget_month" date NOT NULL,
	"amount" bigint NOT NULL,
	"warning_threshold_bps" smallint DEFAULT 8000 NOT NULL,
	"status" "record_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budgets_month_first_day" CHECK (extract(day from "budgets"."budget_month") = 1),
	CONSTRAINT "budgets_amount_positive" CHECK ("budgets"."amount" > 0),
	CONSTRAINT "budgets_amount_safe" CHECK ("budgets"."amount" <= 9007199254740991),
	CONSTRAINT "budgets_warning_threshold_valid" CHECK ("budgets"."warning_threshold_bps" between 100 and 10000)
);
--> statement-breakpoint
CREATE TABLE "recurring_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"recurring_rule_id" uuid NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"transaction_id" uuid NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "category_type" NOT NULL,
	"amount" bigint NOT NULL,
	"account_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"frequency" "recurring_frequency" NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_date" date,
	"next_occurrence_at" timestamp with time zone,
	"status" "recurring_status" DEFAULT 'active' NOT NULL,
	"pause_reason" "recurring_pause_reason",
	"note" varchar(500),
	"last_failure_code" varchar(64),
	"last_failure_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recurring_rules_amount_positive" CHECK ("recurring_rules"."amount" > 0),
	CONSTRAINT "recurring_rules_amount_safe" CHECK ("recurring_rules"."amount" <= 9007199254740991),
	CONSTRAINT "recurring_rules_note_valid" CHECK ("recurring_rules"."note" is null or length(trim("recurring_rules"."note")) between 1 and 500),
	CONSTRAINT "recurring_rules_pause_reason_valid" CHECK (("recurring_rules"."status" = 'paused' and "recurring_rules"."pause_reason" is not null)
        or ("recurring_rules"."status" <> 'paused' and "recurring_rules"."pause_reason" is null)),
	CONSTRAINT "recurring_rules_failure_state_valid" CHECK (("recurring_rules"."last_failure_code" is null) = ("recurring_rules"."last_failure_at" is null)),
	CONSTRAINT "recurring_rules_end_not_before_start" CHECK ("recurring_rules"."end_date" is null or "recurring_rules"."end_date" >=
        ("recurring_rules"."start_at" at time zone 'Asia/Jakarta')::date)
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"source_account_id" uuid NOT NULL,
	"destination_account_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"transferred_at" timestamp with time zone NOT NULL,
	"note" varchar(500),
	"reversal_of_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transfers_accounts_differ" CHECK ("transfers"."source_account_id" <> "transfers"."destination_account_id"),
	CONSTRAINT "transfers_amount_positive" CHECK ("transfers"."amount" > 0),
	CONSTRAINT "transfers_amount_safe" CHECK ("transfers"."amount" <= 9007199254740991),
	CONSTRAINT "transfers_note_valid" CHECK ("transfers"."note" is null or length(trim("transfers"."note")) between 1 and 500)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "categories_id_user_id_uidx" ON "categories" USING btree ("id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_id_user_id_uidx" ON "transactions" USING btree ("id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recurring_rules_id_user_id_uidx" ON "recurring_rules" USING btree ("id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transfers_id_user_id_uidx" ON "transfers" USING btree ("id","user_id");--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_owner_fk" FOREIGN KEY ("category_id","user_id") REFERENCES "public"."categories"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_generations" ADD CONSTRAINT "recurring_generations_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_generations" ADD CONSTRAINT "recurring_generations_rule_owner_fk" FOREIGN KEY ("recurring_rule_id","user_id") REFERENCES "public"."recurring_rules"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_generations" ADD CONSTRAINT "recurring_generations_transaction_owner_fk" FOREIGN KEY ("transaction_id","user_id") REFERENCES "public"."transactions"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_account_owner_fk" FOREIGN KEY ("account_id","user_id") REFERENCES "public"."accounts"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_category_owner_type_fk" FOREIGN KEY ("category_id","user_id","type") REFERENCES "public"."categories"("id","user_id","type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_source_account_owner_fk" FOREIGN KEY ("source_account_id","user_id") REFERENCES "public"."accounts"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_destination_account_owner_fk" FOREIGN KEY ("destination_account_id","user_id") REFERENCES "public"."accounts"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_reversal_owner_fk" FOREIGN KEY ("reversal_of_id","user_id") REFERENCES "public"."transfers"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "budgets_user_category_month_active_uidx" ON "budgets" USING btree ("user_id","category_id","budget_month") WHERE "budgets"."status" = 'active';--> statement-breakpoint
CREATE INDEX "budgets_user_month_status_idx" ON "budgets" USING btree ("user_id","budget_month" DESC NULLS LAST,"status");--> statement-breakpoint
CREATE INDEX "budgets_user_category_month_idx" ON "budgets" USING btree ("user_id","category_id","budget_month" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "recurring_generations_rule_scheduled_uidx" ON "recurring_generations" USING btree ("recurring_rule_id","scheduled_for");--> statement-breakpoint
CREATE UNIQUE INDEX "recurring_generations_transaction_uidx" ON "recurring_generations" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "recurring_generations_user_generated_idx" ON "recurring_generations" USING btree ("user_id","generated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "recurring_rules_user_status_next_idx" ON "recurring_rules" USING btree ("user_id","status","next_occurrence_at");--> statement-breakpoint
CREATE INDEX "recurring_rules_user_account_status_idx" ON "recurring_rules" USING btree ("user_id","account_id","status");--> statement-breakpoint
CREATE INDEX "recurring_rules_user_category_status_idx" ON "recurring_rules" USING btree ("user_id","category_id","status");--> statement-breakpoint
CREATE INDEX "recurring_rules_due_idx" ON "recurring_rules" USING btree ("next_occurrence_at","id") WHERE "recurring_rules"."status" = 'active' and "recurring_rules"."next_occurrence_at" is not null;--> statement-breakpoint
CREATE INDEX "transfers_user_transferred_id_idx" ON "transfers" USING btree ("user_id","transferred_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "transfers_user_source_transferred_idx" ON "transfers" USING btree ("user_id","source_account_id","transferred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "transfers_user_destination_transferred_idx" ON "transfers" USING btree ("user_id","destination_account_id","transferred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "transfers_reversal_of_uidx" ON "transfers" USING btree ("reversal_of_id") WHERE "transfers"."reversal_of_id" is not null;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_opening_balance_safe" CHECK ("accounts"."opening_balance" <= 9007199254740991);
