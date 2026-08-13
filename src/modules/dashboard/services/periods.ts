import type {
  DashboardFilters,
  DashboardPeriods,
  DateInterval,
} from "../types/dashboard";

const DAY_MS = 86_400_000;
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

type CalendarDate = { year: number; month: number; day: number };

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(value: CalendarDate) {
  return `${value.year}-${pad(value.month)}-${pad(value.day)}`;
}

function monthKey(value: Pick<CalendarDate, "year" | "month">) {
  return `${value.year}-${pad(value.month)}`;
}

function parseDateKey(value: string): CalendarDate {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function parseMonthKey(value: string): CalendarDate {
  const [year, month] = value.split("-").map(Number);
  return { year, month, day: 1 };
}

function addMonths(value: CalendarDate, amount: number): CalendarDate {
  const date = new Date(Date.UTC(value.year, value.month - 1 + amount, 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: 1,
  };
}

function addDays(value: CalendarDate, amount: number): CalendarDate {
  const date = new Date(Date.UTC(value.year, value.month - 1, value.day + amount));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function dayDistance(start: CalendarDate, end: CalendarDate) {
  return Math.round(
    (Date.UTC(end.year, end.month - 1, end.day) -
      Date.UTC(start.year, start.month - 1, start.day)) /
      DAY_MS,
  );
}

function toJakartaInstant(value: CalendarDate) {
  return new Date(
    Date.UTC(value.year, value.month - 1, value.day) - JAKARTA_OFFSET_MS,
  );
}

function jakartaToday(now: Date): CalendarDate {
  const shifted = new Date(now.getTime() + JAKARTA_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

function monthLabel(value: CalendarDate) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(value.year, value.month - 1, 1)));
}

function dateLabel(value: CalendarDate) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(value.year, value.month - 1, value.day)));
}

function interval(
  start: CalendarDate,
  end: CalendarDate,
  label: string,
): DateInterval {
  return {
    start: toJakartaInstant(start),
    end: toJakartaInstant(end),
    startDate: dateKey(start),
    endDateExclusive: dateKey(end),
    label,
  };
}

function monthInterval(start: CalendarDate, count: number, label: string) {
  return interval(start, addMonths(start, count), label);
}

function enumerateMonths(start: CalendarDate, endExclusive: CalendarDate) {
  const result: string[] = [];
  let cursor = { year: start.year, month: start.month, day: 1 };
  const lastIncluded = addDays(endExclusive, -1);
  const lastKey = monthKey(lastIncluded);

  while (true) {
    const key = monthKey(cursor);
    result.push(key);
    if (key === lastKey) break;
    cursor = addMonths(cursor, 1);
  }

  return result;
}

