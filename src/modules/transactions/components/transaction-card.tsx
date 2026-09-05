import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { iconButtonClass } from "@/components/ui/styles";
import {
  TransactionCard,
  type TransactionCardRow,
} from "@/components/transactions/transaction-card";
import { deleteTransactionAction } from "../actions/transaction-actions";

export { TransactionCard, type TransactionCardRow };

export function TransactionActions({
  transaction,
}: {
  transaction: TransactionCardRow;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        aria-label={`Edit ${transaction.categoryName}`}
        className={iconButtonClass}
        href={`/transactions/${transaction.id}/edit`}
      >
        <Pencil size={17} />
      </Link>
      <form action={deleteTransactionAction}>
        <input type="hidden" name="id" value={transaction.id} />
        <button
          aria-label={`Delete ${transaction.categoryName}`}
          className={iconButtonClass}
          type="submit"
        >
          <Trash2 size={17} />
        </button>
      </form>
    </div>
  );
}