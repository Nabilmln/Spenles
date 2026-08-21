import { sql, type SQL } from "drizzle-orm";

/**
 * Builds the shared conditional-sum expression used for income and expense
 * totals. Yields `coalesce(sum(<amount>) filter (where <filter>), 0)::text`,
 * the canonical integer-rupiah aggregation across dashboard, reports, and
 * transactions. Consumers supply the amount/type column reference and any
 * extra filter (type, date range, etc.).
 */
export function conditionalSumSql(amount: SQL, filter: SQL) {
  return sql<string>`coalesce(sum(${amount}) filter (where ${filter}), 0)::text`;
}