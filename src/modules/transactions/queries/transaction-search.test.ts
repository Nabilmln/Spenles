import { and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { describe, expect, it } from "vitest";
import { transactions } from "@/db/schema";
import type { TransactionFilters } from "../schemas/transaction-filters";
import { conditions } from "./transaction-search";

const baseFilters: TransactionFilters = {
  q: "",
  type: undefined,
  category: undefined,
  account: undefined,
  month: undefined,
  from: undefined,
  to: undefined,
  sort: "transactionAt",
  direction: "desc",
  page: 1,
  pageSize: 20,
};

function buildSql(filters: TransactionFilters) {
  const database = drizzle("postgresql://test:test@test.example/test?sslmode=require");
  return database
    .select()
    .from(transactions)
    .where(and(...conditions("user-123", filters)))
    .toSQL();
}

describe("transaction search SQL", () => {
  it("matches the transaction note by description", () => {
    const sql = buildSql({ ...baseFilters, q: "abc123" });

    expect(sql.sql).toContain('"transactions"."note" ilike');
    expect(sql.params).toContain("%abc123%");
  });

  it("also matches the category name", () => {
    const sql = buildSql({ ...baseFilters, q: "makan" });

    expect(sql.sql).toContain('"categories"."name" ilike');
    expect(sql.params).toContain("%makan%");
  });

  it("escapes wildcard characters instead of building raw SQL", () => {
    const sql = buildSql({ ...baseFilters, q: "50%" });

    expect(sql.params).toContain("%50\\%%");
    expect(sql.params).not.toContain("%50%");
    expect(sql.sql).not.toContain("50%");
  });

  it("scopes every search to the authenticated user and active rows", () => {
    const sql = buildSql({ ...baseFilters, q: "abc123" });

    expect(sql.sql).toContain('"transactions"."user_id" = ');
    expect(sql.sql).toContain('"transactions"."deleted_at" is null');
    expect(sql.sql).not.toContain("abc123");
  });

  it("combines a date range with the search term", () => {
    const sql = buildSql({
      ...baseFilters,
      q: "kafe",
      from: "2026-08-01",
      to: "2026-08-31",
    });

    expect(sql.params).toContain("%kafe%");
    expect(sql.sql).toContain('"transactions"."transaction_at" >=');
    expect(sql.sql).toContain('"transactions"."transaction_at" <');
  });

  it("builds one OR expression covering description and category", () => {
    const sql = buildSql({ ...baseFilters, q: "kopi" });

    expect(sql.sql).toContain('"transactions"."note" ilike');
    expect(sql.sql).toContain('or "categories"."name" ilike');
    expect(sql.params).toContain("%kopi%");
  });
});
