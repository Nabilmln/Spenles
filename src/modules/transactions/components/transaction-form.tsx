"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useToastActionState } from "@/components/ui/toast";
import { createTransferAction } from "@/modules/accounts/actions/transfer-actions";
import type { TransactionActionState } from "../actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fieldClass, fieldLabelClass, formMessageClass, inputClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatIdr } from "@/lib/money/format-idr";
import { formatDateLong } from "@/lib/dates/format-id";
import { AmountCalculatorSheet } from "./amount-calculator-sheet";
import {
  AccountSelectionSheet,
  CategorySelectionSheet,
} from "./selection-sheets";
import { SingleDateCalendar } from "@/components/ui/single-date-calendar";
import { BottomSheet } from "@/components/ui/bottom-sheet";

const modeLabelClass =
  "relative flex flex-1 min-w-[6.5rem] min-h-[2.55rem] cursor-pointer items-center justify-center rounded-[.7rem] border border-border bg-surface-subtle p-[.45rem_.6rem] text-center text-[.78rem] font-medium text-muted focus-within:outline-2 focus-within:outline-primary-500 focus-within:outline-offset-2";

const directionLabelClass =
  "relative flex flex-1 min-w-[6.5rem] min-h-[2.55rem] cursor-pointer items-center justify-center rounded-[.7rem] border border-border bg-surface-subtle p-[.45rem_.6rem] text-center text-[.78rem] font-medium text-muted";

const modeActiveClass = "border-primary-500 bg-primary-50 text-primary-700";

type Option = { id: string; name: string; type?: string };
export type TransactionFormCategory = Option & {
  type: "income" | "expense";
  icon: string | null;
  color: string | null;
};
type FlowType = "expense" | "income" | "savings";

function sheetFieldClass() {
  return cn(
    inputClass,
    "flex min-h-[2.9rem] cursor-pointer items-center justify-between gap-[.5rem] rounded-[.72rem] bg-white! p-[.72rem_.85rem] text-left dark:bg-surface!",
  );
}

