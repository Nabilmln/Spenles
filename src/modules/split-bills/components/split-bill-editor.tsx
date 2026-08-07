"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  SplitBillActionState,
} from "../actions/split-bill-actions";
import { calculateSplitBill } from "../services/calculator";
import type { SplitBillDiscountMode } from "../types/split-bill";
import { CalculationSummary } from "./calculation-summary";

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

function createId() {
  return crypto.randomUUID();
}

function percentageToBasisPoints(value: string) {
  const match = /^(\d{0,3})(?:\.(\d{0,2}))?$/u.exec(value);
  if (!match) return 0;
  const whole = Number(match[1] || "0");
  const fraction = Number((match[2] ?? "").padEnd(2, "0"));
  return whole * 100 + fraction;
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
  const [state, formAction, pending] = useActionState(action, {});
  const [finalState, finalizeFormAction, finalizing] = useActionState(
    finalizeAction ?? action,
    {},
  );
  const [merchantName, setMerchantName] = useState(initial.merchantName);
  const [billDate, setBillDate] = useState(initial.billDate);
  const [note, setNote] = useState(initial.note);
  const [discountMode, setDiscountMode] = useState(initial.discountMode);
  const [fixedDiscountAmount, setFixedDiscountAmount] = useState(
    initial.fixedDiscountAmount,
  );
  const [discountBps, setDiscountBps] = useState(initial.discountBps);
  const [billTaxBps, setBillTaxBps] = useState(initial.billTaxBps);
  const [serviceChargeBps, setServiceChargeBps] = useState(
    initial.serviceChargeBps,
  );
  const [participants, setParticipants] = useState(initial.participants);
  const [items, setItems] = useState(initial.items);
  const revision = state.revision ?? initial.revision ?? 0;

  const payload = {
    merchantName,
    billDate,
    note,
    discountMode,
    fixedDiscountAmount:
      discountMode === "fixed" ? fixedDiscountAmount || "0" : "0",
    discountBps: discountMode === "percentage" ? discountBps : 0,
    billTaxBps,
    serviceChargeBps,
    participants,
    items,
  };

  const preview = useMemo(() => {
    try {
      return calculateSplitBill({
        discountMode,
        fixedDiscountAmount:
          discountMode === "fixed" ? BigInt(fixedDiscountAmount || "0") : 0n,
        discountBps: discountMode === "percentage" ? discountBps : 0,
        billTaxBps,
        serviceChargeBps,
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
          itemTaxBps: Number(item.itemTaxBps),
          assignments: item.participantIds.map((participantId) => ({
            id: `${item.id}:${participantId}`,
            participantId,
          })),
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
    items,
    participants,
    serviceChargeBps,
  ]);

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
        itemTaxBps: 0,
        participantIds: [],
      },
    ]);
  }

  return (
    <div className="split-editor-layout">
      <div className="split-editor-main">
        <form action={formAction} className="domain-form card split-editor-form">
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
          <fieldset className="split-fieldset">
            <legend>Informasi tagihan</legend>
            <div className="split-form-grid">
              <div className="field">
                <label htmlFor="split-merchant">Nama merchant</label>
                <Input
                  id="split-merchant"
                  value={merchantName}
                  onChange={(event) => setMerchantName(event.target.value)}
                  maxLength={120}
                  required
                />
              </div>
              <div className="field">
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
            <div className="field">
              <label htmlFor="split-note">Catatan (opsional)</label>
              <textarea
                id="split-note"
                className="input textarea"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
              />
            </div>
          </fieldset>

          <fieldset className="split-fieldset">
            <div className="split-fieldset-heading">
              <legend>Peserta</legend>
              <Button type="button" variant="secondary" onClick={addParticipant}>
                Tambah peserta
              </Button>
            </div>
            <div className="split-stack">
              {participants.map((participant, index) => (
                <div className="split-inline-row" key={participant.id}>
                  <div className="field">
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
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={participants.length === 1}
                    onClick={() => removeParticipant(participant.id)}
                  >
                    Hapus
                  </Button>
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className="split-fieldset">
            <div className="split-fieldset-heading">
              <legend>Item</legend>
              <Button type="button" variant="secondary" onClick={addItem}>
                Tambah item
              </Button>
            </div>
            <div className="split-stack">
              {items.map((item, itemIndex) => (
                <article className="split-item-editor" key={item.id}>
                  <div className="split-item-heading">
                    <h3>Item {itemIndex + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={items.length === 1}
                      onClick={() =>
                        setItems((current) =>
                          current.filter((row) => row.id !== item.id),
                        )
                      }
                    >
                      Hapus
                    </Button>
                  </div>
                  <div className="split-item-grid">
                    <div className="field split-item-name">
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
                    <div className="field">
                      <label htmlFor={`item-quantity-${item.id}`}>Jumlah</label>
                      <Input
                        id={`item-quantity-${item.id}`}
                        type="number"
                        min="1"
                        max="10000"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          setItems((current) =>
                            current.map((row) =>
                              row.id === item.id
                                ? { ...row, quantity: Number(event.target.value) }
                                : row,
                            ),
                          )
                        }
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`item-price-${item.id}`}>
                        Harga satuan
                      </label>
                      <Input
                        id={`item-price-${item.id}`}
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={item.unitPrice}
                        onChange={(event) =>
                          setItems((current) =>
                            current.map((row) =>
                              row.id === item.id
                                ? { ...row, unitPrice: event.target.value }
                                : row,
                            ),
                          )
                        }
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`item-tax-${item.id}`}>
                        Pajak item (%)
                      </label>
                      <Input
                        id={`item-tax-${item.id}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.itemTaxBps / 100}
                        onChange={(event) =>
                          setItems((current) =>
                            current.map((row) =>
                              row.id === item.id
                                ? {
                                    ...row,
                                    itemTaxBps: percentageToBasisPoints(
                                      event.target.value,
                                    ),
                                  }
                                : row,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                  <fieldset className="assignment-options">
                    <legend>Dibebankan kepada</legend>
                    {participants.map((participant) => (
                      <label key={participant.id}>
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
                  </fieldset>
                </article>
              ))}
            </div>
          </fieldset>

          <fieldset className="split-fieldset">
            <legend>Diskon, pajak, dan layanan</legend>
            <div className="split-charge-grid">
              <div className="field">
                <label htmlFor="discount-mode">Mode diskon</label>
                <Select
                  id="discount-mode"
                  value={discountMode}
                  onChange={(event) =>
                    setDiscountMode(
                      event.target.value as SplitBillDiscountMode,
                    )
                  }
                >
                  <option value="none">Tanpa diskon</option>
                  <option value="fixed">Diskon tetap</option>
                  <option value="percentage">Diskon persentase</option>
                </Select>
              </div>
              {discountMode === "fixed" ? (
                <div className="field">
                  <label htmlFor="fixed-discount">Diskon tetap (IDR)</label>
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
                <div className="field">
                  <label htmlFor="discount-percent">Diskon (%)</label>
                  <Input
                    id="discount-percent"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={discountBps / 100}
                    onChange={(event) =>
                      setDiscountBps(percentageToBasisPoints(event.target.value))
                    }
                    required
                  />
                </div>
              ) : null}
              <div className="field">
                <label htmlFor="bill-tax">Pajak tagihan (%)</label>
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
              <div className="field">
                <label htmlFor="service-charge">Biaya layanan (%)</label>
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
            <small>
              Pajak tagihan hanya berlaku pada item tanpa pajak item. Biaya
              layanan dihitung dari subtotal setelah diskon.
            </small>
          </fieldset>

          <FormMessage>{state.error}</FormMessage>
          {state.success ? (
            <p className="success-message" role="status">{state.success}</p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Memverifikasi..." : initial.id ? "Simpan draft" : "Buat draft"}
          </Button>
        </form>

        {initial.id && finalizeAction ? (
          <div className="card split-finalize-panel">
            <div>
              <h2>Finalisasi tagihan</h2>
              <p>
                Setelah finalisasi, item dan perhitungan tidak dapat diedit atau
                dibuka kembali.
              </p>
            </div>
            <form action={finalizeFormAction}>
              <input type="hidden" name="id" value={initial.id} />
              <input type="hidden" name="expectedRevision" value={revision} />
              <Button type="submit" disabled={finalizing}>
                {finalizing ? "Memfinalisasi..." : "Finalisasi"}
              </Button>
              <FormMessage>{finalState.error}</FormMessage>
            </form>
            {deleteAction ? (
              <form action={deleteAction}>
                <input type="hidden" name="id" value={initial.id} />
                <Button type="submit" variant="danger">Hapus draft</Button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
      {preview ? (
        <CalculationSummary result={preview} />
      ) : (
        <aside className="card split-summary">
          <p className="eyebrow">Pratinjau lokal</p>
          <h2>Lengkapi tagihan</h2>
          <p className="muted">
            Isi nominal positif dan tetapkan setiap item ke setidaknya satu
            peserta.
          </p>
        </aside>
      )}
    </div>
  );
}
