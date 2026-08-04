CREATE TYPE "public"."account_type" AS ENUM('cash');--> statement-breakpoint
CREATE TYPE "public"."record_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."theme_preference" AS ENUM('system', 'light', 'dark');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(80) NOT NULL,
	"type" "account_type" DEFAULT 'cash' NOT NULL,
	"currency" varchar(3) DEFAULT 'IDR' NOT NULL,
	"opening_balance" bigint DEFAULT 0 NOT NULL,
	"status" "record_status" DEFAULT 'active' NOT NULL,
	"system_key" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_name_not_blank" CHECK (length(trim("accounts"."name")) > 0),
	CONSTRAINT "accounts_currency_idr" CHECK ("accounts"."currency" = 'IDR'),
	CONSTRAINT "accounts_opening_balance_non_negative" CHECK ("accounts"."opening_balance" >= 0)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(80) NOT NULL,
	"type" "category_type" NOT NULL,
	"icon" varchar(64),
	"color" varchar(32),
	"is_default" boolean DEFAULT false NOT NULL,
	"status" "record_status" DEFAULT 'active' NOT NULL,
	"system_key" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_not_blank" CHECK (length(trim("categories"."name")) > 0),
	CONSTRAINT "categories_default_has_system_key" CHECK (not "categories"."is_default" or "categories"."system_key" is not null)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"default_currency" varchar(3) DEFAULT 'IDR' NOT NULL,
	"timezone" varchar(64) DEFAULT 'Asia/Jakarta' NOT NULL,
	"theme" "theme_preference" DEFAULT 'system' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_display_name_not_blank" CHECK (length(trim("profiles"."display_name")) > 0),
	CONSTRAINT "profiles_currency_idr" CHECK ("profiles"."default_currency" = 'IDR')
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_user_status_idx" ON "accounts" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_user_system_key_uidx" ON "accounts" USING btree ("user_id","system_key") WHERE "accounts"."system_key" is not null;--> statement-breakpoint
CREATE INDEX "categories_user_id_idx" ON "categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "categories_user_type_idx" ON "categories" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "categories_user_status_idx" ON "categories" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_system_key_uidx" ON "categories" USING btree ("user_id","system_key") WHERE "categories"."system_key" is not null;