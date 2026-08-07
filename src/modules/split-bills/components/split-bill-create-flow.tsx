"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import type { SplitBillActionState } from "../actions/split-bill-actions";
import { calculateSplitBill } from "../services/calculator";
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
  const [state, formAction, pending] = useActionState(action, {});
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
    <div className="split-create-layout">
      <form action={formAction} className="domain-form card split-editor-form">
        <input type="hidden" name="payload" value={JSON.stringify(payload)} />

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
        </fieldset>

        <fieldset className="split-fieldset">
          <div className="split-fieldset-heading">
            <legend>Peserta</legend>
            <Button
              type="button"
              variant="secondary"
              onClick={addParticipant}
              aria-label="Tambah peserta"
            >
              <Plus size={16} aria-hidden="true" /> Tambah Peserta
            </Button>
          </div>
          <div className="split-stack split-create-participants">
            {participants.map((participant, participantIndex) => (
              <article
                className="split-participant-card"
                key={participant.id}
              >
                <div className="split-participant-heading">
                  <div className="field split-participant-name">
                    <label htmlFor={`participant-${participant.id}`}>
                      Peserta {participantIndex + 1}
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
                    aria-label={`Hapus peserta ${participantIndex + 1}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </Button>
                </div>

                <div className="split-create-items">
                  {participant.items.length ? (
                    participant.items.map((item, itemIndex) => (
                      <div className="split-create-item-row" key={item.id}>
                        <div className="field">
                          <label htmlFor={`item-name-${item.id}`}>
                            Nama item
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
                        <div className="field">
                          <label htmlFor={`item-price-${item.id}`}>Harga</label>
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
                          aria-label={`Hapus item ${itemIndex + 1} peserta ${participantIndex + 1}`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="muted split-create-none">
                      Belum ada barang untuk peserta ini.
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addItem(participant.id)}
                    aria-label={`Tambah barang untuk peserta ${participantIndex + 1}`}
                  >
                    <Plus size={16} aria-hidden="true" /> Tambah Barang
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </fieldset>

        {hasItems ? (
          <fieldset className="split-fieldset">
            <legend>Diskon, pajak, dan layanan</legend>
            <div className="split-charge-grid">
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
                <label htmlFor="discount-mode">Diskon</label>
                <select
                  id="discount-mode"
                  className="input"
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
                </select>
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
                      setDiscountBps(
                        percentageToBasisPoints(event.target.value),
                      )
                    }
                    required
                  />
                </div>
              ) : null}
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
        ) : null}

        <FormMessage>{state.error}</FormMessage>
        {state.success ? (
          <p className="success-message" role="status">
            {state.success}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Memverifikasi..." : "Buat draft"}
        </Button>
      </form>

      {preview ? (
        <CalculationSummary result={preview} />
      ) : (
        <aside className="card split-summary">
          <p className="eyebrow">Pratinjau lokal</p>
          <h2>Lengkapi tagihan</h2>
          <p className="muted">
            Tambahkan setidaknya satu item berharga positif pada peserta untuk
            melihat pratinjau.
          </p>
        </aside>
      )}
    </div>
  );
}