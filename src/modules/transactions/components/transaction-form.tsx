"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { calculateExpression } from "../services/calculator";
import { createTransferAction } from "@/modules/accounts/actions/transfer-actions";
import type { TransactionActionState } from "../actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";

type Option = { id: string; name: string; type?: string };
type CategoryOption = Option & { type: "income" | "expense" };
type FlowType = "expense" | "income" | "savings";

export function TransactionForm({
  action,
  accounts,
  categories,
  initial,
  defaultTransactionAt,
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
  defaultTransactionAt?: string;
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
  const [expression, setExpression] = useState("");
  const [calculatorError, setCalculatorError] = useState("");
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

  function applyCalculator() {
    try {
      setAmount(calculateExpression(expression));
      setCalculatorError("");
    } catch (error) {
      setCalculatorError(error instanceof Error ? error.message : "Perhitungan tidak valid.");
    }
  }

  return (
    <form action={formAction} className="settings-form transaction-form">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <FormMessage>{state.error}</FormMessage>
      <fieldset className="type-selector">
        <legend>Jenis transaksi</legend>
        {(["expense", "income"] as const).map((value) => (
          <label key={value} className={`type-option ${type === value ? "type-option-active" : ""}`}>
            <input type="radio" name="type" value={value} checked={type === value} onChange={() => setType(value)} />
            {value === "expense" ? "Pengeluaran" : "Pemasukan"}
          </label>
        ))}
        {!initial ? (
          <label className={`type-option ${type === "savings" ? "type-option-active" : ""}`}>
            <input type="radio" name="type" value="savings" checked={type === "savings"} onChange={() => setType("savings")} />
            Tabungan
          </label>
        ) : null}
      </fieldset>

      {type === "savings" ? (
        <>
          <fieldset className="type-selector">
            <legend>Arah dana</legend>
            {(["save", "withdraw"] as const).map((value) => (
              <label key={value} className={`type-option ${direction === value ? "type-option-active" : ""}`}>
                <input type="radio" name="direction" value={value} checked={direction === value} onChange={() => setDirection(value)} />
                {value === "save" ? "Menabung" : "Tarik dana"}
              </label>
            ))}
          </fieldset>
          {!hasSavings ? (
            <p className="form-message">
              Buat akun berjenis Tabungan terlebih dahulu di halaman Akun sebelum mencatat tabungan.
            </p>
          ) : null}
          <div className="settings-grid">
            <div className="field">
              <label htmlFor="sourceAccountId">Dari akun</label>
              <select className="input" id="sourceAccountId" name="sourceAccountId" defaultValue="" required disabled={!hasSavings}>
                <option value="">Pilih akun</option>
                {sourceAccounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="destinationAccountId">Ke akun</label>
              <select className="input" id="destinationAccountId" name="destinationAccountId" defaultValue="" required disabled={!hasSavings}>
                <option value="">Pilih akun</option>
                {destinationAccounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="amount">Jumlah (rupiah)</label>
            <Input id="amount" name="amount" inputMode="numeric" pattern="[0-9]+" min="1" value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/gu, ""))} required />
          </div>
          <details className="calculator">
            <summary>Kalkulator jumlah</summary>
            <div className="calculator-row">
              <Input aria-label="Ekspresi kalkulator" value={expression} onChange={(event) => setExpression(event.target.value)} placeholder="25000 + 18000 + 7500" />
              <Button type="button" variant="secondary" onClick={applyCalculator}>Gunakan hasil</Button>
            </div>
            <FormMessage>{calculatorError}</FormMessage>
            <p className="field-hint">Operator: +, −, ×, ÷, dan tanda kurung. Hasil dibulatkan ke rupiah terdekat.</p>
          </details>
          <div className="field">
            <label htmlFor="transferredAt">Tanggal dan waktu</label>
            <Input id="transferredAt" name="transferredAt" type="datetime-local" defaultValue={defaultTransactionAt} required />
          </div>
          <div className="field">
            <label htmlFor="note">Catatan (opsional)</label>
            <textarea className="input textarea" id="note" name="note" maxLength={500} />
          </div>
          <div className="form-actions">
            <Button type="submit" disabled={pending || !hasSavings}>
              {pending ? "Menyimpan..." : "Simpan tabungan"}
            </Button>
            <Link className="button button-secondary" href="/transactions">Batal</Link>
          </div>
        </>
      ) : (
        <>
          <div className="field">
            <label htmlFor="amount">Jumlah (rupiah)</label>
            <Input id="amount" name="amount" inputMode="numeric" pattern="[0-9]+" value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/gu, ""))} required />
          </div>
          <details className="calculator">
            <summary>Kalkulator jumlah</summary>
            <div className="calculator-row">
              <Input aria-label="Ekspresi kalkulator" value={expression} onChange={(event) => setExpression(event.target.value)} placeholder="25000 + 18000 + 7500" />
              <Button type="button" variant="secondary" onClick={applyCalculator}>Gunakan hasil</Button>
            </div>
            <FormMessage>{calculatorError}</FormMessage>
            <p className="field-hint">Operator: +, −, ×, ÷, dan tanda kurung. Hasil dibulatkan ke rupiah terdekat.</p>
          </details>
          <div className="settings-grid">
            <div className="field">
              <label htmlFor="accountId">Akun</label>
              <select className="input" id="accountId" name="accountId" defaultValue={initial?.accountId} required>
                <option value="">Pilih akun</option>
                {spendingAccounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="categoryId">Kategori</label>
              <select className="input" id="categoryId" name="categoryId" defaultValue={initial?.categoryId} key={`${type}-${initial?.categoryId}`} required>
                <option value="">Pilih kategori</option>
                {matchingCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="transactionAt">Tanggal dan waktu</label>
            <Input id="transactionAt" name="transactionAt" type="datetime-local" defaultValue={initial?.transactionAt ?? defaultTransactionAt} required />
          </div>
          <div className="field">
            <label htmlFor="note">Catatan (opsional)</label>
            <textarea className="input textarea" id="note" name="note" maxLength={500} defaultValue={initial?.note} />
          </div>
          <div className="form-actions">
            <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan transaksi"}</Button>
            <Link className="button button-secondary" href="/transactions">Batal</Link>
          </div>
        </>
      )}
    </form>
  );
}
