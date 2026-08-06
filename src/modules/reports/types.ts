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
  search?: string;
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

export type ReportAccount = {
  accountId: string;
  name: string;
  type: string;
  openingBalanceIdr: string;
  incomeIdr: string;
  expenseIdr: string;
  incomingTransfersIdr: string;
  outgoingTransfersIdr: string;
  closingBalanceIdr: string;
};

export type ReportBudget = {
  categoryName: string;
  amountIdr: string;
  usageIdr: string;
  remainingIdr: string;
  percentageBps: string;
  status: "safe" | "warning" | "exceeded";
};

export type FinancialReport = {
  displayName: string;
  generatedAt: Date;
  filters: ReportFilters;
  summary: ReportSummary;
  months: ReportMonth[];
  categories: ReportCategory[];
  accounts: ReportAccount[];
  budgets: ReportBudget[];
  transactions: ReportTransaction[];
  detailTruncated: boolean;
};
