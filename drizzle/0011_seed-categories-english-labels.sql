-- Translate default category labels from Indonesian to English.
-- Stable system_key values are preserved; only the display name and its
-- normalized form change. Rows the user has already renamed (their name no
-- longer matches the original Indonesian label) are left untouched.
UPDATE categories
SET name = 'Food & Drinks',
    normalized_name = 'food & drinks',
    updated_at = now()
WHERE system_key = 'expense-food-and-drink'
  AND name = 'Makanan dan Minuman';
--> statement-breakpoint
UPDATE categories
SET name = 'Transportation',
    normalized_name = 'transportation',
    updated_at = now()
WHERE system_key = 'expense-transportation'
  AND name = 'Transportasi';
--> statement-breakpoint
UPDATE categories
SET name = 'Shopping',
    normalized_name = 'shopping',
    updated_at = now()
WHERE system_key = 'expense-shopping'
  AND name = 'Belanja';
--> statement-breakpoint
UPDATE categories
SET name = 'Bills',
    normalized_name = 'bills',
    updated_at = now()
WHERE system_key = 'expense-bills'
  AND name = 'Tagihan';
--> statement-breakpoint
UPDATE categories
SET name = 'Housing',
    normalized_name = 'housing',
    updated_at = now()
WHERE system_key = 'expense-housing'
  AND name = 'Tempat Tinggal';
--> statement-breakpoint
UPDATE categories
SET name = 'Health',
    normalized_name = 'health',
    updated_at = now()
WHERE system_key = 'expense-health'
  AND name = 'Kesehatan';
--> statement-breakpoint
UPDATE categories
SET name = 'Education',
    normalized_name = 'education',
    updated_at = now()
WHERE system_key = 'expense-education'
  AND name = 'Pendidikan';
--> statement-breakpoint
UPDATE categories
SET name = 'Entertainment',
    normalized_name = 'entertainment',
    updated_at = now()
WHERE system_key = 'expense-entertainment'
  AND name = 'Hiburan';
--> statement-breakpoint
UPDATE categories
SET name = 'Family',
    normalized_name = 'family',
    updated_at = now()
WHERE system_key = 'expense-family'
  AND name = 'Keluarga';
--> statement-breakpoint
UPDATE categories
SET name = 'Donations',
    normalized_name = 'donations',
    updated_at = now()
WHERE system_key = 'expense-donation'
  AND name = 'Donasi';
--> statement-breakpoint
UPDATE categories
SET name = 'Travel',
    normalized_name = 'travel',
    updated_at = now()
WHERE system_key = 'expense-travel'
  AND name = 'Perjalanan';
--> statement-breakpoint
UPDATE categories
SET name = 'Other',
    normalized_name = 'other',
    updated_at = now()
WHERE system_key = 'expense-other'
  AND name = 'Lainnya';
--> statement-breakpoint
UPDATE categories
SET name = 'Salary',
    normalized_name = 'salary',
    updated_at = now()
WHERE system_key = 'income-salary'
  AND name = 'Gaji';
--> statement-breakpoint
UPDATE categories
SET name = 'Bonus',
    normalized_name = 'bonus',
    updated_at = now()
WHERE system_key = 'income-bonus'
  AND name = 'Bonus';
--> statement-breakpoint
UPDATE categories
SET name = 'Business',
    normalized_name = 'business',
    updated_at = now()
WHERE system_key = 'income-business'
  AND name = 'Bisnis';
--> statement-breakpoint
UPDATE categories
SET name = 'Freelance',
    normalized_name = 'freelance',
    updated_at = now()
WHERE system_key = 'income-freelance'
  AND name = 'Freelance';
--> statement-breakpoint
UPDATE categories
SET name = 'Investment',
    normalized_name = 'investment',
    updated_at = now()
WHERE system_key = 'income-investment'
  AND name = 'Investasi';
--> statement-breakpoint
UPDATE categories
SET name = 'Gift',
    normalized_name = 'gift',
    updated_at = now()
WHERE system_key = 'income-gift'
  AND name = 'Hadiah';
--> statement-breakpoint
UPDATE categories
SET name = 'Sales',
    normalized_name = 'sales',
    updated_at = now()
WHERE system_key = 'income-sales'
  AND name = 'Penjualan';
--> statement-breakpoint
UPDATE categories
SET name = 'Other',
    normalized_name = 'other',
    updated_at = now()
WHERE system_key = 'income-other'
  AND name = 'Lainnya';