"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToastActionState } from "@/components/ui/toast";
import { calculateExpression } from "../services/calculator";
import { createTransferAction } from "@/modules/accounts/actions/transfer-actions";
import type { TransactionActionState } from "../actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { Select } from "@/components/ui/select";
import { buttonClass, fieldClass, fieldHintClass, fieldLabelClass, formMessageClass, inputDisplayClass, textareaClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatIdr } from "@/lib/money/format-idr";

const modeLabelClass =
  "relative flex flex-1 min-w-[6.5rem] min-h-[2.55rem] cursor-pointer items-center justify-center rounded-[.7rem] border border-border bg-surface-subtle p-[.45rem_.6rem] text-center text-[.78rem] font-medium text-muted focus-within:outline-2 focus-within:outline-primary-500 focus-within:outline-offset-2";

const directionLabelClass =
  "relative flex flex-1 min-w-[6.5rem] min-h-[2.55rem] cursor-pointer items-center justify-center rounded-[.7rem] border border-border bg-surface-subtle p-[.45rem_.6rem] text-center text-[.78rem] font-medium text-muted";

const modeActiveClass = "border-primary-500 bg-primary-50 text-primary-700";

type Option = { id: string; name: string; type?: string };
type CategoryOption = Option & { type: "income" | "expense" };
type FlowType = "expense" | "income" | "savings";

