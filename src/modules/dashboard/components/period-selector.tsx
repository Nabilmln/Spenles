import type {
  DashboardChartRange,
  DashboardFilters,
} from "../types/dashboard";
import { Select } from "@/components/ui/select";
import {
  buttonClass,
  cardClass,
  eyebrowClass,
  inputClass,
} from "@/components/ui/styles";
import { cn } from "@/lib/utils";

function SelectionFields({ filters }: { filters: DashboardFilters }) {
  if (filters.selection.kind === "month") {
    return <input name="month" type="hidden" value={filters.selection.month} />;
  }
  if (filters.selection.kind === "custom") {
    return (
      <>
        <input name="period" type="hidden" value="custom" />
        <input name="from" type="hidden" value={filters.selection.from} />
        <input name="to" type="hidden" value={filters.selection.to} />
      </>
    );
  }
  return (
    <input name="period" type="hidden" value={filters.selection.period} />
  );
}

export function PeriodSelector({
  filters,
  defaultMonth,
  selectedLabel,
}: {
  filters: DashboardFilters;
  defaultMonth: string;
  selectedLabel: string;
}) {
  const chartRange: DashboardChartRange = filters.chartRange;
  const preset =
    filters.selection.kind === "preset"
      ? filters.selection.period
      : "current-month";

  return (
    <section aria-labelledby="period-selector-title" className={`${cardClass} grid gap-[1.2rem]`}>
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4 max-[860px]:flex-col max-[860px]:items-stretch">
        <div>
          <p className={cn(eyebrowClass, "mb-[.35rem]")}>Periode aktif</p>
          <h2 id="period-selector-title" className="m-0 text-[1.08rem] tracking-[-.02em]">{selectedLabel}</h2>
        </div>
        <form className="grid grid-cols-[auto_minmax(8rem,10rem)_auto] items-center gap-[.55rem] max-[860px]:grid-cols-[minmax(0,1fr)_auto] max-[540px]:grid-cols-1">
          <SelectionFields filters={filters} />
          <label htmlFor="chart-range" className="text-[.78rem] font-medium text-muted max-[860px]:col-span-full max-[540px]:col-auto">
            Rentang grafik
          </label>
          <Select
            defaultValue={chartRange}
            id="chart-range"
            name="chartRange"
          >
            <option value="6-months">6 bulan</option>
            <option value="12-months">12 bulan</option>
            <option value="current-year">Tahun berjalan</option>
          </Select>
          <button className={`${buttonClass("secondary")} max-[540px]:w-full`} type="submit">
            Terapkan grafik
          </button>
        </form>
      </div>

      <div className="grid grid-cols-[.9fr_.9fr_1.5fr] gap-[.8rem] max-[1100px]:grid-cols-2 max-[540px]:grid-cols-1">
        <form className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-[.55rem] rounded-[.8rem] border border-border bg-surface-subtle p-[.8rem] max-[540px]:grid-cols-1">
          <input name="chartRange" type="hidden" value={chartRange} />
          <label htmlFor="dashboard-period" className="col-span-full text-[.78rem] font-medium max-[540px]:col-auto">
            Periode cepat
          </label>
          <Select
            defaultValue={preset}
            id="dashboard-period"
            name="period"
          >
            <option value="current-month">Bulan ini</option>
            <option value="previous-month">Bulan lalu</option>
            <option value="last-3-months">3 bulan terakhir</option>
            <option value="last-6-months">6 bulan terakhir</option>
            <option value="current-year">Tahun berjalan</option>
          </Select>
          <button className={`${buttonClass("primary")} max-[540px]:w-full`} type="submit">
            Terapkan
          </button>
        </form>

        <form className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-[.55rem] rounded-[.8rem] border border-border bg-surface-subtle p-[.8rem] max-[540px]:grid-cols-1">
          <input name="chartRange" type="hidden" value={chartRange} />
          <label htmlFor="dashboard-month" className="col-span-full text-[.78rem] font-medium max-[540px]:col-auto">
            Bulan spesifik
          </label>
          <input
            className={inputClass}
            defaultValue={
              filters.selection.kind === "month"
                ? filters.selection.month
                : defaultMonth
            }
            id="dashboard-month"
            name="month"
            required
            type="month"
          />
          <button className={`${buttonClass("secondary")} max-[540px]:w-full`} type="submit">
            Pilih bulan
          </button>
        </form>

        <form className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-[.55rem] rounded-[.8rem] border border-border bg-surface-subtle p-[.8rem] max-[1100px]:col-span-full max-[540px]:col-auto max-[540px]:grid-cols-1">
          <input name="chartRange" type="hidden" value={chartRange} />
          <input name="period" type="hidden" value="custom" />
          <label htmlFor="dashboard-from" className="col-auto text-[.78rem] font-medium">
            Dari tanggal
          </label>
          <input
            className={inputClass}
            defaultValue={
              filters.selection.kind === "custom"
                ? filters.selection.from
                : undefined
            }
            id="dashboard-from"
            name="from"
            required
            type="date"
          />
          <label htmlFor="dashboard-to" className="col-auto text-[.78rem] font-medium">
            Sampai tanggal
          </label>
          <input
            className={inputClass}
            defaultValue={
              filters.selection.kind === "custom"
                ? filters.selection.to
                : undefined
            }
            id="dashboard-to"
            name="to"
            required
            type="date"
          />
          <button className={`${buttonClass("secondary")} max-[540px]:w-full`} type="submit">
            Terapkan rentang
          </button>
        </form>
      </div>
    </section>
  );
}
