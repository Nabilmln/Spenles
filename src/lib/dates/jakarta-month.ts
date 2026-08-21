import { jakartaDateBoundary, JAKARTA_TIMEZONE } from "./jakarta";

export { JAKARTA_TIMEZONE } from "./jakarta";

export function isCanonicalMonth(value: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/u.test(value)) return false;
  const year = Number(value.slice(0, 4));
  return year >= 1970 && year <= 9999;
}

export function budgetMonthToDate(value: string) {
  if (!isCanonicalMonth(value)) return null;
  return `${value}-01`;
}

export function jakartaMonthBounds(value: string) {
  if (!isCanonicalMonth(value)) return null;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const start = jakartaDateBoundary(`${value}-01`);
  const end = jakartaDateBoundary(
    `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
  );
  return start && end ? { start, end } : null;
}

export function jakartaMonthForDate(value: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).format(value);
}
