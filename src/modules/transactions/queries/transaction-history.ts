import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";
import type { TransactionFilters } from "../schemas/transaction-filters";
import { dateInterval } from "./transaction-search";

export type TransactionHistoryRow = {
  id: string;
  type: "income" | "expense" | "transfer";
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
  type: "income" | "expense" | "transfer";
  amount: string;
  at: Date;
  note: string | null;
  category_name: string;
  category_id: string | null;
  category_icon: string | null;
  source_name: string | null;
  destination_name: string | null;
};

function intervalClause(filters: TransactionFilters) {
  const interval = dateInterval(filters);
  if (!interval) return "";
  return `t.transaction_at >= '${interval.start.toISOString()}' and t.transaction_at < '${interval.end.toISOString()}'`;
}

function transferAllowed(filters: TransactionFilters) {
  return !filters.type && !filters.category?.length && !filters.account;
}

function transferWhere(filters: TransactionFilters) {
  const parts: string[] = [];
  if (filters.q) {
    const literal = filters.q.replace(/[\\%_]/gu, "\\$&");
    parts.push(`r.note ilike '%${literal}%'`);
  }
  const interval = dateInterval(filters);
  if (interval) {
    parts.push(`r.transferred_at >= '${interval.start.toISOString()}'`);
    parts.push(`r.transferred_at < '${interval.end.toISOString()}'`);
  }
  return parts.length ? ` and ${parts.join(" and ")}` : "";
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

  const result = await database.execute<RawHistoryRow>(sql`
    select
      transaction_row.id,
      transaction_row.type,
      transaction_row.amount,
      transaction_row.at,
      transaction_row.note,
      transaction_row.category_name,
      transaction_row.category_id,
      transaction_row.category_icon,
      transaction_row.source_name,
      transaction_row.destination_name
    from (
      select
        t.id,
        t.type::text as type,
        t.amount::text as amount,
        t.transaction_at as at,
        t.note,
        c.name as category_name,
        c.id::text as category_id,
        c.icon::text as category_icon,
        null::text as source_name,
        null::text as destination_name
      from transactions t
      inner join categories c on c.id = t.category_id and c.user_id = ${userId}
      inner join accounts a on a.id = t.account_id and a.user_id = ${userId}
      where t.user_id = ${userId} and ${sql.raw(txWhere)}

      ${transferAllowed(filters) ? sql`
      union all

      select
        r.id,
        'transfer'::text as type,
        r.amount::text as amount,
        r.transferred_at as at,
        r.note,
        'Transfer' as category_name,
        null::text as category_id,
        null::text as category_icon,
        s.name as source_name,
        d.name as destination_name
      from transfers r
      inner join accounts s on s.id = r.source_account_id and s.user_id = ${userId}
      inner join accounts d on d.id = r.destination_account_id and d.user_id = ${userId}
      where r.user_id = ${userId}${sql.raw(transferWhere(filters))}
      ` : sql``}
    ) as transaction_row
    order by transaction_row.at desc, transaction_row.id desc
    limit ${pageSize}
    offset ${offset}
  `);

  const rows = result.rows.map((row) => ({
    id: row.id,
    type: row.type,
    amount: row.amount,
    transactionAt: new Date(row.at),
    note: row.note,
    categoryName: row.category_name,
    categoryId: row.category_id,
    categoryIcon: row.category_icon,
    sourceAccountName: row.source_name,
    destinationAccountName: row.destination_name,
  }));

  const [txCount, transferCount] = await Promise.all([
    database
      .execute<{ count: string }>(sql`
        select count(*)::text as count
        from transactions t
        inner join categories c on c.id = t.category_id and c.user_id = ${userId}
        where t.user_id = ${userId} and ${sql.raw(txWhere)}
      `),
    transferAllowed(filters)
      ? database
          .execute<{ count: string }>(sql`
            select count(*)::text as count
            from transfers r
            where r.user_id = ${userId}${sql.raw(transferWhere(filters))}
          `)
      : Promise.resolve({ rows: [] as { count: string }[] }),
  ]);

  const total = Number(txCount.rows[0]?.count ?? "0") + Number(transferCount.rows[0]?.count ?? "0");

  return {
    rows,
    total,
    totalPages: Math.ceil(total / pageSize),
    hasMore: total > page * pageSize,
  };
}
