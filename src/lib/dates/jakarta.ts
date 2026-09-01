export const JAKARTA_TIMEZONE = "Asia/Jakarta";
export const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

const JAKARTA_OFFSET = "+07:00";

export function parseJakartaDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/u.test(value)) return null;
  const result = new Date(`${value}:00${JAKARTA_OFFSET}`);
  if (Number.isNaN(result.getTime())) return null;
  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: JAKARTA_TIMEZONE,
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

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function jakartaClockParts() {
  const shifted = new Date(Date.now() + JAKARTA_OFFSET_MS);
  return {
    hour: pad(shifted.getUTCHours()),
    minute: pad(shifted.getUTCMinutes()),
    second: pad(shifted.getUTCSeconds()),
  };
}

export function formatJakartaDate(value: Date) {
  return formatJakartaDateTimeInput(value).slice(0, 10);
}

export function formatJakartaDateLong(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TIMEZONE,
    dateStyle: "long",
  }).format(value);
}

export function jakartaNowDate() {
  return formatJakartaDate(new Date());
}

export function preserveOrAttachNow(dateOnly: string, original?: Date): Date | null {
  if (!jakartaDateBoundary(dateOnly)) return null;
  if (original) {
    const originalDate = formatJakartaDateTimeInput(original).slice(0, 10);
    if (originalDate === dateOnly) return new Date(original.getTime());
  }
  const { hour, minute, second } = jakartaClockParts();
  const result = new Date(`${dateOnly}T${hour}:${minute}:${second}+07:00`);
  return Number.isNaN(result.getTime()) ? null : result;
}

export function formatJakartaDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TIMEZONE,
    dateStyle: "long",
    timeStyle: "short",
  }).format(value);
}

export function formatJakartaDateTimeInput(value: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(value).replace(" ", "T");
}
