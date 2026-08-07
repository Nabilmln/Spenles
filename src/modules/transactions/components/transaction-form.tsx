"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { calculateExpression } from "../services/calculator";
import { createTransferAction } from "@/modules/accounts/actions/transfer-actions";
import type { TransactionActionState } from "../actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { formatIdr } from "@/lib/money/format-idr";

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
  const [state, formAction, pending] = useActionState<TransactionActionState, FormData>(
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
      className="settings-form transaction-form"
      aria-busy={pending}
    >
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

      <fieldset className="tx-mode-selector">
        <legend>Jenis transaksi</legend>
        {(["expense", "income"] as const).map((value) => (
          <label key={value} className={type === value ? "tx-mode-active" : ""}>
            <input
              type="radio"
              name="type"
              value={value}
              checked={type === value}
              onChange={() => setType(value)}
            />
            {value === "expense" ? "Pengeluaran" : "Pendapatan"}
          </label>
        ))}
        {!initial ? (
          <label className={type === "savings" ? "tx-mode-active" : ""}>
            <input
              type="radio"
              name="type"
              value="savings"
              checked={type === "savings"}
              onChange={() => setType("savings")}
            />
            Tabungan
          </label>
        ) : null}
      </fieldset>

      <FormMessage id="form-error">{state.error}</FormMessage>

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
          <div className="field">
            <label htmlFor="accountId">Sumber keuangan</label>
            <select className="input" id="accountId" name="accountId" defaultValue={initial?.accountId} required>
              <option value="">Pilih akun</option>
              {spendingAccounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="categoryId">
              {type === "expense" ? "Kategori pengeluaran" : "Kategori pendapatan"}
            </label>
            <select
              className="input"
              id="categoryId"
              name="categoryId"
              defaultValue={initial?.categoryId}
              key={`${type}-${initial?.categoryId}`}
              required
            >
              <option value="">Pilih kategori</option>
              {matchingCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="transactionAt">Tanggal</label>
            <Input
              id="transactionAt"
              name="transactionAt"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
            <p className="field-hint">Waktu pengisian otomatis mengikuti pukul saat ini di zona Asia/Jakarta.</p>
          </div>
          <div className="field">
            <label htmlFor="note">Keterangan (opsional)</label>
            <textarea className="input textarea" id="note" name="note" maxLength={500} defaultValue={initial?.note} />
          </div>
          <div className="form-actions">
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Konfirmasi"}
            </Button>
            <Link className="button button-secondary" href="/transactions">Batal</Link>
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
    <div className="field">
      <label htmlFor="amount-control">Nominal</label>
      <button
        type="button"
        id="amount-control"
        ref={amountRef}
        className="amount-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Isi jumlah nominal menggunakan kalkulator"
      >
        <span className="input-display">{amount ? formatIdr(amount) : "Ketik nominal"}</span>
      </button>
      {amount ? (
        <input type="hidden" name="amount" value={amount} />
      ) : (
        <input type="hidden" name="amount" value="" />
      )}

      {open ? (
        <div
          className="calc-backdrop"
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
          <div className="calc-sheet">
            <div className="calc-heading">
              <strong>Kalkulator jumlah</strong>
              <button
                type="button"
                className="calc-close"
                aria-label="Tutup kalkulator"
                onClick={() => {
                  setOpen(false);
                  amountRef.current?.focus();
                }}
              >
                Tutup
              </button>
            </div>
            <div className="calc-display">
              <input
                id="calc-expression"
                className="calc-expression"
                aria-label="Ekspresi kalkulator"
                value={expression}
                onChange={(event) => setExpression(event.target.value)}
                placeholder="25000 + 18000 + 7500"
                readOnly
              />
              <p className="calc-result" aria-live="polite">
                {result ? formatIdr(result) : "—"}
              </p>
            </div>
            <FormMessage>{calculatorError}</FormMessage>
            <div className="calc-keypad">
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
            <p className="field-hint">Operator: +, −, ×, ÷, dan tanda kurung. Hasil dibulatkan ke rupiah terdekat.</p>
            <Button
              type="button"
              variant="primary"
              className="calc-done"
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
    <button type="button" className="calc-key" aria-label={aria} onClick={onClick}>
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
      <fieldset className="radiogroup direction">
        <legend>Arah dana</legend>
        {(["save", "withdraw"] as const).map((value) => (
          <label key={value} className={direction === value ? "tx-mode-active" : ""}>
            <input
              type="radio"
              name="direction"
              value={value}
              checked={direction === value}
              onChange={() => setDirection(value)}
            />
            {value === "save" ? "Menabung" : "Tarik dana"}
          </label>
        ))}
      </fieldset>
      {!hasSavings ? (
        <p className="form-message">
          Buat akun berjenis Tabungan terlebih dahulu di halaman Akun sebelum mencatat tabungan.
        </p>
      ) : null}
      <AmountField amount={amount} setAmount={setAmount} pending={pending} />
      <div className="field">
        <label htmlFor="sourceAccountId">Dari akun</label>
        <select className="input" id="sourceAccountId" name="sourceAccountId" defaultValue="" required disabled={!hasSavings}>
          <option value="">Pilih akun</option>
          {sourceAccounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="destinationAccountId">Ke akun tabungan</label>
        <select className="input" id="destinationAccountId" name="destinationAccountId" defaultValue="" required disabled={!hasSavings}>
          <option value="">Pilih akun</option>
          {destinationAccounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="transferredAt">Tanggal</label>
        <Input
          id="transferredAt"
          name="transferredAt"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
        <p className="field-hint">Waktu pengisian diambil mengikuti pukul saat ini di zona Asia/Jakarta.</p>
      </div>
      <div className="field">
        <label htmlFor="note">Keterangan (opsional)</label>
        <textarea className="input textarea" id="note" name="note" maxLength={500} />
      </div>
      <div className="form-actions">
        <Button type="submit" disabled={pending || !hasSavings} aria-describedby={errorId}>
          {pending ? "Menyimpan..." : "Konfirmasi"}
        </Button>
        <Link className="button button-secondary" href="/transactions">Batal</Link>
      </div>
    </>
  );
}