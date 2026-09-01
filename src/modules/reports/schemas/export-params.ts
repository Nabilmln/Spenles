import { z } from "zod";
import { formatMonthYearLabel, formatRangeLong } from "@/lib/dates/format-id";
import {
  REPORT_EARLIEST_DATE,
  REPORT_MAX_DAYS,
  REPORT_TIMEZONE,
} from "../constants";
import type {
  ExportFilters,
  ReportFilters,
  ReportInterval,
} from "../types";

const dateSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/u);
const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/u);
const yearSchema = z.string().regex(/^\d{4}$/u);
const uuidSchema = z.uuid();

function jakartaDate(value: string) {
  const date = new Date(`${value}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return null;
  const canonical = new Intl.DateTimeFormat("sv-SE", {
    timeZone: REPORT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return canonical === value ? date : null;
}

function addCalendarDays(value: string, days: number) {
  const date = jakartaDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: REPORT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function currentJakartaDate(now: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: REPORT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function buildInterval(
  values: Record<string, string>,
  now: Date,
): ReportInterval | null {
  const kind = values.period;
  let startDate: string;
  let inclusiveEndDate: string;
  let label: string;
  let filePart: string;

  if (kind === "month" && monthSchema.safeParse(values.month).success) {
    const [year, month] = values.month.split("-").map(Number);
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    startDate = `${values.month}-01`;
    inclusiveEndDate = addCalendarDays(
      `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
      -1,
    )!;
    label = formatMonthYearLabel(year, month);
    filePart = values.month;
  } else if (kind === "year" && yearSchema.safeParse(values.year).success) {
    const year = Number(values.year);
    startDate = `${values.year}-01-01`;
    inclusiveEndDate = `${values.year}-12-31`;
    label = `Year ${values.year}`;
    filePart = values.year;
    if (year < 2000) return null;
  } else if (
    kind === "custom" &&
    dateSchema.safeParse(values.from).success &&
    dateSchema.safeParse(values.to).success
  ) {
    startDate = values.from;
    inclusiveEndDate = values.to;
    label = formatRangeLong(values.from, values.to);
    filePart = `${values.from}-to-${values.to}`;
  } else {
    return null;
  }

  const today = currentJakartaDate(now);
  if (
    (kind === "month" || kind === "year") &&
    startDate <= today &&
    inclusiveEndDate > today
  ) {
    inclusiveEndDate = today;
    label = `${label} (through ${today})`;
  }

  const start = jakartaDate(startDate);
  const inclusiveEnd = jakartaDate(inclusiveEndDate);
  const exclusiveEndDate = addCalendarDays(inclusiveEndDate, 1);
  const end = exclusiveEndDate ? jakartaDate(exclusiveEndDate) : null;
  if (!start || !inclusiveEnd || !end) return null;
  const inclusiveDays = Math.round(
    (inclusiveEnd.getTime() - start.getTime()) / 86_400_000,
  ) + 1;
  if (
    startDate < REPORT_EARLIEST_DATE ||
    inclusiveEndDate > today ||
    start > inclusiveEnd ||
    inclusiveDays > REPORT_MAX_DAYS
  ) {
    return null;
  }

  return {
    kind,
    label,
    filePart,
    startDate,
    endDate: inclusiveEndDate,
    start,
    end,
  };
}

function paramsToObject(
  params: URLSearchParams,
  allowed: ReadonlySet<string>,
) {
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (!allowed.has(key) || key in result) return null;
    if (value !== "") result[key] = value;
  }
  return result;
}

const sharedKeys = new Set([
  "period",
  "month",
  "year",
  "from",
  "to",
  "type",
  "category",
  "account",
]);

function parseShared(
  params: URLSearchParams,
  allowed: ReadonlySet<string>,
  now: Date,
) {
  const values = paramsToObject(params, allowed);
  if (!values) return null;
  const interval = buildInterval(values, now);
  if (!interval) return null;

  const expectedPeriodKeys =
    interval.kind === "month"
      ? new Set(["period", "month"])
      : interval.kind === "year"
        ? new Set(["period", "year"])
        : new Set(["period", "from", "to"]);
  for (const periodKey of ["month", "year", "from", "to"]) {
    if (periodKey in values && !expectedPeriodKeys.has(periodKey)) return null;
  }
  if (values.type && !["income", "expense"].includes(values.type)) return null;
  if (values.category && !uuidSchema.safeParse(values.category).success) {
    return null;
  }
  if (values.account && !uuidSchema.safeParse(values.account).success) {
    return null;
  }

  return {
    values,
    interval,
    type: values.type as "income" | "expense" | undefined,
    categoryId: values.category,
    accountId: values.account,
  };
}

export function parseReportParams(
  params: URLSearchParams,
  now = new Date(),
): ReportFilters | null {
  const parsed = parseShared(
    params,
    new Set([...sharedKeys, "details"]),
    now,
  );
  if (!parsed) return null;
  if (parsed.values.details && !["true", "false"].includes(parsed.values.details)) {
    return null;
  }
  return {
    interval: parsed.interval,
    type: parsed.type,
    categoryId: parsed.categoryId,
    accountId: parsed.accountId,
    includeDetails: parsed.values.details === "true",
  };
}

export function parseCsvParams(
  params: URLSearchParams,
  now = new Date(),
): ExportFilters | null {
  const parsed = parseShared(
    params,
    new Set([...sharedKeys, "q"]),
    now,
  );
  if (!parsed) return null;
  const searchResult = z
    .string()
    .trim()
    .max(100)
    .optional()
    .safeParse(parsed.values.q);
  if (!searchResult.success) return null;
  return {
    interval: parsed.interval,
    type: parsed.type,
    categoryId: parsed.categoryId,
    accountId: parsed.accountId,
    search: searchResult.data || undefined,
  };
}