export function TransactionForm({
  action,
  accounts,
  categories,
  initial,
  defaultDate,
}: {
  action: (state: TransactionActionState, data: FormData) => Promise<TransactionActionState>;
  accounts: Option[];
  categories: CategoryOption[];
  initial?: {
    id: string;
    type: "income" | "expense";
    amount: string;
    accountId: string;
    categoryId: string;
    transactionAt: string;
    note: string;
  };
  defaultDate?: string;
}) {
  const [, formAction, pending] = useToastActionState<TransactionActionState, FormData>(
    async (previous, data) => {
      if (data.get("type") === "savings") {
        return createTransferAction(previous, data);
      }
      return action(previous, data);
    },
    {},
  );
  const [type, setType] = useState<FlowType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [date, setDate] = useState(initial?.transactionAt.slice(0, 10) ?? defaultDate ?? "");
  const [direction, setDirection] = useState<"save" | "withdraw">("save");
  const matchingCategories = useMemo(() => categories.filter((item) => item.type === type), [categories, type]);

  const spendingAccounts = useMemo(
    () => accounts.filter((item) => item.type !== "savings"),
    [accounts],
  );
  const savingsAccounts = useMemo(
    () => accounts.filter((item) => item.type === "savings"),
    [accounts],
  );
  const hasSavings = savingsAccounts.length > 0;
  const sourceAccounts = direction === "save" ? spendingAccounts : savingsAccounts;
  const destinationAccounts = direction === "save" ? savingsAccounts : spendingAccounts;

  return (
    <form
      action={formAction}
      className="grid gap-[1.25rem] text-[.9rem]"
      aria-busy={pending}
    >
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

      <fieldset className="flex flex-wrap gap-2 m-0 p-0 border-0">
        <legend className="w-full mb-[.45rem] text-[.8rem] font-medium">Jenis transaksi</legend>
        {(["expense", "income"] as const).map((value) => (
          <label key={value} className={cn(modeLabelClass, type === value && modeActiveClass)}>
            <input
              type="radio"
              name="type"
              value={value}
              checked={type === value}
              onChange={() => setType(value)}
              className="absolute opacity-0 pointer-events-none"
            />
            {value === "expense" ? "Pengeluaran" : "Pendapatan"}
          </label>
        ))}
        {!initial ? (
          <label className={cn(modeLabelClass, type === "savings" && modeActiveClass)}>
            <input
              type="radio"
              name="type"
              value="savings"
              checked={type === "savings"}
              onChange={() => setType("savings")}
              className="absolute opacity-0 pointer-events-none"
            />
            Tabungan
          </label>
        ) : null}
      </fieldset>

      {type === "savings" ? (
        <SavingsFields
          direction={direction}
          setDirection={setDirection}
          hasSavings={hasSavings}
          sourceAccounts={sourceAccounts}
          destinationAccounts={destinationAccounts}
          amount={amount}
          setAmount={setAmount}
          pending={pending}
          date={date}
          setDate={setDate}
          errorId="form-error"
        />
      ) : (
        <>
          <AmountField amount={amount} setAmount={setAmount} pending={pending} />
          <div className={fieldClass}>
            <label htmlFor="accountId" className={cn(fieldLabelClass, "text-[.8rem]")}>Sumber keuangan</label>
            <Select id="accountId" name="accountId" defaultValue={initial?.accountId} required>
              <option value="">Pilih akun</option>
              {spendingAccounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </Select>
          </div>
          <div className={fieldClass}>
            <label htmlFor="categoryId" className={cn(fieldLabelClass, "text-[.8rem]")}>
              {type === "expense" ? "Kategori pengeluaran" : "Kategori pendapatan"}
            </label>
            <Select
              id="categoryId"
              name="categoryId"
              defaultValue={initial?.categoryId}
              key={`${type}-${initial?.categoryId}`}
              required
            >
              <option value="">Pilih kategori</option>
              {matchingCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </Select>
          </div>
          <div className={fieldClass}>
            <label htmlFor="transactionAt" className={cn(fieldLabelClass, "text-[.8rem]")}>Tanggal</label>
            <Input
              id="transactionAt"
              name="transactionAt"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="min-h-[2.7rem] text-[.88rem]"
            />
            <p className={cn(fieldHintClass, "text-[.72rem] mt-[.35rem]")}>Waktu pengisian otomatis mengikuti pukul saat ini di zona Asia/Jakarta.</p>
          </div>
          <div className={fieldClass}>
            <label htmlFor="note" className={cn(fieldLabelClass, "text-[.8rem]")}>Keterangan (opsional)</label>
            <textarea className={cn(textareaClass, "min-h-[2.7rem] text-[.88rem]")} id="note" name="note" maxLength={500} defaultValue={initial?.note} />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={pending} className="min-h-[2.6rem] p-[.55rem_.9rem] text-[.88rem]">
              {pending ? "Menyimpan..." : "Konfirmasi"}
            </Button>
            <Link className={cn(buttonClass("secondary"), "min-h-[2.6rem] p-[.55rem_.9rem] text-[.88rem]")} href="/transactions">Batal</Link>
          </div>
        </>
      )}
    </form>
  );
}

function AmountField({
  amount,
  setAmount,
  pending,
}: {
  amount: string;
  setAmount: (value: string) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [expression, setExpression] = useState("");
  const [calculatorError, setCalculatorError] = useState("");
  const amountRef = useRef<HTMLButtonElement>(null);

  const result = useMemo(() => {
    if (!expression.trim()) return null;
    try {
      return calculateExpression(expression);
    } catch {
      return null;
    }
  }, [expression]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => document.getElementById("calc-expression")?.focus());
    }
  }, [open]);

  function commit() {
    if (!result) {
      setCalculatorError(calculatorError || "Ketik jumlah melalui tombol angka agar bisa dihitung.");
      return;
    }
    setAmount(result);
    setOpen(false);
    setExpression("");
    setCalculatorError("");
    amountRef.current?.focus();
  }

  function append(char: string) {
    setExpression((current) => current + char);
    setCalculatorError("");
  }

  function backspace() {
    setExpression((current) => current.replace(/\s+$/u, "").slice(0, -1));
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        amountRef.current?.focus();
      }
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className={fieldClass}>
      <label htmlFor="amount-control" className={cn(fieldLabelClass, "text-[.8rem]")}>Nominal</label>
      <button
        type="button"
        id="amount-control"
        ref={amountRef}
        className="w-full min-h-[2.9rem] cursor-pointer rounded-[.72rem] border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Isi jumlah nominal menggunakan kalkulator"
      >
        <span className={`${inputDisplayClass} text-foreground text-[1.05rem]`}>{amount ? formatIdr(amount) : "Ketik nominal"}</span>
      </button>
      {amount ? (
        <input type="hidden" name="amount" value={amount} />
      ) : (
        <input type="hidden" name="amount" value="" />
      )}

      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-[rgb(15_23_42/45%)] p-4 min-[861px]:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Kalkulator jumlah"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setOpen(false);
              amountRef.current?.focus();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-[30rem] overflow-y-auto rounded-t-[1.25rem] rounded-b-[1.1rem] border border-border bg-surface p-5 shadow-card min-[861px]:rounded-[1.25rem_1.25rem_1.1rem_1.1rem]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <strong className="text-[.95rem]">Kalkulator jumlah</strong>
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent font-medium text-muted hover:text-foreground"
                aria-label="Tutup kalkulator"
                onClick={() => {
                  setOpen(false);
                  amountRef.current?.focus();
                }}
              >
                Tutup
              </button>
            </div>
            <div className="mb-[.85rem] grid gap-[.3rem] rounded-[.8rem] border border-border bg-surface-subtle p-[.9rem]">
              <input
                id="calc-expression"
                className="w-full min-h-[1.6rem] border-0 bg-transparent p-0 text-[.85rem] font-medium text-muted outline-none"
                aria-label="Ekspresi kalkulator"
                value={expression}
                onChange={(event) => setExpression(event.target.value)}
                placeholder="25000 + 18000 + 7500"
                readOnly
              />
              <p className="m-0 text-[1.15rem] font-medium tracking-[-.03em]" aria-live="polite">
                {result ? formatIdr(result) : "—"}
              </p>
            </div>
            <FormMessage>{calculatorError}</FormMessage>
            <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-2">
              {["7", "8", "9", "/"].map((key) => <KeypadButton key={key} label={key} aria={key} onClick={() => append(key)} />)}
              {["4", "5", "6", "*"].map((key) => <KeypadButton key={key} label={key} aria={key} onClick={() => append(key)} />)}
              {["1", "2", "3", "-"].map((key) => <KeypadButton key={key} label={key} aria={key} onClick={() => append(key)} />)}
              {["0"].map((key) => <KeypadButton key={key} label={key} aria={key} onClick={() => append(key)} />)}
              <KeypadButton label="C" aria="Bersihkan" onClick={() => { setExpression(""); setCalculatorError(""); }} />
              <KeypadButton label="⌫" aria="Hapus karakter terakhir" onClick={backspace} />
              <KeypadButton label="+" aria="Tambah" onClick={() => append("+")} />
              <KeypadButton
                label="("
                aria="Kurung buka"
                onClick={() => append("(")}
              />
              <KeypadButton
                label=")"
                aria="Kurung tutup"
                onClick={() => append(")")}
              />
            </div>
            <p className={cn(fieldHintClass, "text-[.72rem] mt-[.35rem]")}>Operator: +, −, ×, ÷, dan tanda kurung. Hasil dibulatkan ke rupiah terdekat.</p>
            <Button
              type="button"
              variant="primary"
              className="w-full mt-[.9rem] min-h-[2.6rem] p-[.55rem_.9rem] text-[.88rem]"
              disabled={pending || !result}
              onClick={commit}
            >
              Selesai
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function KeypadButton({
  label,
  aria,
  onClick,
}: {
  label: string;
  aria: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="min-h-[2.85rem] cursor-pointer rounded-[.7rem] border border-border bg-surface-subtle p-[.5rem] text-[.92rem] font-medium text-foreground hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2" aria-label={aria} onClick={onClick}>
      {label}
    </button>
  );
}

function SavingsFields({
  direction,
  setDirection,
  hasSavings,
  sourceAccounts,
  destinationAccounts,
  amount,
  setAmount,
  pending,
  date,
  setDate,
  errorId,
}: {
  direction: "save" | "withdraw";
  setDirection: (value: "save" | "withdraw") => void;
  hasSavings: boolean;
  sourceAccounts: Option[];
  destinationAccounts: Option[];
  amount: string;
  setAmount: (value: string) => void;
  pending: boolean;
  date: string;
  setDate: (value: string) => void;
  errorId: string;
}) {
  return (
    <>
      <fieldset className="flex flex-wrap gap-2 m-0 p-0 border-0">
        <legend className="w-full mb-[.45rem] text-[.8rem] font-medium">Arah dana</legend>
        {(["save", "withdraw"] as const).map((value) => (
          <label key={value} className={cn(directionLabelClass, direction === value && modeActiveClass)}>
            <input
              type="radio"
              name="direction"
              value={value}
              checked={direction === value}
              onChange={() => setDirection(value)}
              className="absolute opacity-0 pointer-events-none"
            />
            {value === "save" ? "Menabung" : "Tarik dana"}
          </label>
        ))}
      </fieldset>
      {!hasSavings ? (
        <p className={formMessageClass}>
          Buat akun berjenis Tabungan terlebih dahulu di halaman Akun sebelum mencatat tabungan.
        </p>
      ) : null}
      <AmountField amount={amount} setAmount={setAmount} pending={pending} />
      <div className={fieldClass}>
        <label htmlFor="sourceAccountId" className={cn(fieldLabelClass, "text-[.8rem]")}>Dari akun</label>
        <Select id="sourceAccountId" name="sourceAccountId" defaultValue="" required disabled={!hasSavings}>
          <option value="">Pilih akun</option>
          {sourceAccounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
      </div>
      <div className={fieldClass}>
        <label htmlFor="destinationAccountId" className={cn(fieldLabelClass, "text-[.8rem]")}>Ke akun tabungan</label>
        <Select id="destinationAccountId" name="destinationAccountId" defaultValue="" required disabled={!hasSavings}>
          <option value="">Pilih akun</option>
          {destinationAccounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
      </div>
      <div className={fieldClass}>
        <label htmlFor="transferredAt" className={cn(fieldLabelClass, "text-[.8rem]")}>Tanggal</label>
        <Input
          id="transferredAt"
          name="transferredAt"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          className="min-h-[2.7rem] text-[.88rem]"
        />
        <p className={cn(fieldHintClass, "text-[.72rem] mt-[.35rem]")}>Waktu pengisian diambil mengikuti pukul saat ini di zona Asia/Jakarta.</p>
      </div>
      <div className={fieldClass}>
        <label htmlFor="note" className={cn(fieldLabelClass, "text-[.8rem]")}>Keterangan (opsional)</label>
        <textarea className={cn(textareaClass, "min-h-[2.7rem] text-[.88rem]")} id="note" name="note" maxLength={500} />
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending || !hasSavings} aria-describedby={errorId} className="min-h-[2.6rem] p-[.55rem_.9rem] text-[.88rem]">
          {pending ? "Menyimpan..." : "Konfirmasi"}
        </Button>
        <Link className={cn(buttonClass("secondary"), "min-h-[2.6rem] p-[.55rem_.9rem] text-[.88rem]")} href="/transactions">Batal</Link>
      </div>
    </>
  );
}
