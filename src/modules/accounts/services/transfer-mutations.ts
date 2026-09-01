import "server-only";

import { sql } from "drizzle-orm";
import { hasPostgresErrorCode } from "@/db/errors";
import type { Database } from "@/db/types";

export type TransferMutationInput = {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: bigint;
  transferredAt: Date;
  note: string | null;
};

type ReturnedId = { id: string };

export async function createOwnedTransfer(
  database: Database,
  userId: string,
  input: TransferMutationInput,
) {
  const result = await database.execute<ReturnedId>(sql`
    insert into transfers (
      user_id,
      source_account_id,
      destination_account_id,
      amount,
      transferred_at,
      note
    )
    select
      ${userId},
      source.id,
      destination.id,
      ${input.amount}::bigint,
      ${input.transferredAt},
      ${input.note}
    from accounts as source
    cross join accounts as destination
    where source.id = ${input.sourceAccountId}::uuid
      and source.user_id = ${userId}
      and source.status = 'active'
      and source.currency = 'IDR'
      and destination.id = ${input.destinationAccountId}::uuid
      and destination.user_id = ${userId}
      and destination.status = 'active'
      and destination.currency = 'IDR'
      and source.id <> destination.id
    returning id
  `);
  return result.rows[0] ?? null;
}

export async function reverseOwnedTransfer(
  database: Database,
  userId: string,
  transferId: string,
) {
  try {
    const result = await database.execute<ReturnedId>(sql`
      insert into transfers (
        user_id,
        source_account_id,
        destination_account_id,
        amount,
        transferred_at,
        note,
        reversal_of_id
      )
      select
        original.user_id,
        original.destination_account_id,
        original.source_account_id,
        original.amount,
        now(),
        'Transfer reversal',
        original.id
      from transfers as original
      inner join accounts as source
        on source.id = original.destination_account_id
        and source.user_id = ${userId}
        and source.status = 'active'
        and source.currency = 'IDR'
      inner join accounts as destination
        on destination.id = original.source_account_id
        and destination.user_id = ${userId}
        and destination.status = 'active'
        and destination.currency = 'IDR'
      where original.id = ${transferId}::uuid
        and original.user_id = ${userId}
        and original.reversal_of_id is null
        and not exists (
          select 1 from transfers as existing_reversal
          where existing_reversal.reversal_of_id = original.id
        )
      returning id
    `);
    return result.rows[0]
      ? { ok: true as const, id: result.rows[0].id }
      : { ok: false as const, reason: "unavailable" as const };
  } catch (error) {
    if (hasPostgresErrorCode(error, "23505")) {
      return { ok: false as const, reason: "duplicate" as const };
    }
    throw error;
  }
}
