"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cardClass,
  fieldClass,
  iconButtonClass,
  textareaClass,
} from "@/components/ui/styles";
import { isDateKey, todayJakartaDate } from "@/lib/dates/calendar";
import { formatDateLong } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
import { parseMoneyInput, unitPriceFromTotal } from "@/lib/money/input-format";
import type { FriendRow } from "@/modules/friends";
import {
  finalizeSplitBillAction,
  saveSplitBillDraftAction,
} from "../actions/make-bill-actions";
import {
  SPLIT_BILL_MAX_MONEY,
  SPLIT_BILL_MAX_QUANTITY,
} from "../constants/limits";
import { calculateSplitBill } from "../services/calculator";
import { createId, percentageToBasisPoints } from "../services/draft-utils";
import type { SplitBillTaxMode } from "../types/split-bill";
import { FriendCarousel } from "./friend-carousel";
import { MakeBillDateSheet } from "./make-bill-date-sheet";
import { MakeBillFriendPickerSheet } from "./make-bill-friend-picker-sheet";
import { MakeBillPreviewSheet } from "./make-bill-preview-sheet";
import { MakeBillTaxSheet } from "./make-bill-tax-sheet";
import { QuantityInput, RupiahInput } from "./money-input";

type ItemDraft = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string;
};

const STEPS = [
  { number: 1, label: "Friends" },
  { number: 2, label: "Bill Details" },
  { number: 3, label: "Overview" },
];

