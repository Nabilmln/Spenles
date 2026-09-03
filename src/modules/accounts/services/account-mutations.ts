import "server-only";

import { sql } from "drizzle-orm";
import type { Database } from "@/db/types";

export type AccountMutationInput = {
  name: string;
  type: "cash" | "bank" | "e_wallet" | "savings" | "other";
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

export async function setOwnedAccountStatus(
  database: Database,
  userId: string,
  accountId: string,
  status: "active" | "archived",
) {
  if (status === "active") {
    const result = await database.execute<ReturnedId>(sql`
      update accounts
      set status = 'active', updated_at = now()
      where id = ${accountId}::uuid
        and user_id = ${userId}
      returning id
    `);
    return result.rows[0]
      ? { ok: true as const, id: result.rows[0].id }
      : { ok: false as const, reason: "not-found" as const };
  }

  const result = await database.execute<ReturnedId>(sql`
    with archived_account as (
      update accounts as account
      set status = 'archived', updated_at = now()
      where account.id = ${accountId}::uuid
        and account.user_id = ${userId}
        and account.status = 'active'
        and exists (
          select 1
          from accounts as alternative
          where alternative.user_id = ${userId}
            and alternative.status = 'active'
            and alternative.id <> account.id
        )
      returning account.id
    ),
    paused_rules as (
      update recurring_rules as rule
      set
        status = 'paused',
        pause_reason = 'blocked_account',
        last_failure_code = 'blocked_account',
        last_failure_at = now(),
        updated_at = now()
      from archived_account
      where rule.user_id = ${userId}
        and rule.account_id = archived_account.id
        and rule.status = 'active'
      returning rule.id
    )
    select id from archived_account
  `);
  return result.rows[0]
    ? { ok: true as const, id: result.rows[0].id }
    : { ok: false as const, reason: "last-active-or-not-found" as const };
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
      + (
        select count(*)
        from recurring_rules as rule
        where rule.user_id = ${userId}
          and rule.account_id = ${accountId}::uuid
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
  return result.rows[0]
    ? { ok: true as const, id: result.rows[0].id }
    : { ok: false as const, reason: "not-found" as const };
}
