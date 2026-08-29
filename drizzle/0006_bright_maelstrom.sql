CREATE TYPE "public"."split_bill_tax_mode" AS ENUM('percentage', 'fixed');--> statement-breakpoint
ALTER TABLE "split_bill_calculations" ADD COLUMN "bill_tax_mode" "split_bill_tax_mode" DEFAULT 'percentage' NOT NULL;--> statement-breakpoint
ALTER TABLE "split_bill_calculations" ADD COLUMN "fixed_bill_tax_amount" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "split_bills" ADD COLUMN "bill_tax_mode" "split_bill_tax_mode" DEFAULT 'percentage' NOT NULL;--> statement-breakpoint
ALTER TABLE "split_bills" ADD COLUMN "fixed_bill_tax_amount" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "split_bill_calculations" ALTER COLUMN "bill_tax_mode" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "split_bill_calculations" ALTER COLUMN "fixed_bill_tax_amount" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "split_bill_calculations" ADD CONSTRAINT "split_bill_calculations_tax_mode_valid" CHECK (("split_bill_calculations"."bill_tax_mode" = 'percentage'
          and "split_bill_calculations"."fixed_bill_tax_amount" = 0)
        or ("split_bill_calculations"."bill_tax_mode" = 'fixed'
          and "split_bill_calculations"."bill_tax_bps" = 0));--> statement-breakpoint
ALTER TABLE "split_bills" ADD CONSTRAINT "split_bills_tax_mode_valid" CHECK (("split_bills"."bill_tax_mode" = 'percentage'
          and "split_bills"."fixed_bill_tax_amount" = 0)
        or ("split_bills"."bill_tax_mode" = 'fixed'
          and "split_bills"."bill_tax_bps" = 0));