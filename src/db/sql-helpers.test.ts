import { describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { conditionalSumSql } from "./sql-helpers";

function render(expression: ReturnType<typeof conditionalSumSql>) {
  return new PgDialect().sqlToQuery(expression).sql;
}

describe("conditionalSumSql", () => {
  it("builds the canonical income/expense sum expression", () => {
    const expression = conditionalSumSql(sql`amount`, sql`type = 'income'`);
    expect(render(expression)).toContain(
      "coalesce(sum(amount) filter (where type = 'income'), 0)::text",
    );
  });

  it("supports table-qualified column references", () => {
    const expression = conditionalSumSql(
      sql`owned_transaction.amount`,
      sql`owned_transaction.type = 'expense'`,
    );
    expect(render(expression)).toContain(
      "coalesce(sum(owned_transaction.amount) filter (where owned_transaction.type = 'expense'), 0)::text",
    );
  });

  it("supports extra filter clauses such as a date range", () => {
    const expression = conditionalSumSql(
      sql`amount`,
      sql`type = 'income' and transaction_at >= $start and transaction_at < $end`,
    );
    expect(render(expression)).toContain(
      "coalesce(sum(amount) filter (where type = 'income' and transaction_at >= $start and transaction_at < $end), 0)::text",
    );
  });
});