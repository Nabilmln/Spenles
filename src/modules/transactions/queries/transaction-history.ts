import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";
import type { TransactionFilters } from "../schemas/transaction-filters";
import { dateInterval } from "./transaction-search";

export type TransactionHistoryRow = {
  id: string;
  type: "income" | "expense";
  amount: string;
  transactionAt: Date;
  note: string | null;
  categoryName: string;
  categoryId: string | null;
  categoryIcon: string | null;
  sourceAccountName: string | null;
  destinationAccountName: string | null;
};

type RawHistoryRow = {
  id: string;
  type: "income" | "expense";
  amount: string;
  at: Date;
  note: string | null;
  category_name: string;
  category_id: string | null;
  category_icon: string | null;
};

function intervalClause(filters: TransactionFilters) {
  const interval = dateInterval(filters);
  if (!interval) return "";
  return `t.transaction_at >= '${interval.start.toISOString()}' and t.transaction_at < '${interval.end.toISOString()}'`;
}

export async function listTransactionHistory(
  userId: string,
  filters: TransactionFilters,
  database: Database = db,
) {
  const page = Math.max(filters.page, 1);
  const pageSize = filters.pageSize;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [
    "t.deleted_at is null",
  ];
  if (filters.type) conditions.push(`t.type = '${filters.type}'`);
  if (filters.category?.length) {
    const ids = filters.category.map((item) => `'${item}'`).join(", ");
    conditions.push(`t.category_id in (${ids})`);
  }
  if (filters.account) conditions.push(`t.account_id = '${filters.account}'`);
  if (filters.q) {
    const literal = filters.q.replace(/[\\%_]/gu, "\\$&");
    conditions.push(`(t.note ilike '%${literal}%' or c.name ilike '%${literal}%')`);
  }
  conditions.push(intervalClause(filters));
  const txWhere = conditions.filter(Boolean).join(" and ");

  const [result, txCount] = await Promise.all([
    database
      .execute<RawHistoryRow>(sql`
        select
          t.id,
          t.type::text as type,
          t.amount::text as amount,
          t.transaction_at as at,
          t.note,
          c.name as category_name,
          c.id::text as category_id,
          c.icon::text as category_icon
        from transactions t
        inner join categories c on c.id = t.category_id and c.user_id = ${userId}
        inner join accounts a on a.id = t.account_id and a.user_id = ${userId}
        where t.user_id = ${userId} and ${sql.raw(txWhere)}
        order by t.transaction_at desc, t.id desc
        limit ${pageSize}
        offset ${offset}
      `),
    database
      .execute<{ count: string }>(sql`
        select count(*)::text as count
        from transactions t
        inner join categories c on c.id = t.category_id and c.user_id = ${userId}
        where t.user_id = ${userId} and ${sql.raw(txWhere)}
      `),
  ]);

  const rows = result.rows.map((row) => ({
    id: row.id,
    type: row.type,
    amount: row.amount,
    transactionAt: new Date(row.at),
    note: row.note,
    categoryName: row.category_name,
    categoryId: row.category_id,
    categoryIcon: row.category_icon,
    sourceAccountName: null,
    destinationAccountName: null,
  }));

  const total = Number(txCount.rows[0]?.count ?? "0");

  return {
    rows,
    total,
    totalPages: Math.ceil(total / pageSize),
    hasMore: total > page * pageSize,
  };
}
