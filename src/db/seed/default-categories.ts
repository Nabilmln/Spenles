export type DefaultCategoryDefinition = {
  name: string;
  type: "income" | "expense";
  systemKey: string;
};

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Makanan dan Minuman", type: "expense", systemKey: "expense-food-and-drink" },
  { name: "Transportasi", type: "expense", systemKey: "expense-transportation" },
  { name: "Belanja", type: "expense", systemKey: "expense-shopping" },
  { name: "Tagihan", type: "expense", systemKey: "expense-bills" },
  { name: "Tempat Tinggal", type: "expense", systemKey: "expense-housing" },
  { name: "Kesehatan", type: "expense", systemKey: "expense-health" },
  { name: "Pendidikan", type: "expense", systemKey: "expense-education" },
  { name: "Hiburan", type: "expense", systemKey: "expense-entertainment" },
  { name: "Keluarga", type: "expense", systemKey: "expense-family" },
  { name: "Donasi", type: "expense", systemKey: "expense-donation" },
  { name: "Perjalanan", type: "expense", systemKey: "expense-travel" },
  { name: "Lainnya", type: "expense", systemKey: "expense-other" },
] as const satisfies readonly DefaultCategoryDefinition[];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Gaji", type: "income", systemKey: "income-salary" },
  { name: "Bonus", type: "income", systemKey: "income-bonus" },
  { name: "Bisnis", type: "income", systemKey: "income-business" },
  { name: "Freelance", type: "income", systemKey: "income-freelance" },
  { name: "Investasi", type: "income", systemKey: "income-investment" },
  { name: "Hadiah", type: "income", systemKey: "income-gift" },
  { name: "Penjualan", type: "income", systemKey: "income-sales" },
  { name: "Lainnya", type: "income", systemKey: "income-other" },
] as const satisfies readonly DefaultCategoryDefinition[];

export const DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
] as const;
