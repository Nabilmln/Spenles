import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";

export type AccountBalanceRow = {
  id: string;
  name: string;
  type: "cash" | "bank" | "e_wallet" | "other";
  status: "active" | "archived";
  systemKey: string | null;
  openingBalance: string;
  balance: string;
};

type RawAccountRow = {
  id: string;
  name: string;
  type: AccountBalanceRow["type"];
  status: AccountBalanceRow["status"];
  system_key: string | null;
  opening_balance: string;
  balance: string;
};

const balanceExpression = sql`
  (
    account.opening_balance
    + coalesce((
      select sum(case when transaction.type = 'income' then transaction.amount else -transaction.amount end)
      from transactions as transaction
      where transaction.user_id = account.user_id
        and transaction.account_id = account.id
        and transaction.deleted_at is null
    ), 0)
    + coalesce((
      select sum(transfer.amount)
      from transfers as transfer
      where transfer.user_id = account.user_id
        and transfer.destination_account_id = account.id
    ), 0)
    - coalesce((
      select sum(transfer.amount)
      from transfers as transfer
      where transfer.user_id = account.user_id
        and transfer.source_account_id = account.id
    ), 0)
  )
`;

function mapRow(row: RawAccountRow): AccountBalanceRow {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    systemKey: row.system_key,
    openingBalance: row.opening_balance,
    balance: row.balance,
  };
}

export async function listOwnedAccounts(
  userId: string,
  database: Database = db,
) {
  const result = await database.execute<RawAccountRow>(sql`
    select
      account.id,
      account.name,
      account.type,
      account.status,
      account.system_key,
      account.opening_balance::text,
      ${balanceExpression}::text as balance
    from accounts as account
    where account.user_id = ${userId}
    order by
      case when account.status = 'active' then 0 else 1 end,
      lower(account.name),
      account.id
  `);
  return result.rows.map(mapRow);
}

export async function getOwnedAccount(
  userId: string,
  accountId: string,
  database: Database = db,
) {
  const result = await database.execute<RawAccountRow>(sql`
    select
      account.id,
      account.name,
      account.type,
      account.status,
      account.system_key,
      account.opening_balance::text,
      ${balanceExpression}::text as balance
    from accounts as account
    where account.user_id = ${userId}
      and account.id = ${accountId}::uuid
    limit 1
  `);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function listActiveAccountOptions(
  userId: string,
  database: Database = db,
) {
  const result = await database.execute<{ id: string; name: string }>(sql`
    select id, name
    from accounts
    where user_id = ${userId}
      and status = 'active'
      and currency = 'IDR'
    order by lower(name), id
  `);
  return result.rows;
}

export async function getActiveAccountsTotal(
  userId: string,
  database: Database = db,
) {
  const result = await database.execute<{ total: string }>(sql`
    select coalesce(sum(${balanceExpression}), 0)::text as total
    from accounts as account
    where account.user_id = ${userId}
      and account.status = 'active'
  `);
  return BigInt(result.rows[0]?.total ?? "0");
}
