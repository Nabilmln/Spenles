"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cardClass,
  eyebrowClass,
  fieldClass,
  iconButtonClass,
  textareaClass,
} from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import { parseMoneyInput, unitPriceFromTotal } from "@/lib/money/input-format";
import type { SplitBillActionState } from "../actions/split-bill-actions";
import { calculateSplitBill } from "../services/calculator";
import { createId, percentageToBasisPoints } from "../services/draft-utils";
import type { SplitBillDiscountMode } from "../types/split-bill";
import { CalculationSummary } from "./calculation-summary";
import { QuantityInput, RupiahInput } from "./money-input";

export type SplitBillEditorData = {
  id?: string;
  revision?: number;
  merchantName: string;
  billDate: string;
  note: string;
  discountMode: SplitBillDiscountMode;
  fixedDiscountAmount: string;
  discountBps: number;
  billTaxBps: number;
  serviceChargeBps: number;
  participants: { id: string; name: string }[];
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: string;
    itemTaxBps: number;
    participantIds: string[];
  }[];
};

type EditorAction = (
  state: SplitBillActionState,
  formData: FormData,
) => Promise<SplitBillActionState>;

type ItemDraft = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string;
  participantIds: string[];
};

function percentageLabel(bps: number) {
  const value = bps / 100;
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function SplitBillEditor({
  action,
  finalizeAction,
  deleteAction,
  initial,
}: {
  action: EditorAction;
  finalizeAction?: EditorAction;
  deleteAction?: (formData: FormData) => Promise<void>;
  initial: SplitBillEditorData;
}) {
  const [state, formAction, pending] = useToastActionState(action, {});
  const [, finalizeFormAction, finalizing] = useToastActionState(
    finalizeAction ?? action,
    {},
  );
  const [merchantName, setMerchantName] = useState(initial.merchantName);
  const [billDate, setBillDate] = useState(initial.billDate);
  const [note, setNote] = useState(initial.note);
  const [taxPercent, setTaxPercent] = useState(
    percentageLabel(initial.billTaxBps),
  );
  const [participants, setParticipants] = useState(initial.participants);
  const [items, setItems] = useState<ItemDraft[]>(
    initial.items.map(({ id, name, quantity, unitPrice, participantIds }) => ({
      id,
      name,
      quantity,
      unitPrice,
      participantIds,
    })),
  );
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const revision = state.revision ?? initial.revision ?? 0;
  const billTaxBps = percentageToBasisPoints(taxPercent);

  const payload = {
    merchantName,
    billDate,
    note,
    discountMode: "none" as SplitBillDiscountMode,
    fixedDiscountAmount: "0",
    discountBps: 0,
    billTaxBps,
    serviceChargeBps: 0,
    participants,
    items: items.map((item) => ({ ...item, itemTaxBps: 0 })),
  };

  let preview: ReturnType<typeof calculateSplitBill> | null = null;
  try {
    preview = calculateSplitBill({
      discountMode: "none",
      fixedDiscountAmount: 0n,
      discountBps: 0,
      billTaxBps,
      serviceChargeBps: 0,
      participants: participants.map((participant, index) => ({
        ...participant,
        position: index + 1,
      })),
      items: items.map((item, index) => ({
        id: item.id,
        name: item.name,
        position: index + 1,
        quantity: Number(item.quantity),
        unitPrice: BigInt(item.unitPrice || "0"),
        itemTaxBps: 0,
        assignments: item.participantIds.map((participantId) => ({
          id: `${item.id}:${participantId}`,
          participantId,
        })),
      })),
    });
  } catch {
    preview = null;
  }

  function addParticipant() {
    setParticipants((current) => [
      ...current,
      { id: createId(), name: "" },
    ]);
  }

  function removeParticipant(id: string) {
    if (participants.length === 1) return;
    setParticipants((current) => current.filter((row) => row.id !== id));
    setItems((current) =>
      current.map((item) => ({
        ...item,
        participantIds: item.participantIds.filter(
          (participantId) => participantId !== id,
        ),
      })),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        id: createId(),
        name: "",
        quantity: 1,
        unitPrice: "",
        participantIds: [],
      },
    ]);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((row) => row.id !== id));
  }

  function updateUnitPrice(itemId: string, unitPrice: string) {
    setItems((current) =>
      current.map((row) =>
        row.id === itemId ? { ...row, unitPrice } : row,
      ),
    );
    setItemErrors((current) => {
      const next = { ...current };
      delete next[itemId];
      return next;
    });
  }

  function updateTotalPrice(itemId: string, total: string) {
    const parsedTotal = parseMoneyInput(total);
    const item = items.find((row) => row.id === itemId);
    if (!item) return;
    const quantity = item.quantity > 0 ? item.quantity : 1;
    const unit = unitPriceFromTotal(BigInt(parsedTotal || "0"), quantity);
    if (unit === null) {
      setItemErrors((current) => ({
        ...current,
        [itemId]:
          "Total harus habis dibagi jumlah item agar harga satuan tetap rupiah bulat.",
      }));
      return;
    }
    setItems((current) =>
      current.map((row) =>
        row.id === itemId ? { ...row, unitPrice: unit.toString() } : row,
      ),
    );
    setItemErrors((current) => {
      const next = { ...current };
      delete next[itemId];
      return next;
    });
  }

  function updateQuantity(itemId: string, quantity: number) {
    setItems((current) =>
      current.map((row) =>
        row.id === itemId ? { ...row, quantity } : row,
      ),
    );
    setItemErrors((current) => {
      const next = { ...current };
      delete next[itemId];
      return next;
    });
  }

  return (
    <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(19rem,.55fr)] items-start gap-4 max-[900px]:grid-cols-1">
      <div className="grid min-w-0 gap-4">
        <form
          action={formAction}
          className={`${cardClass} grid gap-4`}
          id="split-bill-draft-form"
        >
          <input type="hidden" name="payload" value={JSON.stringify(payload)} />
          {initial.id ? (
            <>
              <input type="hidden" name="id" value={initial.id} />
              <input
                type="hidden"
                name="expectedRevision"
                value={revision}
              />
            </>
          ) : null}

          <fieldset className="m-0 grid min-w-0 gap-4 rounded-[.8rem] border border-border p-4">
            <legend className="px-[.35rem] font-medium">Peserta</legend>
            {participants.length === 0 ? (
              <p
                className="m-0 rounded-[.7rem] bg-surface-subtle p-[.75rem] text-[.82rem] text-muted"
                role="status"
              >
                Tambahkan peserta terlebih dahulu untuk mulai memasukkan item.
              </p>
            ) : (
              <div className="grid gap-[.8rem]">
                {participants.map((participant, index) => (
                  <div className="flex items-end gap-[.7rem]" key={participant.id}>
                    <div className={`${fieldClass} min-w-0 flex-1`}>
                      <label htmlFor={`participant-${participant.id}`}>
                        Peserta {index + 1}
                      </label>
                      <Input
                        id={`participant-${participant.id}`}
                        value={participant.name}
                        onChange={(event) =>
                          setParticipants((current) =>
                            current.map((row) =>
                              row.id === participant.id
                                ? { ...row, name: event.target.value }
                                : row,
                            ),
                          )
                        }
                        maxLength={100}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className={iconButtonClass}
                      aria-label={`Hapus peserta ${index + 1}`}
                      disabled={participants.length === 1}
                      onClick={() => removeParticipant(participant.id)}
                    >
                      <X size={17} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={addParticipant}
              className="justify-self-start max-[540px]:w-full"
            >
              Tambah peserta
            </Button>
          </fieldset>

          {participants.length > 0 ? (
            <fieldset className="m-0 grid min-w-0 gap-4 rounded-[.8rem] border border-border p-4">
              <legend className="px-[.35rem] font-medium">Item</legend>
              <div className="grid gap-[.8rem]">
                {items.map((item, itemIndex) => (
                  <article
                    className="grid gap-[.85rem] rounded-[.8rem] border border-border bg-surface-subtle p-4"
                    key={item.id}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="m-0 text-[.95rem]">Item {itemIndex + 1}</h3>
                      <button
                        type="button"
                        className={`${iconButtonClass} text-expense hover:bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]`}
                        aria-label="Hapus item"
                        disabled={items.length === 1}
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                    <div className={`${fieldClass} min-w-0`}>
                      <label htmlFor={`item-name-${item.id}`}>Nama item</label>
                      <Input
                        id={`item-name-${item.id}`}
                        value={item.name}
                        onChange={(event) =>
                          setItems((current) =>
                            current.map((row) =>
                              row.id === item.id
                                ? { ...row, name: event.target.value }
                                : row,
                            ),
                          )
                        }
                        maxLength={120}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-[.7rem] max-[540px]:grid-cols-1">
                      <div className={fieldClass}>
                        <label htmlFor={`item-quantity-${item.id}`}>Jumlah</label>
                        <QuantityInput
                          id={`item-quantity-${item.id}`}
                          min="1"
                          max="10000"
                          value={item.quantity}
                          onChange={(value) => updateQuantity(item.id, value)}
                          required
                        />
                      </div>
                      <div className={fieldClass}>
                        <label htmlFor={`item-price-${item.id}`}>
                          Harga satuan
                        </label>
                        <RupiahInput
                          id={`item-price-${item.id}`}
                          min="1"
                          value={item.unitPrice}
                          onChange={(value) => updateUnitPrice(item.id, value)}
                          required
                        />
                      </div>
                    </div>
                    <div className={fieldClass}>
                      <label htmlFor={`item-total-${item.id}`}>
                        Harga total
                      </label>
                      <RupiahInput
                        id={`item-total-${item.id}`}
                        min="1"
                        value={
                          item.quantity > 0 && item.unitPrice
                            ? (
                                BigInt(item.quantity) * BigInt(item.unitPrice)
                              ).toString()
                            : ""
                        }
                        onChange={(value) => updateTotalPrice(item.id, value)}
                        aria-describedby={
                          itemErrors[item.id]
                            ? `item-total-error-${item.id}`
                            : undefined
                        }
                      />
                      {itemErrors[item.id] ? (
                        <p
                          id={`item-total-error-${item.id}`}
                          className="m-0 text-[.76rem] font-medium text-expense"
                          role="alert"
                        >
                          {itemErrors[item.id]}
                        </p>
                      ) : (
                        <p className="m-0 text-[.76rem] text-muted">
                          {item.quantity > 0 && item.unitPrice
                            ? `${item.quantity} × ${formatIdr(item.unitPrice)} = ${formatIdr(
                                (BigInt(item.quantity) * BigInt(item.unitPrice)).toString(),
                              )}`
                            : "Isi harga satuan atau total."}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {participants.map((participant) => (
                        <label
                          key={participant.id}
                          className="inline-flex items-center gap-[.4rem] text-[.82rem]"
                        >
                          <input
                            type="checkbox"
                            checked={item.participantIds.includes(participant.id)}
                            onChange={(event) =>
                              setItems((current) =>
                                current.map((row) =>
                                  row.id !== item.id
                                    ? row
                                    : {
                                        ...row,
                                        participantIds: event.target.checked
                                          ? [...row.participantIds, participant.id]
                                          : row.participantIds.filter(
                                              (id) => id !== participant.id,
                                            ),
                                      },
                                ),
                              )
                            }
                          />
                          {participant.name || "Peserta tanpa nama"}
                        </label>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={addItem}
                className="justify-self-start max-[540px]:w-full"
              >
                Tambah item
              </Button>
            </fieldset>
          ) : null}

          <fieldset className="m-0 grid min-w-0 gap-4 rounded-[.8rem] border border-border p-4">
            <legend className="px-[.35rem] font-medium">Pajak</legend>
            <div className={`${fieldClass} max-w-[12rem]`}>
              <label htmlFor="split-tax">Pajak (%)</label>
              <Input
                id="split-tax"
                type="number"
                min="0"
                max="100"
                step="any"
                inputMode="decimal"
                value={taxPercent}
                onChange={(event) => setTaxPercent(event.target.value)}
              />
            </div>
          </fieldset>

          <fieldset className="m-0 grid min-w-0 gap-4 rounded-[.8rem] border border-border p-4">
            <legend className="px-[.35rem] font-medium">Informasi tagihan</legend>
            <div className="grid grid-cols-2 gap-4 max-[540px]:grid-cols-1">
              <div className={fieldClass}>
                <label htmlFor="split-merchant">Nama merchant</label>
                <Input
                  id="split-merchant"
                  value={merchantName}
                  onChange={(event) => setMerchantName(event.target.value)}
                  maxLength={120}
                  required
                />
              </div>
              <div className={fieldClass}>
                <label htmlFor="split-date">Tanggal tagihan</label>
                <Input
                  id="split-date"
                  type="date"
                  value={billDate}
                  onChange={(event) => setBillDate(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className={fieldClass}>
              <label htmlFor="split-note">Catatan (opsional)</label>
              <textarea
                id="split-note"
                className={textareaClass}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
              />
            </div>
          </fieldset>
        </form>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            form="split-bill-draft-form"
            variant="blue"
            disabled={pending}
            className="flex-1"
          >
            {pending ? "Menyimpan..." : "Draft"}
          </Button>
          <form action={finalizeFormAction} className="flex-1">
            <input type="hidden" name="payload" value={JSON.stringify(payload)} />
            {initial.id ? (
              <>
                <input type="hidden" name="id" value={initial.id} />
                <input type="hidden" name="expectedRevision" value={revision} />
              </>
            ) : null}
            <Button type="submit" disabled={finalizing} className="w-full">
              {finalizing ? "Memfinalisasi..." : "Final"}
            </Button>
          </form>
          {initial.id && deleteAction ? (
            <form action={deleteAction} className="flex-1">
              <input type="hidden" name="id" value={initial.id} />
              <Button type="submit" variant="danger" className="w-full">
                Hapus
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      {preview ? (
        <CalculationSummary result={preview} />
      ) : (
        <aside className={`${cardClass} grid min-w-0 gap-4`}>
          <p className={eyebrowClass}>Pratinjau lokal</p>
          <h2 className="m-0">Lengkapi tagihan</h2>
          <p className="text-muted">
            Tambahkan peserta, lalu isi item dan tetapkan setiap item ke
            setidaknya satu peserta.
          </p>
        </aside>
      )}
    </div>
  );
}