function selectedAndPrevious(filters: DashboardFilters, today: CalendarDate) {
  const currentMonth = { year: today.year, month: today.month, day: 1 };

  if (filters.selection.kind === "month") {
    const start = parseMonthKey(filters.selection.month);
    return {
      selected: monthInterval(start, 1, monthLabel(start)),
      previous: monthInterval(
        addMonths(start, -1),
        1,
        monthLabel(addMonths(start, -1)),
      ),
    };
  }

  if (filters.selection.kind === "custom") {
    const start = parseDateKey(filters.selection.from);
    const inclusiveEnd = parseDateKey(filters.selection.to);
    const end = addDays(inclusiveEnd, 1);
    const includedDays = dayDistance(start, end);
    const previousStart = addDays(start, -includedDays);
    return {
      selected: interval(
        start,
        end,
        `${dateLabel(start)}–${dateLabel(inclusiveEnd)}`,
      ),
      previous: interval(
        previousStart,
        start,
        `${dateLabel(previousStart)}–${dateLabel(addDays(start, -1))}`,
      ),
    };
  }

  switch (filters.selection.period) {
    case "previous-month": {
      const start = addMonths(currentMonth, -1);
      return {
        selected: monthInterval(start, 1, monthLabel(start)),
        previous: monthInterval(
          addMonths(start, -1),
          1,
          monthLabel(addMonths(start, -1)),
        ),
      };
    }
    case "last-3-months": {
      const start = addMonths(currentMonth, -2);
      const previousStart = addMonths(start, -3);
      return {
        selected: monthInterval(start, 3, "3 bulan terakhir"),
        previous: monthInterval(previousStart, 3, "3 bulan sebelumnya"),
      };
    }
    case "last-6-months": {
      const start = addMonths(currentMonth, -5);
      const previousStart = addMonths(start, -6);
      return {
        selected: monthInterval(start, 6, "6 bulan terakhir"),
        previous: monthInterval(previousStart, 6, "6 bulan sebelumnya"),
      };
    }
    case "current-year": {
      const start = { year: today.year, month: 1, day: 1 };
      const previousStart = { year: today.year - 1, month: 1, day: 1 };
      return {
        selected: monthInterval(start, 12, `Tahun ${today.year}`),
        previous: monthInterval(previousStart, 12, `Tahun ${today.year - 1}`),
      };
    }
    case "current-month":
      return {
        selected: monthInterval(
          currentMonth,
          1,
          monthLabel(currentMonth),
        ),
        previous: monthInterval(
          addMonths(currentMonth, -1),
          1,
          monthLabel(addMonths(currentMonth, -1)),
        ),
      };
  }
}

function startOfWeek(value: CalendarDate): CalendarDate {
  const dayOfWeek = new Date(
    Date.UTC(value.year, value.month - 1, value.day),
  ).getUTCDay();
  return addDays(value, -((dayOfWeek + 6) % 7));
}

export function resolveDashboardPeriods(
  filters: DashboardFilters,
  now = new Date(),
): DashboardPeriods {
  const today = jakartaToday(now);
  const { selected, previous } = selectedAndPrevious(filters, today);

  return {
    selected,
    previous,
    selectedMonthKeys: enumerateMonths(
      parseDateKey(selected.startDate),
      parseDateKey(selected.endDateExclusive),
    ),
  };
}

export function currentJakartaMonthKey(now = new Date()) {
  const today = jakartaToday(now);
  return monthKey(today);
}

export function shiftMonthKey(month: string, offset: number) {
  const start = parseMonthKey(month);
  const shifted = addMonths(start, offset);
  return monthKey(shifted);
}

export function monthIntervalForKey(month: string): DateInterval {
  const start = parseMonthKey(month);
  return monthInterval(start, 1, monthLabel(start));
}

export function fourDayJakartaInterval(now = new Date()): DateInterval {
  const today = jakartaToday(now);
  const start = addDays(today, -3);
  const end = addDays(today, 1);
  return interval(start, end, "4 hari terakhir");
}

export function lastDaysJakartaInterval(
  count: number,
  now = new Date(),
): DateInterval {
  const today = jakartaToday(now);
  const start = addDays(today, -(count - 1));
  const end = addDays(today, 1);
  return interval(start, end, `${count} hari terakhir`);
}

export function lastWeeksJakartaInterval(
  count: number,
  now = new Date(),
): DateInterval {
  const today = jakartaToday(now);
  const currentWeek = startOfWeek(today);
  const start = addDays(currentWeek, -(count - 1) * 7);
  const end = addDays(currentWeek, 7);
  return interval(start, end, `${count} minggu terakhir`);
}

export function lastMonthsJakartaInterval(
  count: number,
  now = new Date(),
): DateInterval {
  const today = jakartaToday(now);
  const currentMonth = { year: today.year, month: today.month, day: 1 };
  return monthInterval(
    addMonths(currentMonth, -(count - 1)),
    count,
    `${count} bulan terakhir`,
  );
}

export function countCalendarDays(interval: DateInterval) {
  const start = parseDateKey(interval.startDate);
  const end = parseDateKey(interval.endDateExclusive);
  return dayDistance(start, end);
}
