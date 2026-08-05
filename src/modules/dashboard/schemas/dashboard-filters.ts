import { z } from "zod";
import type {
  DashboardFilters,
  DashboardSearchParams,
} from "../types/dashboard";

const presetSchema = z.enum([
  "current-month",
  "previous-month",
  "last-3-months",
  "last-6-months",
  "current-year",
  "custom",
]);

const chartRangeSchema = z.enum([
  "6-months",
  "12-months",
  "current-year",
]);

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/u);
const dateSchema = z.string().refine(isValidDateKey, {
  message: "Tanggal tidak valid.",
});

const recognizedSchema = z
  .object({
    period: presetSchema.optional(),
    month: monthSchema.optional(),
    from: dateSchema.optional(),
    to: dateSchema.optional(),
    chartRange: chartRangeSchema.default("6-months"),
  })
  .superRefine((value, context) => {
    if (value.month && (value.period || value.from || value.to)) {
      context.addIssue({
        code: "custom",
        message: "Bulan spesifik tidak boleh digabungkan dengan periode lain.",
      });
      return;
    }

    if (value.period === "custom") {
      if (!value.from || !value.to) {
        context.addIssue({
          code: "custom",
          message: "Rentang khusus memerlukan tanggal awal dan akhir.",
        });
        return;
      }

      const startDay = dateKeyToEpochDay(value.from);
      const endDay = dateKeyToEpochDay(value.to);
      if (startDay > endDay) {
        context.addIssue({
          code: "custom",
          message: "Tanggal awal tidak boleh setelah tanggal akhir.",
        });
      } else if (endDay - startDay + 1 > 366) {
        context.addIssue({
          code: "custom",
          message: "Rentang khusus maksimal 366 hari.",
        });
      }
      return;
    }

    if (value.from || value.to) {
      context.addIssue({
        code: "custom",
        message: "Tanggal awal dan akhir hanya berlaku untuk rentang khusus.",
      });
    }
  });

function singleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.length === 1 ? value[0] : null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function dateKeyToEpochDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function safeParseDashboardFilters(
  searchParams: DashboardSearchParams,
) {
  const recognized = {
    period: singleValue(searchParams.period),
    month: singleValue(searchParams.month),
    from: singleValue(searchParams.from),
    to: singleValue(searchParams.to),
    chartRange: singleValue(searchParams.chartRange),
  };

  if (Object.values(recognized).some((value) => value === null)) {
    return {
      success: false as const,
      error: "Parameter dashboard tidak boleh diulang.",
    };
  }

  const parsed = recognizedSchema.safeParse(recognized);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Periode dashboard tidak valid.",
    };
  }

  let selection: DashboardFilters["selection"];
  if (parsed.data.month) {
    selection = { kind: "month", month: parsed.data.month };
  } else if (parsed.data.period === "custom") {
    selection = {
      kind: "custom",
      from: parsed.data.from!,
      to: parsed.data.to!,
    };
  } else {
    selection = {
      kind: "preset",
      period: parsed.data.period ?? "current-month",
    };
  }

  return {
    success: true as const,
    data: {
      selection,
      chartRange: parsed.data.chartRange,
    } satisfies DashboardFilters,
  };
}