function percentageLabel(bps: number) {
  const value = bps / 100;
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function StepIndicator({ current }: { current: number }) {
  return (
    <ol
      className="m-0 grid grid-cols-3 gap-[.5rem] p-0"
      aria-label="Bill steps"
    >
      {STEPS.map((step) => {
        const done = step.number < current;
        const active = step.number === current;
        return (
          <li key={step.number} className="flex flex-col items-center gap-[.3rem]">
            <span
              className={
                "grid size-[1.9rem] place-items-center rounded-full text-[.82rem] font-semibold " +
                (active
                  ? "bg-primary-600 text-white"
                  : done
                    ? "bg-primary-100 text-primary-700"
                    : "bg-surface-subtle text-muted")
              }
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check size={14} aria-hidden="true" /> : step.number}
            </span>
            <span
              className={
                "text-[.72rem] " +
                (active ? "font-semibold text-foreground" : "text-muted")
              }
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function MakeBillWizard({ friends }: { friends: FriendRow[] }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const [step, setStep] = useState(1);
  const [selectedFriends, setSelectedFriends] = useState<FriendRow[]>([]);
  const [merchantName, setMerchantName] = useState("");
  const [billDate, setBillDateState] = useState(() => todayJakartaDate());
  const [note, setNote] = useState("");
  const [billTaxMode, setBillTaxMode] = useState<SplitBillTaxMode>("percentage");
  const [taxPercent, setTaxPercent] = useState("0");
  const [fixedBillTaxAmount, setFixedBillTaxAmount] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [savedRef, setSavedRef] = useState<{ id: string; revision: number } | null>(
    null,
  );
  const [finalizedId, setFinalizedId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const billTaxBps =
    billTaxMode === "percentage" ? percentageToBasisPoints(taxPercent) : 0;

  const participantIds = selectedFriends.map((friend) => friend.id);

  const payload = useMemo(
    () => ({
      merchantName: merchantName.trim(),
      billDate,
      note,
      discountMode: "none" as const,
      fixedDiscountAmount: "0",
      discountBps: 0,
      billTaxMode,
      fixedBillTaxAmount:
        billTaxMode === "fixed" ? fixedBillTaxAmount || "0" : "0",
      billTaxBps,
      serviceChargeBps: 0,
      participants: selectedFriends.map((friend) => ({
        id: friend.id,
        name: friend.name,
      })),
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        itemTaxBps: 0,
        participantIds,
      })),
    }),
    [
      merchantName,
      billDate,
      note,
      billTaxMode,
      fixedBillTaxAmount,
      billTaxBps,
      selectedFriends,
      items,
      participantIds,
    ],
  );

  let preview: ReturnType<typeof calculateSplitBill> | null = null;
  try {
    preview = calculateSplitBill({
      discountMode: "none",
      fixedDiscountAmount: 0n,
      discountBps: 0,
      billTaxMode,
      fixedBillTaxAmount:
        billTaxMode === "fixed" ? BigInt(fixedBillTaxAmount || "0") : 0n,
      billTaxBps,
      serviceChargeBps: 0,
      participants: selectedFriends.map((friend, index) => ({
        id: friend.id,
        name: friend.name,
        position: index + 1,
      })),
      items: items.map((item, index) => ({
        id: item.id,
        name: item.name,
        position: index + 1,
        quantity: Number(item.quantity),
        unitPrice: BigInt(item.unitPrice || "0"),
        itemTaxBps: 0,
        assignments: participantIds.map((participantId) => ({
          id: `${item.id}:${participantId}`,
          participantId,
        })),
      })),
    });
  } catch {
    preview = null;
  }

  const step1Valid = selectedFriends.length >= 1;

  function isValidItem(item: ItemDraft) {
    if (!item.name.trim()) return false;
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > SPLIT_BILL_MAX_QUANTITY
    ) {
      return false;
    }
    const unitPrice = BigInt(item.unitPrice || "0");
    if (unitPrice <= 0n) return false;
    if (BigInt(item.quantity) * unitPrice > SPLIT_BILL_MAX_MONEY) return false;
    return true;
  }

  const step2Valid =
    merchantName.trim().length > 0 &&
    isDateKey(billDate) &&
    items.length >= 1 &&
    items.every(isValidItem);

  const step3Valid = step1Valid && step2Valid && preview !== null;

  const taxSet =
    billTaxMode === "percentage"
      ? billTaxBps > 0
      : BigInt(fixedBillTaxAmount || "0") > 0n;

  function buildFormData() {
    const formData = new FormData();
    formData.set("payload", JSON.stringify(payload));
    if (savedRef) {
      formData.set("id", savedRef.id);
      formData.set("expectedRevision", String(savedRef.revision));
    }
    return formData;
  }

  async function handleSaveDraft() {
    setSaving(true);
    const result = await saveSplitBillDraftAction({}, buildFormData());
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.id) {
      setSavedRef({ id: result.id, revision: result.revision ?? 0 });
    }
    if (result.success) toast.success(result.success);
  }

  async function handleFinalize() {
    setFinalizing(true);
    const result = await finalizeSplitBillAction({}, buildFormData());
    setFinalizing(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.finalizedId) {
      setFinalizedId(result.finalizedId);
      setPreviewOpen(true);
    }
  }

  function confirmFriends(ids: string[]) {
    setSelectedFriends(
      friends.filter((friend) => ids.includes(friend.id)),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { id: createId(), name: "", quantity: 1, unitPrice: "" },
    ]);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((row) => row.id !== id));
  }

  function updateItemName(id: string, name: string) {
    setItems((current) =>
      current.map((row) => (row.id === id ? { ...row, name } : row)),
    );
  }

  function updateQuantity(id: string, quantity: number) {
    setItems((current) =>
      current.map((row) => (row.id === id ? { ...row, quantity } : row)),
    );
    setItemErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function updateUnitPrice(id: string, unitPrice: string) {
    setItems((current) =>
      current.map((row) => (row.id === id ? { ...row, unitPrice } : row)),
    );
    setItemErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function updateTotalPrice(id: string, total: string) {
    const parsedTotal = parseMoneyInput(total);
    const item = items.find((row) => row.id === id);
    if (!item) return;
    const quantity = item.quantity > 0 ? item.quantity : 1;
    const unit = unitPriceFromTotal(BigInt(parsedTotal || "0"), quantity);
    if (unit === null) {
      setItemErrors((current) => ({
        ...current,
        [id]:
          "Total must divide evenly by the quantity so the unit price stays a whole rupiah.",
      }));
      return;
    }
    setItems((current) =>
      current.map((row) =>
        row.id === id ? { ...row, unitPrice: unit.toString() } : row,
      ),
    );
    setItemErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function goBack() {
    setStep((current) => (current > 1 ? current - 1 : current));
  }

  function goNext() {
    setStep((current) => (current < 3 ? current + 1 : current));
  }

  return (
    <div className={`${cardClass} grid gap-[1.25rem]`}>
      <StepIndicator current={step} />

      {step === 1 ? (
        <section aria-label="Step 1: Friends">
          <div className="mb-[.75rem] grid gap-[.3rem]">
            <h2 className="m-0 text-[1.05rem] tracking-[-.02em]">Friends</h2>
            <p className="m-0 text-[.82rem] text-muted">
              Add the people sharing this bill.
            </p>
          </div>
          <FriendCarousel
            friends={selectedFriends}
            onAddFriend={() => setPickerOpen(true)}
            onSelectFriend={() => setPickerOpen(true)}
          />
        </section>
      ) : null}

      {step === 2 ? (
        <section aria-label="Step 2: Bill Details" className="grid gap-[1.25rem]">
          <div className="grid gap-[.3rem]">
            <h2 className="m-0 text-[1.05rem] tracking-[-.02em]">Bill Details</h2>
            <p className="m-0 text-[.82rem] text-muted">
              Enter the merchant and the purchased items.
            </p>
          </div>

          <div className="grid gap-[1rem]">
            <div className={fieldClass}>
              <label className="text-[.86rem] font-medium" htmlFor="make-bill-merchant">
                Merchant
              </label>
              <Input
                id="make-bill-merchant"
                value={merchantName}
                onChange={(event) => setMerchantName(event.target.value)}
                maxLength={120}
                placeholder="e.g. Warung Nasi Padang"
              />
            </div>

            <div className={fieldClass}>
              <span className="text-[.86rem] font-medium">Bill date</span>
              <button
                type="button"
                className="flex min-h-[2.6rem] items-center justify-between gap-[.5rem] rounded-[.65rem] border border-border bg-surface-subtle px-[.8rem] py-[.6rem] text-left text-[.9rem] text-foreground transition-colors hover:border-primary-300"
                onClick={() => setDateOpen(true)}
                aria-label="Bill date"
              >
                <span className="inline-flex items-center gap-[.5rem]">
                  <CalendarDays
                    size={16}
                    aria-hidden="true"
                    className="text-muted"
                  />
                  {billDate ? formatDateLong(billDate) : "Select date"}
                </span>
                <ChevronLeft
                  size={16}
                  aria-hidden="true"
                  className="rotate-[270deg] text-muted"
                />
              </button>
            </div>
          </div>

          <div className="grid gap-[.75rem]">
            {items.length === 0 ? (
              <button
                type="button"
                onClick={addItem}
                className="flex min-h-[5.5rem] w-full items-center justify-center gap-[.4rem] rounded-[1rem] border-2 border-dashed border-border bg-surface-subtle text-[.82rem] font-medium text-muted transition-colors hover:border-primary-300 hover:text-primary-600"
              >
                <Plus size={18} aria-hidden="true" />
                Add Item
              </button>
            ) : (
              items.map((item, itemIndex) => {
                const total =
                  item.quantity > 0 && item.unitPrice
                    ? (BigInt(item.quantity) * BigInt(item.unitPrice)).toString()
                    : "";
                return (
                  <article
                    key={item.id}
                    className="grid gap-[.85rem] rounded-[.85rem] border border-border bg-surface-subtle p-[.9rem]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="m-0 text-[.95rem]">Item {itemIndex + 1}</h3>
                      <div className="flex items-center gap-[.3rem]">
                        <button
                          type="button"
                          className={`${iconButtonClass} text-expense hover:bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]`}
                          aria-label={`Delete item ${itemIndex + 1}`}
                          disabled={items.length === 1}
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={iconButtonClass}
                          aria-label="Add item"
                          onClick={addItem}
                        >
                          <Plus size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-[.7rem] max-[420px]:grid-cols-1">
                      <div className={fieldClass}>
                        <label
                          className="text-[.82rem] font-medium"
                          htmlFor={`make-bill-item-name-${item.id}`}
                        >
                          Item name
                        </label>
                        <Input
                          id={`make-bill-item-name-${item.id}`}
                          value={item.name}
                          onChange={(event) =>
                            updateItemName(item.id, event.target.value)
                          }
                          maxLength={120}
                        />
                      </div>
                      <div className={fieldClass}>
                        <label
                          className="text-[.82rem] font-medium"
                          htmlFor={`make-bill-item-quantity-${item.id}`}
                        >
                          Quantity
                        </label>
                        <QuantityInput
                          id={`make-bill-item-quantity-${item.id}`}
                          min="1"
                          max="10000"
                          value={item.quantity}
                          onChange={(value) => updateQuantity(item.id, value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[.7rem]">
                      <div className={fieldClass}>
                        <label
                          className="text-[.82rem] font-medium"
                          htmlFor={`make-bill-item-price-${item.id}`}
                        >
                          Unit price
                        </label>
                        <RupiahInput
                          id={`make-bill-item-price-${item.id}`}
                          min="1"
                          value={item.unitPrice}
                          onChange={(value) => updateUnitPrice(item.id, value)}
                        />
                      </div>
                      <div className={fieldClass}>
                        <label
                          className="text-[.82rem] font-medium"
                          htmlFor={`make-bill-item-total-${item.id}`}
                        >
                          Total price
                        </label>
                        <RupiahInput
                          id={`make-bill-item-total-${item.id}`}
                          min="1"
                          value={total}
                          onChange={(value) => updateTotalPrice(item.id, value)}
                          aria-describedby={
                            itemErrors[item.id]
                              ? `make-bill-item-total-error-${item.id}`
                              : undefined
                          }
                        />
                      </div>
                    </div>

                    {itemErrors[item.id] ? (
                      <p
                        id={`make-bill-item-total-error-${item.id}`}
                        className="m-0 text-[.76rem] font-medium text-expense"
                        role="alert"
                      >
                        {itemErrors[item.id]}
                      </p>
                    ) : (
                      <p className="m-0 text-[.76rem] text-muted">
                        {item.quantity > 0 && item.unitPrice
                          ? `${item.quantity} × ${formatIdr(item.unitPrice)} = ${formatIdr(total)}`
                          : "Enter a unit price or total."}
                      </p>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section aria-label="Step 3: Overview" className="grid gap-[1.25rem]">
          <div className="grid gap-[.3rem]">
            <h2 className="m-0 text-[1.05rem] tracking-[-.02em]">Overview</h2>
            <p className="m-0 text-[.82rem] text-muted">
              Add optional tax and a description before saving.
            </p>
          </div>

          <div className="grid gap-[.75rem]">
            {taxSet ? (
              <div className="flex items-center justify-between gap-4 rounded-[.85rem] border border-border p-[.9rem]">
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => setTaxOpen(true)}
                >
                  <p className="m-0 text-[.78rem] font-semibold uppercase tracking-[.12em] text-muted">
                    Tax
                  </p>
                  <p className="m-0 text-[1rem] font-medium">
                    {billTaxMode === "percentage"
                      ? `${percentageLabel(billTaxBps)}%`
                      : formatIdr(fixedBillTaxAmount || "0")}
                  </p>
                </button>
                <button
                  type="button"
                  className={iconButtonClass}
                  aria-label="Remove tax"
                  onClick={() => {
                    setBillTaxMode("percentage");
                    setTaxPercent("0");
                    setFixedBillTaxAmount("");
                  }}
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setTaxOpen(true)}
                className="flex min-h-[3.5rem] w-full items-center justify-center gap-[.4rem] rounded-[1rem] border-2 border-dashed border-border bg-surface-subtle text-[.82rem] font-medium text-muted transition-colors hover:border-primary-300 hover:text-primary-600"
              >
                <Plus size={18} aria-hidden="true" />
                Add Tax (Optional)
              </button>
            )}
          </div>

          <div className={fieldClass}>
            <label className="text-[.86rem] font-medium" htmlFor="make-bill-note">
              Description (optional)
            </label>
            <textarea
              id="make-bill-note"
              className={`${textareaClass} min-h-[6rem]`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
              placeholder="Add a short note about this bill"
            />
          </div>

          {preview ? (
            <div className="rounded-[.85rem] border border-border p-[.9rem]">
              <p className="m-0 text-[.78rem] font-semibold uppercase tracking-[.12em] text-muted">
                Bill summary
              </p>
              <div className="mt-[.6rem] flex items-baseline justify-between gap-4">
                <span className="text-[.9rem] text-muted">Final total</span>
                <strong className="text-[1.2rem] wrap-anywhere">
                  {formatIdr(preview.finalAmount)}
                </strong>
              </div>
              <p className="m-0 mt-[.4rem] text-[.76rem] text-muted">
                {selectedFriends.length} participant
                {selectedFriends.length === 1 ? "" : "s"} · the server re-verifies
                all amounts before saving.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="flex items-center gap-2 border-t border-border pt-[1rem]">
        {step > 1 ? (
          <button
            type="button"
            className={iconButtonClass}
            aria-label="Back"
            onClick={goBack}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        ) : null}

        {step === 1 ? (
          <Button
            type="button"
            className="flex-1"
            disabled={!step1Valid}
            onClick={goNext}
          >
            Continue
          </Button>
        ) : null}

        {step === 2 ? (
          <Button
            type="button"
            className="flex-1"
            disabled={!step2Valid}
            onClick={goNext}
          >
            Continue
          </Button>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-1 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={saving}
              onClick={handleSaveDraft}
            >
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={finalizing || !step3Valid}
              onClick={handleFinalize}
            >
              {finalizing ? "Finalizing..." : "Confirm"}
            </Button>
          </div>
        ) : null}
      </div>

      <MakeBillFriendPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        friends={friends}
        selectedIds={selectedFriends.map((friend) => friend.id)}
        onConfirm={confirmFriends}
      />

      <MakeBillDateSheet
        open={dateOpen}
        onClose={() => setDateOpen(false)}
        value={billDate}
        onSelect={setBillDateState}
      />

      <MakeBillTaxSheet
        open={taxOpen}
        onClose={() => setTaxOpen(false)}
        mode={billTaxMode}
        onModeChange={setBillTaxMode}
        percentValue={taxPercent}
        onPercentChange={setTaxPercent}
        fixedValue={fixedBillTaxAmount}
        onFixedChange={setFixedBillTaxAmount}
      />

      <MakeBillPreviewSheet
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        result={preview}
        merchantName={merchantName.trim()}
        billDate={billDate ? formatDateLong(billDate) : ""}
        finalizedId={finalizedId}
      />
    </div>
  );
}