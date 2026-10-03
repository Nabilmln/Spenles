"use server";

import { requireSessionUser } from "@/lib/auth/require-session";
import { getReportCategoryBreakdown } from "@/modules/reports";
import { parseReportParams } from "@/modules/reports";

export type CategoryBreakdownResult = {
  ok: true;
  type: "income" | "expense";
  totalIdr: string;
  categories: {
    categoryId: string;
    name: string;
    amountIdr: string;
    shareBps: number;
  }[];
};

export type CategoryBreakdownError = {
  ok: false;
  reason: "invalid-input";
};

export type CategoryBreakdownActionResponse =
  | CategoryBreakdownResult
  | CategoryBreakdownError;

export async function getCategoryBreakdownAction(input: {
  from: string;
  to: string;
  categoryType: string;
}): Promise<CategoryBreakdownActionResponse> {
  if (input.categoryType !== "income" && input.categoryType !== "expense") {
    return { ok: false, reason: "invalid-input" };
  }
  if (!parseReportParams(new URLSearchParams({
    period: "custom",
    from: input.from,
    to: input.to,
  }))) {
    return { ok: false, reason: "invalid-input" };
  }
  const user = await requireSessionUser();
  const breakdown = await getReportCategoryBreakdown(
    user.id,
    input.from,
    input.to,
    input.categoryType,
  );
  return {
    ok: true,
    totalIdr: breakdown.totalIdr,
    type: breakdown.type,
    categories: breakdown.categories,
  };
}
