import type {
  DashboardChartRange,
  DashboardFilters,
} from "../types/dashboard";
import { Select } from "@/components/ui/select";

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
    <section aria-labelledby="period-selector-title" className="period-panel card">
      <div className="period-panel-heading">
        <div>
          <p className="eyebrow">Periode aktif</p>
          <h2 id="period-selector-title">{selectedLabel}</h2>
        </div>
        <form className="chart-range-form">
          <SelectionFields filters={filters} />
          <label htmlFor="chart-range">Rentang grafik</label>
          <Select
            defaultValue={chartRange}
            id="chart-range"
            name="chartRange"
          >
            <option value="6-months">6 bulan</option>
            <option value="12-months">12 bulan</option>
            <option value="current-year">Tahun berjalan</option>
          </Select>
          <button className="button button-secondary" type="submit">
            Terapkan grafik
          </button>
        </form>
      </div>

      <div className="period-forms">
        <form className="period-form">
          <input name="chartRange" type="hidden" value={chartRange} />
          <label htmlFor="dashboard-period">Periode cepat</label>
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
          <button className="button button-primary" type="submit">
            Terapkan
          </button>
        </form>

        <form className="period-form">
          <input name="chartRange" type="hidden" value={chartRange} />
          <label htmlFor="dashboard-month">Bulan spesifik</label>
          <input
            className="input"
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
          <button className="button button-secondary" type="submit">
            Pilih bulan
          </button>
        </form>

        <form className="period-form custom-period-form">
          <input name="chartRange" type="hidden" value={chartRange} />
          <input name="period" type="hidden" value="custom" />
          <label htmlFor="dashboard-from">Dari tanggal</label>
          <input
            className="input"
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
          <label htmlFor="dashboard-to">Sampai tanggal</label>
          <input
            className="input"
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
          <button className="button button-secondary" type="submit">
            Terapkan rentang
          </button>
        </form>
      </div>
    </section>
  );
}
