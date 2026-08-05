import "server-only";

import { sql } from "drizzle-orm";
import type { Database } from "@/db/types";

export type TransactionMutationInput = {
  type: "income" | "expense";
  amount: bigint;
  accountId: string;
  categoryId: string;
  transactionAt: Date;
  note: string | null;
};

type ReturnedId = { id: string };

export async function createOwnedTransaction(
  database: Database,
  userId: string,
  input: TransactionMutationInput,
) {
  const result = await database.execute<ReturnedId>(sql`
    insert into transactions (
      user_id,
      account_id,
      category_id,
      type,
      amount,
      transaction_at,
      note
    )
    select
      ${userId},
      owned_account.id,
      owned_category.id,
      ${input.type}::category_type,
      ${input.amount}::bigint,
      ${input.transactionAt},
      ${input.note}
    from accounts as owned_account
    cross join categories as owned_category
    where owned_account.id = ${input.accountId}::uuid
      and owned_account.user_id = ${userId}
      and owned_account.status = 'active'
      and owned_account.currency = 'IDR'
      and owned_category.id = ${input.categoryId}::uuid
      and owned_category.user_id = ${userId}
      and owned_category.status = 'active'
      and owned_category.type = ${input.type}::category_type
    returning id
  `);

  return result.rows[0] ?? null;
}

export async function updateOwnedTransaction(
  database: Database,
  userId: string,
  transactionId: string,
  input: TransactionMutationInput,
) {
  const result = await database.execute<ReturnedId>(sql`
    update transactions as owned_transaction
    set
      account_id = ${input.accountId}::uuid,
      category_id = ${input.categoryId}::uuid,
      type = ${input.type}::category_type,
      amount = ${input.amount}::bigint,
      transaction_at = ${input.transactionAt},
      note = ${input.note},
      updated_at = now()
    where owned_transaction.id = ${transactionId}::uuid
      and owned_transaction.user_id = ${userId}
      and owned_transaction.deleted_at is null
      and exists (
        select 1
        from accounts as owned_account
        where owned_account.id = ${input.accountId}::uuid
          and owned_account.user_id = ${userId}
          and owned_account.status = 'active'
          and owned_account.currency = 'IDR'
      )
      and exists (
        select 1
        from categories as owned_category
        where owned_category.id = ${input.categoryId}::uuid
          and owned_category.user_id = ${userId}
          and owned_category.type = ${input.type}::category_type
          and (
            owned_category.status = 'active'
            or owned_category.id = owned_transaction.category_id
          )
      )
    returning owned_transaction.id
  `);

  return result.rows[0] ?? null;
}

export async function softDeleteOwnedTransaction(
  database: Database,
  userId: string,
  transactionId: string,
) {
  const result = await database.execute<ReturnedId>(sql`
    update transactions as owned_transaction
    set deleted_at = now(), updated_at = now()
    where owned_transaction.id = ${transactionId}::uuid
      and owned_transaction.user_id = ${userId}
      and owned_transaction.deleted_at is null
    returning owned_transaction.id
  `);

  return result.rows[0] ?? null;
}
