CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"account_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"type" "category_type" NOT NULL,
	"amount" bigint NOT NULL,
	"transaction_at" timestamp with time zone NOT NULL,
	"note" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "transactions_amount_positive" CHECK ("transactions"."amount" > 0),
	CONSTRAINT "transactions_amount_safe" CHECK ("transactions"."amount" <= 9007199254740991),
	CONSTRAINT "transactions_note_valid" CHECK ("transactions"."note" is null or length(trim("transactions"."note")) between 1 and 500)
);
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "normalized_name" varchar(80);--> statement-breakpoint
UPDATE "categories"
SET "normalized_name" = lower(regexp_replace(trim("name"), '\s+', ' ', 'g'));--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "normalized_name" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_id_user_id_uidx" ON "accounts" USING btree ("id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_type_normalized_name_active_uidx" ON "categories" USING btree ("user_id","type","normalized_name") WHERE "categories"."status" = 'active';--> statement-breakpoint
CREATE UNIQUE INDEX "categories_id_user_type_uidx" ON "categories" USING btree ("id","user_id","type");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_owner_fk" FOREIGN KEY ("account_id","user_id") REFERENCES "public"."accounts"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_owner_type_fk" FOREIGN KEY ("category_id","user_id","type") REFERENCES "public"."categories"("id","user_id","type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_user_occurred_id_active_idx" ON "transactions" USING btree ("user_id","transaction_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "transactions"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "transactions_user_type_occurred_active_idx" ON "transactions" USING btree ("user_id","type","transaction_at" DESC NULLS LAST) WHERE "transactions"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "transactions_user_category_occurred_active_idx" ON "transactions" USING btree ("user_id","category_id","transaction_at" DESC NULLS LAST) WHERE "transactions"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "transactions_user_account_occurred_active_idx" ON "transactions" USING btree ("user_id","account_id","transaction_at" DESC NULLS LAST) WHERE "transactions"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "transactions_user_amount_id_active_idx" ON "transactions" USING btree ("user_id","amount","id") WHERE "transactions"."deleted_at" is null;
