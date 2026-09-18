"use server";

import { requireSessionUser } from "@/lib/auth/require-session";
import { getReportCategoryBreakdown } from "@/modules/reports";
import {
  todayJakartaDate,
} from "@/modules/reports/lib/report-date";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/u;

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
  const today = todayJakartaDate();
  if (
    !DATE_KEY.test(input.from) ||
    !DATE_KEY.test(input.to) ||
    input.from > today ||
    input.to > today
  ) {
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