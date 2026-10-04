import "server-only";

import { sql } from "drizzle-orm";
import type { Database } from "@/db/types";
import type { AccountType } from "../constants/account-types";

export type AccountMutationInput = {
  name: string;
  type: AccountType;
  openingBalance: bigint;
};

type ReturnedId = { id: string };

export async function createOwnedAccount(
  database: Database,
  userId: string,
  input: AccountMutationInput,
) {
  const result = await database.execute<ReturnedId>(sql`
    insert into accounts (user_id, name, type, currency, opening_balance)
    select
      profile.user_id,
      ${input.name},
      ${input.type}::account_type,
      'IDR',
      ${input.openingBalance}::bigint
    from profiles as profile
    where profile.user_id = ${userId}
    returning id
  `);
  return result.rows[0] ?? null;
}

export async function updateOwnedAccount(
  database: Database,
  userId: string,
  accountId: string,
  input: AccountMutationInput,
) {
  const result = await database.execute<ReturnedId>(sql`
    update accounts as account
    set
      name = ${input.name},
      type = ${input.type}::account_type,
      opening_balance = ${input.openingBalance}::bigint,
      updated_at = now()
    where account.id = ${accountId}::uuid
      and account.user_id = ${userId}
      and (
        account.opening_balance = ${input.openingBalance}::bigint
        or (
          not exists (
            select 1 from transactions
            where transactions.user_id = ${userId}
              and transactions.account_id = account.id
          )
          and not exists (
            select 1 from transfers
            where transfers.user_id = ${userId}
              and (
                transfers.source_account_id = account.id
                or transfers.destination_account_id = account.id
              )
          )
        )
      )
    returning account.id
  `);
  return result.rows[0] ?? null;
}

export async function setOwnedHomeAccount(database: Database, userId: string, accountId: string) {
  const result = await database.execute<ReturnedId>(sql`
    update profiles as profile
    set home_account_id = account.id, updated_at = now()
    from accounts as account
    where profile.user_id = ${userId}
      and account.user_id = profile.user_id
      and account.id = ${accountId}::uuid
    returning account.id
  `);
  return result.rows[0] ?? null;
}

export async function deleteOwnedAccount(
  database: Database,
  userId: string,
  accountId: string,
) {
  const dependencyCount = await database.execute<{ count: string }>(sql`
    select (
      (
        select count(*)
        from transactions as transaction
        where transaction.user_id = ${userId}
          and transaction.account_id = ${accountId}::uuid
      )
      + (
        select count(*)
        from transfers as transfer
        where transfer.user_id = ${userId}
          and (
            transfer.source_account_id = ${accountId}::uuid
            or transfer.destination_account_id = ${accountId}::uuid
          )
      )
    )::text as count
  `);
  const count = BigInt(dependencyCount.rows[0]?.count ?? "0");
  if (count > 0n) {
    return { ok: false as const, reason: "has-history" as const };
  }

  const result = await database.execute<ReturnedId>(sql`
    delete from accounts
    where id = ${accountId}::uuid
      and user_id = ${userId}
    returning id
  `);
  if (result.rows[0]) {
    await database.execute(sql`
      update profiles
      set home_account_id = null, updated_at = now()
      where user_id = ${userId}
        and home_account_id = ${accountId}::uuid
    `);
  }
  return result.rows[0]
    ? { ok: true as const, id: result.rows[0].id }
    : { ok: false as const, reason: "not-found" as const };
}
