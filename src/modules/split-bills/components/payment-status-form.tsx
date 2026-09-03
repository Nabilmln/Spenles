"use client";

import { useState } from "react";
import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { Select } from "@/components/ui/select";
import { fieldClass } from "@/components/ui/styles";
import {
  updateParticipantPaymentAction,
  type SplitBillActionState,
} from "../actions/split-bill-actions";

export function PaymentStatusForm({
  billId,
  participantId,
  obligation,
  initialStatus,
  initialPaidAmount,
}: {
  billId: string;
  participantId: string;
  obligation: string;
  initialStatus: "unpaid" | "partially_paid" | "paid";
  initialPaidAmount: string;
}) {
  const [, action, pending] = useToastActionState<
    SplitBillActionState,
    FormData
  >(updateParticipantPaymentAction, {});
  const [status, setStatus] = useState(initialStatus);
  const paidAmount =
    status === "unpaid"
      ? "0"
      : status === "paid"
        ? obligation
        : initialStatus === "partially_paid"
          ? initialPaidAmount
          : "";
  return (
    <form
      action={action}
      className="mt-[.5rem] grid grid-cols-[repeat(2,minmax(0,1fr))_auto] items-end gap-[.65rem] max-[540px]:grid-cols-1"
    >
      <input type="hidden" name="billId" value={billId} />
      <input type="hidden" name="participantId" value={participantId} />
      <div className={fieldClass}>
        <label htmlFor={`payment-status-${participantId}`}>Status</label>
        <Select
          id={`payment-status-${participantId}`}
          name="status"
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value as "unpaid" | "partially_paid" | "paid",
            )
          }
        >
          <option value="unpaid">Unpaid</option>
          <option value="partially_paid">Partially paid</option>
          <option value="paid">Paid</option>
        </Select>
      </div>
      {status === "partially_paid" ? (
        <div className={fieldClass}>
          <label htmlFor={`paid-amount-${participantId}`}>
            Amount paid
          </label>
          <AmountInput
            id={`paid-amount-${participantId}`}
            name="paidAmount"
            defaultValue={paidAmount}
            required
          />
        </div>
      ) : (
        <input type="hidden" name="paidAmount" value={paidAmount} />
      )}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Saving..." : "Save status"}
      </Button>
    </form>
  );
}
