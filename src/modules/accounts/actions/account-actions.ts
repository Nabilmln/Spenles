"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { requireSessionUser } from "@/lib/auth/require-session";
import { accountIdSchema, accountSchema } from "../schemas/account";
import {
  createOwnedAccount,
  setOwnedAccountStatus,
  updateOwnedAccount,
} from "../services/account-mutations";

export type AccountActionState = { error?: string };

function values(formData: FormData) {
  return {
    name: formData.get("name"),
    type: formData.get("type"),
    openingBalance: formData.get("openingBalance"),
  };
}

function invalidateAccounts(accountId?: string) {
  revalidatePath("/accounts");
  if (accountId) revalidatePath(`/accounts/${accountId}`);
  revalidatePath("/transactions");
  revalidatePath("/recurring-transactions");
  revalidatePath("/dashboard");
}

export async function createAccountAction(
  _state: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const user = await requireSessionUser();
  const parsed = accountSchema.safeParse(values(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const created = await createOwnedAccount(db, user.id, {
      ...parsed.data,
      openingBalance: BigInt(parsed.data.openingBalance),
    });
    if (!created) return { error: "Account could not be created." };
  } catch {
    return { error: "Account could not be created." };
  }
  invalidateAccounts();
  redirect("/accounts");
}

export async function updateAccountAction(
  _state: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const user = await requireSessionUser();
  const id = accountIdSchema.safeParse(formData.get("id"));
  const parsed = accountSchema.safeParse(values(formData));
  if (!id.success || !parsed.success) {
    return {
      error: parsed.success ? "Account not found." : parsed.error.issues[0]?.message,
    };
  }
  try {
    const updated = await updateOwnedAccount(db, user.id, id.data, {
      ...parsed.data,
      openingBalance: BigInt(parsed.data.openingBalance),
    });
    if (!updated) {
      return {
        error:
          "Account not found, or opening balance cannot be changed once the account has history.",
      };
    }
  } catch {
    return { error: "Account could not be updated." };
  }
  invalidateAccounts(id.data);
  redirect(`/accounts/${id.data}`);
}

async function setAccountStatus(
  formData: FormData,
  status: "active" | "archived",
): Promise<AccountActionState> {
  const user = await requireSessionUser();
  const id = accountIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Account not found." };
  try {
    const result = await setOwnedAccountStatus(db, user.id, id.data, status);
    if (!result.ok) {
      return {
        error:
          status === "archived"
            ? "The last active account cannot be archived."
            : "Account not found.",
      };
    }
  } catch {
    return { error: "Account status could not be updated." };
  }
  invalidateAccounts(id.data);
  return {};
}

export async function archiveAccountAction(
  _state: AccountActionState,
  formData: FormData,
) {
  return setAccountStatus(formData, "archived");
}

export async function restoreAccountAction(
  _state: AccountActionState,
  formData: FormData,
) {
  return setAccountStatus(formData, "active");
}
