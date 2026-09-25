export type DefaultCategoryDefinition = {
  name: string;
  type: "income" | "expense";
  systemKey: string;
};

export function normalizeSeedCategoryName(name: string) {
  return name.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US");
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food & Drinks", type: "expense", systemKey: "expense-food-and-drink" },
  { name: "Transportation", type: "expense", systemKey: "expense-transportation" },
  { name: "Shopping", type: "expense", systemKey: "expense-shopping" },
  { name: "Bills", type: "expense", systemKey: "expense-bills" },
  { name: "Housing", type: "expense", systemKey: "expense-housing" },
  { name: "Health", type: "expense", systemKey: "expense-health" },
  { name: "Education", type: "expense", systemKey: "expense-education" },
  { name: "Entertainment", type: "expense", systemKey: "expense-entertainment" },
  { name: "Family", type: "expense", systemKey: "expense-family" },
  { name: "Donations", type: "expense", systemKey: "expense-donation" },
  { name: "Travel", type: "expense", systemKey: "expense-travel" },
  { name: "Other", type: "expense", systemKey: "expense-other" },
] as const satisfies readonly DefaultCategoryDefinition[];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", type: "income", systemKey: "income-salary" },
  { name: "Bonus", type: "income", systemKey: "income-bonus" },
  { name: "Business", type: "income", systemKey: "income-business" },
  { name: "Freelance", type: "income", systemKey: "income-freelance" },
  { name: "Investment", type: "income", systemKey: "income-investment" },
  { name: "Gift", type: "income", systemKey: "income-gift" },
  { name: "Sales", type: "income", systemKey: "income-sales" },
  { name: "Other", type: "income", systemKey: "income-other" },
] as const satisfies readonly DefaultCategoryDefinition[];

export const DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
] as const;
