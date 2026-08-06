import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import { accounts, categories, transactions } from "@/db/schema";
import { jakartaDateBoundary } from "@/lib/dates/jakarta";
import { getPeriodSavings } from "@/modules/accounts";
import type { TransactionFilters } from "../schemas/transaction-filters";

function monthBounds(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const start = jakartaDateBoundary(`${month}-01`)!;
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const end = jakartaDateBoundary(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01`)!;
  return { start, end };
}

function dateInterval(filters: TransactionFilters) {
  if (filters.month) {
    return monthBounds(filters.month);
  }
  if (filters.from && filters.to) {
    const start = jakartaDateBoundary(filters.from)!;
    const end = new Date(jakartaDateBoundary(filters.to)!.getTime() + 86_400_000);
    return { start, end };
  }
  return null;
}

function conditions(userId: string, filters: TransactionFilters) {
  const result: SQL[] = [eq(transactions.userId, userId), isNull(transactions.deletedAt)];
  if (filters.type) result.push(eq(transactions.type, filters.type));
  if (filters.category) result.push(eq(transactions.categoryId, filters.category));
  if (filters.account) result.push(eq(transactions.accountId, filters.account));
  if (filters.q) {
    const literal = filters.q.replace(/[\\%_]/gu, "\\$&");
    result.push(ilike(transactions.note, `%${literal}%`));
  }
  const interval = dateInterval(filters);
  if (interval) {
    result.push(gte(transactions.transactionAt, interval.start), lt(transactions.transactionAt, interval.end));
  }
  return result;
}

export async function listTransactions(userId: string, filters: TransactionFilters) {
  const where = and(...conditions(userId, filters));
  const primary = filters.sort === "amount" ? transactions.amount : transactions.transactionAt;
  const direction = filters.direction === "asc" ? asc : desc;
  const order = filters.sort === "amount"
    ? [direction(primary), desc(transactions.transactionAt), desc(transactions.id)]
    : [direction(primary), direction(transactions.id)];
  const [rows, totals] = await Promise.all([
    db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        transactionAt: transactions.transactionAt,
        note: transactions.note,
        accountName: accounts.name,
        categoryName: categories.name,
      })
      .from(transactions)
      .innerJoin(accounts, and(eq(accounts.id, transactions.accountId), eq(accounts.userId, userId)))
      .innerJoin(categories, and(eq(categories.id, transactions.categoryId), eq(categories.userId, userId)))
      .where(where)
      .orderBy(...order)
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize),
    db.select({ value: count() }).from(transactions).where(where),
  ]);
  const total = totals[0]?.value ?? 0;
  return {
    rows: rows.map((row) => ({ ...row, amount: row.amount.toString() })),
    total,
    totalPages: Math.ceil(total / filters.pageSize),
  };
}

export async function getTransaction(userId: string, id: string) {
  const rows = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId), isNull(transactions.deletedAt)))
    .limit(1);
  return rows[0];
}

export async function getTransactionOptions(userId: string, currentCategoryId?: string) {
  const [ownedAccounts, ownedCategories] = await Promise.all([
    db.select({ id: accounts.id, name: accounts.name, type: accounts.type }).from(accounts).where(
      and(eq(accounts.userId, userId), eq(accounts.status, "active"), eq(accounts.currency, "IDR")),
    ).orderBy(asc(accounts.name)),
    db.select({ id: categories.id, name: categories.name, type: categories.type }).from(categories).where(
      and(
        eq(categories.userId, userId),
        currentCategoryId
          ? or(eq(categories.status, "active"), eq(categories.id, currentCategoryId))
          : eq(categories.status, "active"),
      ),
    ).orderBy(asc(categories.name)),
  ]);
  return { accounts: ownedAccounts, categories: ownedCategories };
}

export async function getTransactionSummary(
  userId: string,
  filters: TransactionFilters,
) {
  const interval = dateInterval(filters);
  const [totals, savings] = await Promise.all([
    db
      .select({
        income: sql<string>`coalesce(sum(${transactions.amount}) filter (where ${transactions.type} = 'income'), 0)::text`,
        expense: sql<string>`coalesce(sum(${transactions.amount}) filter (where ${transactions.type} = 'expense'), 0)::text`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt),
          interval
            ? and(
                gte(transactions.transactionAt, interval.start),
                lt(transactions.transactionAt, interval.end),
              )
            : undefined,
        ),
      ),
    interval
      ? getPeriodSavings(userId, interval.start, interval.end)
      : Promise.resolve({ savedIn: 0n, savedOut: 0n, net: 0n }),
  ]);
  return {
    income: BigInt(totals[0]?.income ?? "0"),
    expense: BigInt(totals[0]?.expense ?? "0"),
    savings: savings.net,
  };
}