export function TransactionForm({
  action,
  accounts,
  categories,
  initial,
  defaultDate,
}: {
  action: (state: TransactionActionState, data: FormData) => Promise<TransactionActionState>;
  accounts: Option[];
  categories: TransactionFormCategory[];
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
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [accountId, setAccountId] = useState(initial?.accountId ?? "");
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [destinationAccountId, setDestinationAccountId] = useState("");

  const [amountSheet, setAmountSheet] = useState(false);
  const [categorySheet, setCategorySheet] = useState(false);
  const [accountSheet, setAccountSheet] = useState(false);
  const [dateSheet, setDateSheet] = useState(false);
  const [sourceSheet, setSourceSheet] = useState(false);
  const [destinationSheet, setDestinationSheet] = useState(false);

  const matchingCategories = useMemo(
    () => categories.filter((item) => item.type === type),
    [categories, type],
  );

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

  const selectedCategory = matchingCategories.find((item) => item.id === categoryId);
  const selectedAccount = spendingAccounts.find((item) => item.id === accountId);
  const selectedSource = accounts.find((item) => item.id === sourceAccountId);
  const selectedDestination = accounts.find((item) => item.id === destinationAccountId);

  return (
    <>
      <form
        action={formAction}
        className="grid gap-[1rem] text-[.9rem]"
        aria-busy={pending}
      >
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

        <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
          <legend className="mb-[.45rem] w-full text-[.8rem] font-medium">Transaction type</legend>
          {(["expense", "income"] as const).map((value) => (
            <label key={value} className={cn(modeLabelClass, type === value && modeActiveClass)}>
              <input
                type="radio"
                name="type"
                value={value}
                checked={type === value}
                onChange={() => setType(value)}
                className="pointer-events-none absolute opacity-0"
              />
              {value === "expense" ? "Payment" : "Income"}
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
                className="pointer-events-none absolute opacity-0"
              />
              Saving
            </label>
          ) : null}
        </fieldset>

        {type === "savings" ? (
          <>
            <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
              <legend className="mb-[.45rem] w-full text-[.8rem] font-medium">Fund direction</legend>
              {(["save", "withdraw"] as const).map((value) => (
                <label key={value} className={cn(directionLabelClass, direction === value && modeActiveClass)}>
                  <input
                    type="radio"
                    name="direction"
                    value={value}
                    checked={direction === value}
                    onChange={() => setDirection(value)}
                    className="pointer-events-none absolute opacity-0"
                  />
                  {value === "save" ? "Save" : "Withdraw"}
                </label>
              ))}
            </fieldset>
            {!hasSavings ? (
              <p className={formMessageClass}>
                Create a Savings account on the Accounts page before recording savings.
              </p>
            ) : null}

            <AmountField
              amount={amount}
              onOpen={() => setAmountSheet(true)}
              disabled={pending}
            />

            <div className={fieldClass}>
              <span className={cn(fieldLabelClass, "text-[.8rem]")}>From account</span>
              <button
                type="button"
                className={sheetFieldClass()}
                disabled={!hasSavings}
                onClick={() => setSourceSheet(true)}
              >
                <span className="min-w-0 truncate">{selectedSource?.name ?? "Choose account"}</span>
                <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
              </button>
              <input type="hidden" name="sourceAccountId" value={sourceAccountId} />
            </div>

            <div className={fieldClass}>
              <span className={cn(fieldLabelClass, "text-[.8rem]")}>To savings account</span>
              <button
                type="button"
                className={sheetFieldClass()}
                disabled={!hasSavings}
                onClick={() => setDestinationSheet(true)}
              >
                <span className="min-w-0 truncate">{selectedDestination?.name ?? "Choose account"}</span>
                <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
              </button>
              <input type="hidden" name="destinationAccountId" value={destinationAccountId} />
            </div>

            <DateField date={date} onOpen={() => setDateSheet(true)} inputName="transferredAt" />
            <NoteField />
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={pending || !hasSavings} className="min-h-[2.6rem] flex-1 p-[.55rem_.9rem] text-[.88rem]">
                {pending ? "Saving..." : "Add Transaction"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <AmountField amount={amount} onOpen={() => setAmountSheet(true)} disabled={pending} />

            <div className={fieldClass}>
              <span className={cn(fieldLabelClass, "text-[.8rem]")}>Category</span>
              <button
                type="button"
                className={sheetFieldClass()}
                onClick={() => setCategorySheet(true)}
              >
                <span className="min-w-0 truncate">{selectedCategory?.name ?? "Choose Category"}</span>
                <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
              </button>
              <input type="hidden" name="categoryId" value={categoryId} />
            </div>

            <div className={fieldClass}>
              <span className={cn(fieldLabelClass, "text-[.8rem]")}>Account</span>
              <button
                type="button"
                className={sheetFieldClass()}
                onClick={() => setAccountSheet(true)}
              >
                <span className="min-w-0 truncate">{selectedAccount?.name ?? "Choose Account"}</span>
                <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
              </button>
              <input type="hidden" name="accountId" value={accountId} />
            </div>

            <NoteField />
            <DateField date={date} onOpen={() => setDateSheet(true)} inputName="transactionAt" />

            <Button type="submit" disabled={pending} className="min-h-[2.6rem] p-[.55rem_.9rem] text-[.88rem]">
              {pending ? "Saving..." : "Add Transaction"}
            </Button>
          </>
        )}
      </form>

      <AmountCalculatorSheet
        open={amountSheet}
        onClose={() => setAmountSheet(false)}
        onCommit={setAmount}
      />

      <CategorySelectionSheet
        open={categorySheet}
        onClose={() => setCategorySheet(false)}
        categories={matchingCategories}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />

      <AccountSelectionSheet
        open={accountSheet}
        onClose={() => setAccountSheet(false)}
        accounts={spendingAccounts}
        selectedId={accountId}
        onSelect={setAccountId}
      />

      <AccountSelectionSheet
        open={sourceSheet}
        onClose={() => setSourceSheet(false)}
        accounts={sourceAccounts}
        selectedId={sourceAccountId}
        onSelect={setSourceAccountId}
      />

      <AccountSelectionSheet
        open={destinationSheet}
        onClose={() => setDestinationSheet(false)}
        accounts={destinationAccounts}
        selectedId={destinationAccountId}
        onSelect={setDestinationAccountId}
      />

      <SingleDateSheet
        open={dateSheet}
        onClose={() => setDateSheet(false)}
        date={date}
        onSelect={setDate}
        inputName={type === "savings" ? "transferredAt" : "transactionAt"}
      />
    </>
  );
}

function AmountField({
  amount,
  onOpen,
  disabled,
}: {
  amount: string;
  onOpen: () => void;
  disabled?: boolean;
}) {
  return (
    <div className={fieldClass}>
      <label className={cn(fieldLabelClass, "text-[.8rem]")}>Amount</label>
      <button
        type="button"
        className={cn(inputClass, "flex min-h-[2.9rem] cursor-pointer items-center justify-between gap-[.5rem] rounded-[.72rem] bg-white! p-[.72rem_.85rem] text-left dark:bg-surface!")}
        disabled={disabled}
        onClick={onOpen}
        aria-haspopup="dialog"
      >
        <span className="min-w-0 truncate text-[.95rem] font-medium">
          {amount ? formatIdr(amount) : "Enter amount"}
        </span>
        <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
      </button>
      <input type="hidden" name="amount" value={amount} />
    </div>
  );
}

function DateField({
  date,
  onOpen,
  inputName,
}: {
  date: string;
  onOpen: () => void;
  inputName: string;
}) {
  return (
    <div className={fieldClass}>
      <label className={cn(fieldLabelClass, "text-[.8rem]")}>Date</label>
      <button
        type="button"
        className={sheetFieldClass()}
        onClick={onOpen}
        aria-haspopup="dialog"
      >
        <span className="min-w-0 truncate">{date ? formatDateLong(date) : "Select date"}</span>
        <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
      </button>
      <input type="hidden" name={inputName} value={date} />
    </div>
  );
}

function NoteField() {
  return (
    <div className={fieldClass}>
      <label htmlFor="tx-note" className={cn(fieldLabelClass, "text-[.8rem]")}>
        Description (optional)
      </label>
      <Input
        id="tx-note"
        name="note"
        className="min-h-[2.9rem]"
        maxLength={500}
        placeholder="Add a description..."
      />
    </div>
  );
}

function SingleDateSheet({
  open,
  onClose,
  date,
  onSelect,
  inputName,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  onSelect: (value: string) => void;
  inputName: string;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Select Date"
      ariaLabel="Select date"
      zIndex="z-[85]"
    >
      <SingleDateCalendar
        value={date}
        onChange={(next) => {
          onSelect(next);
          onClose();
        }}
      />
      <input type="hidden" name={inputName} value={date} />
    </BottomSheet>
  );
}