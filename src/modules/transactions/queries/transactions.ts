import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";
import { conditionalSumSql } from "@/db/sql-helpers";
import { accounts, categories, transactions } from "@/db/schema";
import { getPeriodSavings } from "@/modules/accounts";
import { buildDailyCashFlowContract } from "@/modules/dashboard";
import { getDailyIncomeExpenseAggregates } from "@/modules/dashboard";
import { lastDaysJakartaInterval } from "@/modules/dashboard";
import type { TransactionFilters } from "../schemas/transaction-filters";
import { categoryJoin, conditions, dateInterval } from "./transaction-search";

export async function listTransactions(
  userId: string,
  filters: TransactionFilters,
  database: Database = db,
) {
  const where = and(...conditions(userId, filters));
  const primary = filters.sort === "amount" ? transactions.amount : transactions.transactionAt;
  const direction = filters.direction === "asc" ? asc : desc;
  const order = filters.sort === "amount"
    ? [direction(primary), desc(transactions.transactionAt), desc(transactions.id)]
    : [direction(primary), direction(transactions.id)];
  const [rows, totals] = await Promise.all([
    database
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
      .innerJoin(categories, categoryJoin(userId))
      .where(where)
      .orderBy(...order)
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize),
    database
      .select({ value: count() })
      .from(transactions)
      .innerJoin(categories, categoryJoin(userId))
      .where(where),
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

export async function getExpenseOverview(
  userId: string,
  days = 7,
  database: Database = db,
) {
  const interval = lastDaysJakartaInterval(days);
  const rows = await getDailyIncomeExpenseAggregates(userId, interval, database);
  const contract = buildDailyCashFlowContract(interval, rows);
  return {
    points: contract.points,
    totalIncome: contract.totalIncome,
    totalExpense: contract.totalExpense,
  };
}

export async function getTransactionOptions(
  userId: string,
  currentCategoryId?: string,
  database: Database = db,
) {
  const [ownedAccounts, ownedCategories] = await Promise.all([
    database.select({ id: accounts.id, name: accounts.name, type: accounts.type }).from(accounts).where(
      and(eq(accounts.userId, userId), eq(accounts.status, "active"), eq(accounts.currency, "IDR")),
    ).orderBy(asc(accounts.name)),
    database.select({ id: categories.id, name: categories.name, type: categories.type }).from(categories).where(
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
  database: Database = db,
) {
  const interval = dateInterval(filters);
  const [totals, savings] = await Promise.all([
    database
      .select({
        income: conditionalSumSql(
          sql`${transactions.amount}`,
          sql`${transactions.type} = 'income'`,
        ),
        expense: conditionalSumSql(
          sql`${transactions.amount}`,
          sql`${transactions.type} = 'expense'`,
        ),
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
      ? getPeriodSavings(userId, interval.start, interval.end, database)
      : Promise.resolve({ savedIn: 0n, savedOut: 0n, net: 0n }),
  ]);
  return {
    income: BigInt(totals[0]?.income ?? "0"),
    expense: BigInt(totals[0]?.expense ?? "0"),
    savings: savings.net,
  };
}
