CREATE TYPE "public"."split_bill_discount_mode" AS ENUM('none', 'fixed', 'percentage');--> statement-breakpoint
CREATE TYPE "public"."split_bill_payment_status" AS ENUM('unpaid', 'partially_paid', 'paid');--> statement-breakpoint
CREATE TYPE "public"."split_bill_status" AS ENUM('draft', 'finalized', 'archived');--> statement-breakpoint
CREATE TABLE "split_bill_assignment_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculation_id" uuid NOT NULL,
	"split_bill_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"source_assignment_id" uuid NOT NULL,
	"source_item_id" uuid NOT NULL,
	"source_participant_id" uuid NOT NULL,
	"item_amount" bigint NOT NULL,
	"item_tax_amount" bigint NOT NULL,
	"bill_tax_amount" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "split_bill_assignment_results_amounts_valid" CHECK ("split_bill_assignment_results"."item_amount" between 0 and 9007199254740991
        and "split_bill_assignment_results"."item_tax_amount" between 0 and 9007199254740991
        and "split_bill_assignment_results"."bill_tax_amount" between 0 and 9007199254740991)
);
--> statement-breakpoint
CREATE TABLE "split_bill_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"split_bill_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"item_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "split_bill_assignments_id_bill_user_uidx" UNIQUE("id","split_bill_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "split_bill_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"split_bill_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"calculation_version" smallint NOT NULL,
	"source_revision" integer NOT NULL,
	"merchant_name_snapshot" varchar(120) NOT NULL,
	"bill_date_snapshot" date NOT NULL,
	"note_snapshot" varchar(500),
	"discount_mode" "split_bill_discount_mode" NOT NULL,
	"fixed_discount_amount" bigint NOT NULL,
	"discount_bps" smallint NOT NULL,
	"bill_tax_bps" smallint NOT NULL,
	"service_charge_bps" smallint NOT NULL,
	"subtotal_amount" bigint NOT NULL,
	"discount_amount" bigint NOT NULL,
	"discounted_subtotal_amount" bigint NOT NULL,
	"item_tax_amount" bigint NOT NULL,
	"bill_tax_amount" bigint NOT NULL,
	"total_tax_amount" bigint NOT NULL,
	"service_charge_amount" bigint NOT NULL,
	"final_amount" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "split_bill_calculations_id_bill_user_uidx" UNIQUE("id","split_bill_id","user_id"),
	CONSTRAINT "split_bill_calculations_version_valid" CHECK ("split_bill_calculations"."calculation_version" > 0 and "split_bill_calculations"."source_revision" >= 0),
	CONSTRAINT "split_bill_calculations_snapshot_valid" CHECK (length(trim("split_bill_calculations"."merchant_name_snapshot")) between 1 and 120
        and ("split_bill_calculations"."note_snapshot" is null
          or length(trim("split_bill_calculations"."note_snapshot")) between 1 and 500)),
	CONSTRAINT "split_bill_calculations_percentages_valid" CHECK ("split_bill_calculations"."discount_bps" between 0 and 10000
        and "split_bill_calculations"."bill_tax_bps" between 0 and 10000
        and "split_bill_calculations"."service_charge_bps" between 0 and 10000),
	CONSTRAINT "split_bill_calculations_amounts_valid" CHECK ("split_bill_calculations"."fixed_discount_amount" between 0 and 9007199254740991
        and "split_bill_calculations"."subtotal_amount" between 0 and 9007199254740991
        and "split_bill_calculations"."discount_amount" between 0 and 9007199254740991
        and "split_bill_calculations"."discounted_subtotal_amount" between 0 and 9007199254740991
        and "split_bill_calculations"."item_tax_amount" between 0 and 9007199254740991
        and "split_bill_calculations"."bill_tax_amount" between 0 and 9007199254740991
        and "split_bill_calculations"."total_tax_amount" between 0 and 9007199254740991
        and "split_bill_calculations"."service_charge_amount" between 0 and 9007199254740991
        and "split_bill_calculations"."final_amount" between 0 and 9007199254740991),
	CONSTRAINT "split_bill_calculations_totals_valid" CHECK ("split_bill_calculations"."discounted_subtotal_amount" =
          "split_bill_calculations"."subtotal_amount" - "split_bill_calculations"."discount_amount"
        and "split_bill_calculations"."total_tax_amount" =
          "split_bill_calculations"."item_tax_amount" + "split_bill_calculations"."bill_tax_amount"
        and "split_bill_calculations"."final_amount" =
          "split_bill_calculations"."discounted_subtotal_amount" + "split_bill_calculations"."total_tax_amount"
          + "split_bill_calculations"."service_charge_amount")
);
--> statement-breakpoint
CREATE TABLE "split_bill_item_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculation_id" uuid NOT NULL,
	"split_bill_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"source_item_id" uuid NOT NULL,
	"name_snapshot" varchar(120) NOT NULL,
	"position_snapshot" integer NOT NULL,
	"quantity_snapshot" integer NOT NULL,
	"unit_price_snapshot" bigint NOT NULL,
	"item_tax_bps_snapshot" smallint NOT NULL,
	"subtotal_amount" bigint NOT NULL,
	"discount_amount" bigint NOT NULL,
	"discounted_amount" bigint NOT NULL,
	"item_tax_amount" bigint NOT NULL,
	"bill_tax_amount" bigint NOT NULL,
	"total_before_service_amount" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "split_bill_item_results_values_valid" CHECK ("split_bill_item_results"."position_snapshot" > 0
        and "split_bill_item_results"."quantity_snapshot" between 1 and 10000
        and "split_bill_item_results"."unit_price_snapshot" between 1 and 9007199254740991
        and "split_bill_item_results"."item_tax_bps_snapshot" between 0 and 10000
        and "split_bill_item_results"."subtotal_amount" between 0 and 9007199254740991
        and "split_bill_item_results"."discount_amount" between 0 and 9007199254740991
        and "split_bill_item_results"."discounted_amount" between 0 and 9007199254740991
        and "split_bill_item_results"."item_tax_amount" between 0 and 9007199254740991
        and "split_bill_item_results"."bill_tax_amount" between 0 and 9007199254740991
        and "split_bill_item_results"."total_before_service_amount" between 0 and 9007199254740991
        and "split_bill_item_results"."discounted_amount" =
          "split_bill_item_results"."subtotal_amount" - "split_bill_item_results"."discount_amount"
        and "split_bill_item_results"."total_before_service_amount" =
          "split_bill_item_results"."discounted_amount" + "split_bill_item_results"."item_tax_amount"
          + "split_bill_item_results"."bill_tax_amount"
        and ("split_bill_item_results"."item_tax_bps_snapshot" = 0 or "split_bill_item_results"."bill_tax_amount" = 0))
);
--> statement-breakpoint
CREATE TABLE "split_bill_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"split_bill_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(120) NOT NULL,
	"position" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" bigint NOT NULL,
	"item_tax_bps" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "split_bill_items_id_bill_user_uidx" UNIQUE("id","split_bill_id","user_id"),
	CONSTRAINT "split_bill_items_name_valid" CHECK (length(trim("split_bill_items"."name")) between 1 and 120),
	CONSTRAINT "split_bill_items_position_valid" CHECK ("split_bill_items"."position" > 0),
	CONSTRAINT "split_bill_items_quantity_valid" CHECK ("split_bill_items"."quantity" between 1 and 10000),
	CONSTRAINT "split_bill_items_unit_price_valid" CHECK ("split_bill_items"."unit_price" between 1 and 9007199254740991),
	CONSTRAINT "split_bill_items_tax_valid" CHECK ("split_bill_items"."item_tax_bps" between 0 and 10000)
);
--> statement-breakpoint
CREATE TABLE "split_bill_participant_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculation_id" uuid NOT NULL,
	"split_bill_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"source_participant_id" uuid NOT NULL,
	"name_snapshot" varchar(100) NOT NULL,
	"position_snapshot" integer NOT NULL,
	"item_amount" bigint NOT NULL,
	"item_tax_amount" bigint NOT NULL,
	"bill_tax_amount" bigint NOT NULL,
	"service_charge_amount" bigint NOT NULL,
	"final_amount" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "split_bill_participant_results_values_valid" CHECK ("split_bill_participant_results"."position_snapshot" > 0
        and "split_bill_participant_results"."item_amount" between 0 and 9007199254740991
        and "split_bill_participant_results"."item_tax_amount" between 0 and 9007199254740991
        and "split_bill_participant_results"."bill_tax_amount" between 0 and 9007199254740991
        and "split_bill_participant_results"."service_charge_amount" between 0 and 9007199254740991
        and "split_bill_participant_results"."final_amount" between 0 and 9007199254740991
        and "split_bill_participant_results"."final_amount" =
          "split_bill_participant_results"."item_amount" + "split_bill_participant_results"."item_tax_amount"
          + "split_bill_participant_results"."bill_tax_amount" + "split_bill_participant_results"."service_charge_amount")
);
--> statement-breakpoint
CREATE TABLE "split_bill_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"split_bill_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"position" integer NOT NULL,
	"payment_status" "split_bill_payment_status" DEFAULT 'unpaid' NOT NULL,
	"paid_amount" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "split_bill_participants_id_bill_user_uidx" UNIQUE("id","split_bill_id","user_id"),
	CONSTRAINT "split_bill_participants_name_valid" CHECK (length(trim("split_bill_participants"."name")) between 1 and 100),
	CONSTRAINT "split_bill_participants_position_valid" CHECK ("split_bill_participants"."position" > 0),
	CONSTRAINT "split_bill_participants_paid_amount_valid" CHECK ("split_bill_participants"."paid_amount" between 0 and 9007199254740991)
);
--> statement-breakpoint
CREATE TABLE "split_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"merchant_name" varchar(120) NOT NULL,
	"bill_date" date NOT NULL,
	"note" varchar(500),
	"status" "split_bill_status" DEFAULT 'draft' NOT NULL,
	"discount_mode" "split_bill_discount_mode" DEFAULT 'none' NOT NULL,
	"fixed_discount_amount" bigint DEFAULT 0 NOT NULL,
	"discount_bps" smallint DEFAULT 0 NOT NULL,
	"bill_tax_bps" smallint DEFAULT 0 NOT NULL,
	"service_charge_bps" smallint DEFAULT 0 NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"finalized_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "split_bills_id_user_id_uidx" UNIQUE("id","user_id"),
	CONSTRAINT "split_bills_merchant_valid" CHECK (length(trim("split_bills"."merchant_name")) between 1 and 120),
	CONSTRAINT "split_bills_note_valid" CHECK ("split_bills"."note" is null or length(trim("split_bills"."note")) between 1 and 500),
	CONSTRAINT "split_bills_fixed_discount_valid" CHECK ("split_bills"."fixed_discount_amount" between 0 and 9007199254740991),
	CONSTRAINT "split_bills_percentages_valid" CHECK ("split_bills"."discount_bps" between 0 and 10000
        and "split_bills"."bill_tax_bps" between 0 and 10000
        and "split_bills"."service_charge_bps" between 0 and 10000),
	CONSTRAINT "split_bills_discount_mode_valid" CHECK (("split_bills"."discount_mode" = 'none'
          and "split_bills"."fixed_discount_amount" = 0
          and "split_bills"."discount_bps" = 0)
        or ("split_bills"."discount_mode" = 'fixed'
          and "split_bills"."fixed_discount_amount" > 0
          and "split_bills"."discount_bps" = 0)
        or ("split_bills"."discount_mode" = 'percentage'
          and "split_bills"."fixed_discount_amount" = 0
          and "split_bills"."discount_bps" between 1 and 10000)),
	CONSTRAINT "split_bills_revision_valid" CHECK ("split_bills"."revision" >= 0),
	CONSTRAINT "split_bills_lifecycle_valid" CHECK (("split_bills"."status" = 'draft'
          and "split_bills"."finalized_at" is null
          and "split_bills"."archived_at" is null)
        or ("split_bills"."status" = 'finalized'
          and "split_bills"."finalized_at" is not null
          and "split_bills"."archived_at" is null)
        or ("split_bills"."status" = 'archived'
          and "split_bills"."finalized_at" is not null
          and "split_bills"."archived_at" is not null))
);
--> statement-breakpoint
ALTER TABLE "split_bill_assignment_results" ADD CONSTRAINT "split_bill_assignment_results_calculation_owner_fk" FOREIGN KEY ("calculation_id","split_bill_id","user_id") REFERENCES "public"."split_bill_calculations"("id","split_bill_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bill_assignment_results" ADD CONSTRAINT "split_bill_assignment_results_source_owner_fk" FOREIGN KEY ("source_assignment_id","split_bill_id","user_id") REFERENCES "public"."split_bill_assignments"("id","split_bill_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bill_assignments" ADD CONSTRAINT "split_bill_assignments_bill_owner_fk" FOREIGN KEY ("split_bill_id","user_id") REFERENCES "public"."split_bills"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bill_assignments" ADD CONSTRAINT "split_bill_assignments_item_owner_fk" FOREIGN KEY ("item_id","split_bill_id","user_id") REFERENCES "public"."split_bill_items"("id","split_bill_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bill_assignments" ADD CONSTRAINT "split_bill_assignments_participant_owner_fk" FOREIGN KEY ("participant_id","split_bill_id","user_id") REFERENCES "public"."split_bill_participants"("id","split_bill_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bill_calculations" ADD CONSTRAINT "split_bill_calculations_bill_owner_fk" FOREIGN KEY ("split_bill_id","user_id") REFERENCES "public"."split_bills"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bill_item_results" ADD CONSTRAINT "split_bill_item_results_calculation_owner_fk" FOREIGN KEY ("calculation_id","split_bill_id","user_id") REFERENCES "public"."split_bill_calculations"("id","split_bill_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bill_item_results" ADD CONSTRAINT "split_bill_item_results_source_owner_fk" FOREIGN KEY ("source_item_id","split_bill_id","user_id") REFERENCES "public"."split_bill_items"("id","split_bill_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bill_items" ADD CONSTRAINT "split_bill_items_bill_owner_fk" FOREIGN KEY ("split_bill_id","user_id") REFERENCES "public"."split_bills"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bill_participant_results" ADD CONSTRAINT "split_bill_participant_results_calculation_owner_fk" FOREIGN KEY ("calculation_id","split_bill_id","user_id") REFERENCES "public"."split_bill_calculations"("id","split_bill_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bill_participant_results" ADD CONSTRAINT "split_bill_participant_results_source_owner_fk" FOREIGN KEY ("source_participant_id","split_bill_id","user_id") REFERENCES "public"."split_bill_participants"("id","split_bill_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bill_participants" ADD CONSTRAINT "split_bill_participants_bill_owner_fk" FOREIGN KEY ("split_bill_id","user_id") REFERENCES "public"."split_bills"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_bills" ADD CONSTRAINT "split_bills_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "split_bill_assignment_results_source_uidx" ON "split_bill_assignment_results" USING btree ("source_assignment_id");--> statement-breakpoint
CREATE INDEX "split_bill_assignment_results_calculation_item_idx" ON "split_bill_assignment_results" USING btree ("calculation_id","source_item_id");--> statement-breakpoint
CREATE INDEX "split_bill_assignment_results_calculation_participant_idx" ON "split_bill_assignment_results" USING btree ("calculation_id","source_participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "split_bill_assignments_item_participant_uidx" ON "split_bill_assignments" USING btree ("item_id","participant_id");--> statement-breakpoint
CREATE INDEX "split_bill_assignments_user_bill_item_idx" ON "split_bill_assignments" USING btree ("user_id","split_bill_id","item_id");--> statement-breakpoint
CREATE INDEX "split_bill_assignments_user_bill_participant_idx" ON "split_bill_assignments" USING btree ("user_id","split_bill_id","participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "split_bill_calculations_bill_uidx" ON "split_bill_calculations" USING btree ("split_bill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "split_bill_item_results_calculation_item_uidx" ON "split_bill_item_results" USING btree ("calculation_id","source_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "split_bill_item_results_calculation_position_uidx" ON "split_bill_item_results" USING btree ("calculation_id","position_snapshot");--> statement-breakpoint
CREATE INDEX "split_bill_item_results_user_bill_idx" ON "split_bill_item_results" USING btree ("user_id","split_bill_id","position_snapshot");--> statement-breakpoint
CREATE UNIQUE INDEX "split_bill_items_bill_position_uidx" ON "split_bill_items" USING btree ("split_bill_id","position");--> statement-breakpoint
CREATE INDEX "split_bill_items_user_bill_position_idx" ON "split_bill_items" USING btree ("user_id","split_bill_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "split_bill_participant_results_source_uidx" ON "split_bill_participant_results" USING btree ("source_participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "split_bill_participant_results_calculation_position_uidx" ON "split_bill_participant_results" USING btree ("calculation_id","position_snapshot");--> statement-breakpoint
CREATE INDEX "split_bill_participant_results_user_bill_idx" ON "split_bill_participant_results" USING btree ("user_id","split_bill_id","position_snapshot");--> statement-breakpoint
CREATE UNIQUE INDEX "split_bill_participants_bill_position_uidx" ON "split_bill_participants" USING btree ("split_bill_id","position");--> statement-breakpoint
CREATE INDEX "split_bill_participants_user_bill_position_idx" ON "split_bill_participants" USING btree ("user_id","split_bill_id","position");--> statement-breakpoint
CREATE INDEX "split_bills_user_status_date_id_idx" ON "split_bills" USING btree ("user_id","status","bill_date" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "split_bills_user_date_id_idx" ON "split_bills" USING btree ("user_id","bill_date" DESC NULLS LAST,"id" DESC NULLS LAST);