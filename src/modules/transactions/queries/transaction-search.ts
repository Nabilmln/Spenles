import {
  and,
  eq,
  gte,
  ilike,
  isNull,
  lt,
  or,
  type SQL,
} from "drizzle-orm";
import { categories, transactions } from "@/db/schema";
import { jakartaDateBoundary } from "@/lib/dates/jakarta";
import type { TransactionFilters } from "../schemas/transaction-filters";

export function searchCondition(q: string) {
  const literal = q.replace(/[\\%_]/gu, "\\$&");
  return or(
    ilike(transactions.note, `%${literal}%`),
    ilike(categories.name, `%${literal}%`),
  );
}

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

export function conditions(userId: string, filters: TransactionFilters) {
  const result: SQL[] = [eq(transactions.userId, userId), isNull(transactions.deletedAt)];
  if (filters.type) result.push(eq(transactions.type, filters.type));
  if (filters.category) result.push(eq(transactions.categoryId, filters.category));
  if (filters.account) result.push(eq(transactions.accountId, filters.account));
  if (filters.q) {
    const search = searchCondition(filters.q);
    if (search) result.push(search);
  }
  const interval = dateInterval(filters);
  if (interval) {
    result.push(gte(transactions.transactionAt, interval.start), lt(transactions.transactionAt, interval.end));
  }
  return result;
}

export const categoryJoin = (userId: string) =>
  and(eq(categories.id, transactions.categoryId), eq(categories.userId, userId));
