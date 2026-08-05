import "server-only";

import { sql } from "drizzle-orm";
import type { Database } from "@/db/types";

export async function updateOwnedParticipantPayment(
  database: Database,
  userId: string,
  input: {
    billId: string;
    participantId: string;
    status: "unpaid" | "partially_paid" | "paid";
    paidAmount: bigint;
  },
) {
  const result = await database.execute<{ id: string }>(sql`
    update split_bill_participants as participant
    set
      payment_status = ${input.status}::split_bill_payment_status,
      paid_amount = ${input.paidAmount}::bigint,
      updated_at = now()
    from split_bills as bill
    inner join split_bill_participant_results as result
      on result.split_bill_id = bill.id
      and result.user_id = bill.user_id
      and result.source_participant_id = ${input.participantId}::uuid
    where participant.id = ${input.participantId}::uuid
      and participant.split_bill_id = ${input.billId}::uuid
      and participant.user_id = ${userId}
      and bill.id = participant.split_bill_id
      and bill.user_id = participant.user_id
      and bill.status = 'finalized'
      and (
        (${input.status} = 'unpaid' and ${input.paidAmount}::bigint = 0)
        or (${input.status} = 'partially_paid'
          and ${input.paidAmount}::bigint > 0
          and ${input.paidAmount}::bigint < result.final_amount)
        or (${input.status} = 'paid'
          and ${input.paidAmount}::bigint = result.final_amount)
      )
    returning participant.id
  `);
  return result.rows[0] ?? null;
}
