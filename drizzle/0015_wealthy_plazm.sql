ALTER TABLE "profiles" ADD COLUMN "home_account_id" uuid;--> statement-breakpoint
UPDATE "profiles" AS profile
SET "home_account_id" = (
  SELECT account.id
  FROM "accounts" AS account
  WHERE account.user_id = profile.user_id
  ORDER BY CASE WHEN account.status = 'active' THEN 0 ELSE 1 END, account.created_at, account.id
  LIMIT 1
);
