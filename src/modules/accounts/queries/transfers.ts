import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";

export type TransferListRow = {
  id: string;
  sourceName: string;
  destinationName: string;
  amount: string;
  transferredAt: Date;
  note: string | null;
  reversalOfId: string | null;
  reversed: boolean;
};

type RawTransfer = {
  id: string;
  source_name: string;
  destination_name: string;
  amount: string;
  transferred_at: Date;
  note: string | null;
  reversal_of_id: string | null;
  reversed: boolean;
};

export async function listOwnedTransfers(
  userId: string,
  database: Database = db,
  limit = 50,
) {
  const result = await database.execute<RawTransfer>(sql`
    select
      transfer.id,
      source.name as source_name,
      destination.name as destination_name,
      transfer.amount::text,
      transfer.transferred_at,
      transfer.note,
      transfer.reversal_of_id,
      exists (
        select 1 from transfers as reversal
        where reversal.reversal_of_id = transfer.id
      ) as reversed
    from transfers as transfer
    inner join accounts as source
      on source.id = transfer.source_account_id
      and source.user_id = ${userId}
    inner join accounts as destination
      on destination.id = transfer.destination_account_id
      and destination.user_id = ${userId}
    where transfer.user_id = ${userId}
    order by transfer.transferred_at desc, transfer.id desc
    limit ${limit}
  `);
  return result.rows.map((row) => ({
    id: row.id,
    sourceName: row.source_name,
    destinationName: row.destination_name,
    amount: row.amount,
    transferredAt: row.transferred_at,
    note: row.note,
    reversalOfId: row.reversal_of_id,
    reversed: row.reversed,
  }));
}
