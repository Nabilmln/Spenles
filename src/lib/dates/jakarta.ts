const JAKARTA_OFFSET = "+07:00";

export function parseJakartaDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/u.test(value)) return null;
  const result = new Date(`${value}:00${JAKARTA_OFFSET}`);
  if (Number.isNaN(result.getTime())) return null;
  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(result).replace(" ", "T");
  return formatted === value ? result : null;
}

export function jakartaDateBoundary(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return null;
  return parseJakartaDateTime(`${value}T00:00`);
}

export function formatJakartaDateTime(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatJakartaDateTimeInput(value: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(value).replace(" ", "T");
}
