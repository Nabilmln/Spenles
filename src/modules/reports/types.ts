export type ReportPeriodKind = "month" | "year" | "custom";
export type TransactionType = "income" | "expense";

export type ReportInterval = {
  kind: ReportPeriodKind;
  label: string;
  filePart: string;
  startDate: string;
  endDate: string;
  start: Date;
  end: Date;
};

export type ExportFilters = {
  interval: ReportInterval;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
};

export type ReportFilters = ExportFilters & {
  includeDetails: boolean;
};

export type ReportTransaction = {
  id: string;
  type: TransactionType;
  amountIdr: string;
  transactionAt: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  accountName: string;
  categoryName: string;
};

export type ReportSummary = {
  incomeIdr: string;
  expenseIdr: string;
  netIdr: string;
};

export type ReportMonth = {
  month: string;
  incomeIdr: string;
  expenseIdr: string;
};

export type ReportCategory = {
  categoryId: string;
  name: string;
  amountIdr: string;
};

export type ReportInsight = {
  averageDailyExpenseIdr: string;
  inclusiveDays: number;
};

export type FinancialReport = {
  displayName: string;
  generatedAt: Date;
  filters: ReportFilters;
  summary: ReportSummary;
  categories: ReportCategory[];
  transactions: ReportTransaction[];
  transactionCount: number;
};
