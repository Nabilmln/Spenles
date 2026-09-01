"use client";

import { useMemo, useState } from "react";
import { useToastActionState } from "@/components/ui/toast";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  cardClass,
  eyebrowClass,
  fieldClass,
  textareaClass,
} from "@/components/ui/styles";
import type { SplitBillActionState } from "../actions/split-bill-actions";
import { calculateSplitBill } from "../services/calculator";
import { createId, percentageToBasisPoints } from "../services/draft-utils";
import type {
  SplitBillCalculationResult,
  SplitBillDiscountMode,
} from "../types/split-bill";
import { CalculationSummary } from "./calculation-summary";

type ParticipantDraft = {
  id: string;
  name: string;
  items: { id: string; name: string; unitPrice: string }[];
};

function emptyParticipant(): ParticipantDraft {
  return { id: createId(), name: "", items: [] };
}

export function SplitBillCreateFlow({
  action,
  initialDate,
}: {
  action: (
    state: SplitBillActionState,
    formData: FormData,
  ) => Promise<SplitBillActionState>;
  initialDate: string;
}) {
  const [, formAction, pending] = useToastActionState(action, {});
  const [merchantName, setMerchantName] = useState("");
  const [billDate, setBillDate] = useState(initialDate);
  const [note, setNote] = useState("");
  const [discountMode, setDiscountMode] =
    useState<SplitBillDiscountMode>("none");
  const [fixedDiscountAmount, setFixedDiscountAmount] = useState("0");
  const [discountBps, setDiscountBps] = useState(0);
  const [billTaxBps, setBillTaxBps] = useState(0);
  const [serviceChargeBps, setServiceChargeBps] = useState(0);
  const [participants, setParticipants] = useState<ParticipantDraft[]>([
    emptyParticipant(),
  ]);

  const withItems = participants.filter(
    (participant) => participant.items.length,
  );
  const hasItems = withItems.length > 0;

  function addParticipant() {
    setParticipants((current) => [...current, emptyParticipant()]);
  }

  function removeParticipant(id: string) {
    if (participants.length <= 1) return;
    setParticipants((current) =>
      current.filter((participant) => participant.id !== id),
    );
  }

  function renameParticipant(id: string, name: string) {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id === id ? { ...participant, name } : participant,
      ),
    );
  }

  function addItem(participantId: string) {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              items: [
                ...participant.items,
                { id: createId(), name: "", unitPrice: "" },
              ],
            }
          : participant,
      ),
    );
  }

  function removeItem(participantId: string, itemId: string) {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              items: participant.items.filter((item) => item.id !== itemId),
            }
          : participant,
      ),
    );
  }

  function updateItem(
    participantId: string,
    itemId: string,
    patch: Partial<{ name: string; unitPrice: string }>,
  ) {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              items: participant.items.map((item) =>
                item.id === itemId ? { ...item, ...patch } : item,
              ),
            }
          : participant,
      ),
    );
  }

  const flatItems = useMemo(() => {
    const flattened: {
      id: string;
      name: string;
      unitPrice: bigint;
      participantId: string;
      itemPosition: number;
    }[] = [];
    for (const participant of participants) {
      for (const [index, item] of participant.items.entries()) {
        flattened.push({
          id: item.id,
          name: item.name,
          unitPrice: BigInt(item.unitPrice || "0"),
          participantId: participant.id,
          itemPosition: index + 1,
        });
      }
    }
    return flattened;
  }, [participants]);

  const hasPositiveItems = flatItems.some((item) => item.unitPrice > 0n);

  const preview: SplitBillCalculationResult | null = useMemo(() => {
    if (!hasItems || !hasPositiveItems) return null;
    try {
      return calculateSplitBill({
        discountMode,
        fixedDiscountAmount:
          discountMode === "fixed" ? BigInt(fixedDiscountAmount || "0") : 0n,
        discountBps: discountMode === "percentage" ? discountBps : 0,
        billTaxMode: "percentage",
        fixedBillTaxAmount: 0n,
        billTaxBps,
        serviceChargeBps,
        participants: participants.map((participant, index) => ({
          id: participant.id,
          name: participant.name,
          position: index + 1,
        })),
        items: flatItems.map((item) => ({
          id: item.id,
          name: item.name,
          position: item.itemPosition,
          quantity: 1,
          unitPrice: item.unitPrice,
          itemTaxBps: 0,
          assignments: [
            {
              id: `${item.id}:${item.participantId}`,
              participantId: item.participantId,
            },
          ],
        })),
      });
    } catch {
      return null;
    }
  }, [
    billTaxBps,
    discountBps,
    discountMode,
    fixedDiscountAmount,
    flatItems,
    hasItems,
    hasPositiveItems,
    participants,
    serviceChargeBps,
  ]);

  const payload = {
    merchantName,
    billDate,
    note,
    discountMode,
    fixedDiscountAmount:
      discountMode === "fixed" ? fixedDiscountAmount || "0" : "0",
    discountBps: discountMode === "percentage" ? discountBps : 0,
    billTaxMode: "percentage",
    fixedBillTaxAmount: "0",
    billTaxBps,
    serviceChargeBps,
    participants: participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
    })),
    items: participants.flatMap((participant) =>
      participant.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: 1,
        unitPrice: item.unitPrice,
        itemTaxBps: 0,
        participantIds: [participant.id],
      })),
    ),
  };

  return (
    <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(19rem,.55fr)] items-start gap-4 max-[900px]:grid-cols-1">
      <form action={formAction} className={`${cardClass} grid gap-4`}>
        <input type="hidden" name="payload" value={JSON.stringify(payload)} />

        <fieldset className="m-0 grid min-w-0 gap-4 rounded-[.8rem] border border-border p-4">
          <legend className="px-[.35rem] font-medium">Bill information</legend>
          <div className="grid grid-cols-2 gap-4 max-[540px]:grid-cols-1">
            <div className={fieldClass}>
              <label htmlFor="split-merchant">Merchant name</label>
              <Input
                id="split-merchant"
                value={merchantName}
                onChange={(event) => setMerchantName(event.target.value)}
                maxLength={120}
                required
              />
            </div>
            <div className={fieldClass}>
              <label htmlFor="split-date">Bill date</label>
              <Input
                id="split-date"
                type="date"
                value={billDate}
                onChange={(event) => setBillDate(event.target.value)}
                required
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="m-0 grid min-w-0 gap-4 rounded-[.8rem] border border-border p-4">
          <div className="flex items-center justify-between gap-4 max-[540px]:flex-col max-[540px]:items-stretch">
            <legend className="px-[.35rem] font-medium">Participants</legend>
            <Button
              type="button"
              variant="secondary"
              onClick={addParticipant}
              aria-label="Add participant"
            >
              <Plus size={16} aria-hidden="true" /> Add Participant
            </Button>
          </div>
          <div className="grid gap-[.8rem]">
            {participants.map((participant, participantIndex) => (
              <article
                className="grid gap-[.85rem] rounded-[.8rem] border border-border bg-surface-subtle p-4"
                key={participant.id}
              >
                <div className="flex items-end gap-[.7rem]">
                  <div className={`${fieldClass} flex-auto min-w-0`}>
                    <label htmlFor={`participant-${participant.id}`}>
                      Participant {participantIndex + 1}
                    </label>
                    <Input
                      id={`participant-${participant.id}`}
                      value={participant.name}
                      onChange={(event) =>
                        renameParticipant(participant.id, event.target.value)
                      }
                      maxLength={100}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={participants.length <= 1}
                    onClick={() => removeParticipant(participant.id)}
                    aria-label={`Delete participant ${participantIndex + 1}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </Button>
                </div>

                <div className="mt-[.4rem] grid gap-[.6rem]">
                  {participant.items.length ? (
                    participant.items.map((item, itemIndex) => (
                      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(6.5rem,.6fr)_auto] items-end gap-[.5rem] max-[540px]:grid-cols-2" key={item.id}>
                        <div className={fieldClass}>
                          <label htmlFor={`item-name-${item.id}`}>
                            Item name
                          </label>
                          <Input
                            id={`item-name-${item.id}`}
                            value={item.name}
                            onChange={(event) =>
                              updateItem(participant.id, item.id, {
                                name: event.target.value,
                              })
                            }
                            maxLength={120}
                            required
                          />
                        </div>
                        <div className={fieldClass}>
                          <label htmlFor={`item-price-${item.id}`}>Price</label>
                          <Input
                            id={`item-price-${item.id}`}
                            type="number"
                            min="1"
                            step="1"
                            inputMode="numeric"
                            value={item.unitPrice}
                            onChange={(event) =>
                              updateItem(participant.id, item.id, {
                                unitPrice: event.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeItem(participant.id, item.id)}
                          aria-label={`Delete item ${itemIndex + 1} of participant ${participantIndex + 1}`}
                          className="max-[540px]:col-span-full max-[540px]:justify-self-start"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="m-[.1rem_0] text-[.82rem] text-muted">
                      No items for this participant yet.
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addItem(participant.id)}
                    aria-label={`Add item for participant ${participantIndex + 1}`}
                  >
                    <Plus size={16} aria-hidden="true" /> Add Item
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </fieldset>

        {hasItems ? (
          <fieldset className="m-0 grid min-w-0 gap-4 rounded-[.8rem] border border-border p-4">
            <legend className="px-[.35rem] font-medium">Discount, tax, and service</legend>
            <div className="grid grid-cols-2 gap-4 max-[540px]:grid-cols-1">
              <div className={fieldClass}>
                <label htmlFor="bill-tax">Bill tax (%)</label>
                <Input
                  id="bill-tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={billTaxBps / 100}
                  onChange={(event) =>
                    setBillTaxBps(percentageToBasisPoints(event.target.value))
                  }
                />
              </div>
              <div className={fieldClass}>
                <label htmlFor="discount-mode">Discount</label>
                <Select
                  id="discount-mode"
                  value={discountMode}
                  onChange={(event) =>
                    setDiscountMode(
                      event.target.value as SplitBillDiscountMode,
                    )
                  }
                >
                  <option value="none">No discount</option>
                  <option value="fixed">Fixed discount</option>
                  <option value="percentage">Percentage discount</option>
                </Select>
              </div>
              {discountMode === "fixed" ? (
                <div className={fieldClass}>
                  <label htmlFor="fixed-discount">Fixed discount (IDR)</label>
                  <Input
                    id="fixed-discount"
                    type="number"
                    min="1"
                    step="1"
                    value={fixedDiscountAmount}
                    onChange={(event) =>
                      setFixedDiscountAmount(event.target.value)
                    }
                    required
                  />
                </div>
              ) : null}
              {discountMode === "percentage" ? (
                <div className={fieldClass}>
                  <label htmlFor="discount-percent">Discount (%)</label>
                  <Input
                    id="discount-percent"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={discountBps / 100}
                    onChange={(event) =>
                      setDiscountBps(
                        percentageToBasisPoints(event.target.value),
                      )
                    }
                    required
                  />
                </div>
              ) : null}
              <div className={fieldClass}>
                <label htmlFor="service-charge">Service charge (%)</label>
                <Input
                  id="service-charge"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={serviceChargeBps / 100}
                  onChange={(event) =>
                    setServiceChargeBps(
                      percentageToBasisPoints(event.target.value),
                    )
                  }
                />
              </div>
            </div>
            <div className={fieldClass}>
              <label htmlFor="split-note">Note (optional)</label>
              <textarea
                id="split-note"
                className={textareaClass}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
              />
            </div>
          </fieldset>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Verifying..." : "Create draft"}
        </Button>
      </form>

      {preview ? (
        <CalculationSummary result={preview} />
      ) : (
        <aside className={`${cardClass} grid min-w-0 gap-4`}>
          <p className={eyebrowClass}>Local preview</p>
          <h2 className="m-0">Complete the bill</h2>
          <p className="text-muted">
            Add at least one item with a positive price on a participant to
            see the preview.
          </p>
        </aside>
      )}
    </div>
  );
}