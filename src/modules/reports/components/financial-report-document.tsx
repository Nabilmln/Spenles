import {
  Document,
  Page,
  StyleSheet,
  Svg,
  Text,
  View,
  Rect,
} from "@react-pdf/renderer";
import { formatIdr } from "@/lib/money/format-idr";
import { REPORT_TIMEZONE } from "../constants";
import type { FinancialReport } from "../types";

const BRAND_COLOR = "#f05a24";
const INCOME_COLOR = "#22c55e";
const EXPENSE_COLOR = "#ef4444";
const SAVINGS_COLOR = "#2563eb";
const TEXT_COLOR = "#172033";
const MUTED_COLOR = "#657187";
const BORDER_COLOR = "#dce2ec";
const ROW_BORDER_COLOR = "#e8edf4";
const HEADER_BG = "#f6f8fc";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingRight: 40,
    paddingBottom: 52,
    paddingLeft: 40,
    color: TEXT_COLOR,
    fontFamily: "Noto Sans",
    fontSize: 9,
    lineHeight: 1.45,
  },
  brand: {
    color: BRAND_COLOR,
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: 2,
  },
  title: { marginTop: 4, fontSize: 15, fontWeight: 600 },
  period: { marginTop: 4, color: MUTED_COLOR, fontSize: 9 },
  section: { marginTop: 18 },
  sectionTitle: {
    marginBottom: 7,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    color: BRAND_COLOR,
    fontSize: 11,
    fontWeight: 600,
  },
  muted: { color: MUTED_COLOR },
  summaryGrid: { flexDirection: "row", gap: 8, marginTop: 12 },
  summaryCard: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 9,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 5,
  },
  summaryLabel: { color: MUTED_COLOR, fontSize: 7 },
  summaryValue: { marginTop: 4, fontSize: 11, fontWeight: 600 },
  chart: { marginTop: 8, height: 92 },
  table: { width: "100%", marginTop: 8 },
  row: {
    flexDirection: "row",
    minHeight: 22,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: ROW_BORDER_COLOR,
  },
  header: { color: MUTED_COLOR, backgroundColor: HEADER_BG, fontWeight: 600 },
  cell: { flexGrow: 1, flexBasis: 0, padding: 4 },
  cellWide: { flexGrow: 2, flexBasis: 0, padding: 4 },
  cellNumeric: { flexGrow: 1, flexBasis: 0, padding: 4, textAlign: "right" },
  infoRow: { flexDirection: "row", marginTop: 5 },
  infoLabel: { width: 130, color: MUTED_COLOR },
  infoValue: { fontWeight: 600 },
  footer: {
    position: "absolute",
    right: 40,
    bottom: 24,
    left: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    color: MUTED_COLOR,
    fontSize: 7,
  },
});

function formatGeneratedAt(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: REPORT_TIMEZONE,
    dateStyle: "long",
    timeStyle: "short",
  }).format(value);
}

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    timeZone: REPORT_TIMEZONE,
  }).format(value);
}

function percentageOfTotal(amountIdr: string, total: bigint) {
  const amount = BigInt(amountIdr);
  if (total <= 0n) return "0%";
  return `${(Number((amount * 10_000n) / total) / 100).toFixed(1)}%`;
}

function SummaryCard({ label, amount }: { label: string; amount: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{formatIdr(amount)}</Text>
    </View>
  );
}

function AllocationChart({ report }: { report: FinancialReport }) {
  const income = BigInt(report.summary.incomeIdr);
  if (income <= 0n) {
    return <Text style={styles.muted}>Belum ada pendapatan pada periode ini.</Text>;
  }
  const expense = BigInt(report.summary.expenseIdr);
  const savings = BigInt(report.summary.netIdr);
  const rows = [
    { label: "Pendapatan", value: income, color: INCOME_COLOR },
    { label: "Pengeluaran", value: expense, color: EXPENSE_COLOR },
    { label: "Tabungan", value: savings, color: SAVINGS_COLOR },
  ];
  return (
    <Svg style={styles.chart} viewBox="0 0 500 92">
      {rows.map((row, index) => {
        const width = Math.max(
          0,
          Math.min(290, Number((row.value * 290n) / income)),
        );
        const percent = Number((row.value * 10_000n) / income) / 100;
        const y = index * 28 + 4;
        return (
          <View key={row.label}>
            <Text x={0} y={y + 8} style={{ color: MUTED_COLOR, fontSize: 7.5 }}>
              {row.label}
            </Text>
            <Rect
              x={88}
              y={y}
              width={row.value > 0n ? Math.max(width, 1) : 0}
              height={9}
              fill={row.color}
            />
            <Text x={492} y={y + 8} style={{ fontSize: 7.5, textAnchor: "end" }}>
              {formatIdr(String(row.value))} · {percent.toFixed(1)}%
            </Text>
          </View>
        );
      })}
    </Svg>
  );
}

export function FinancialReportDocument({ report }: { report: FinancialReport }) {
  const totalExpense = report.categories.reduce(
    (sum, row) => sum + BigInt(row.amountIdr),
    0n,
  );

  return (
    <Document
      title={`Laporan keuangan Spenles - ${report.filters.interval.label}`}
      author="Spenles"
      subject="Laporan keuangan pribadi"
      language="id-ID"
    >
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.brand}>SPENLES</Text>
        <Text style={styles.title}>Laporan Keuangan Pribadi</Text>
        <Text style={styles.period}>
          Periode {report.filters.interval.label}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RINGKASAN KEUANGAN</Text>
          <View style={styles.summaryGrid}>
            <SummaryCard label="Pendapatan" amount={report.summary.incomeIdr} />
            <SummaryCard label="Pengeluaran" amount={report.summary.expenseIdr} />
            <SummaryCard label="Selisih" amount={report.summary.netIdr} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ALOKASI KEUANGAN</Text>
          <AllocationChart report={report} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PENGELUARAN BERDASARKAN KATEGORI</Text>
          {report.categories.length === 0 ? (
            <Text style={styles.muted}>Tidak ada pengeluaran pada periode ini.</Text>
          ) : (
            <View style={styles.table}>
              <View style={[styles.row, styles.header]} fixed>
                <Text style={styles.cellWide}>Kategori</Text>
                <Text style={styles.cellNumeric}>Jumlah</Text>
                <Text style={styles.cellNumeric}>Persentase</Text>
              </View>
              {report.categories.map((row) => (
                <View style={styles.row} key={row.categoryId} wrap={false}>
                  <Text style={styles.cellWide}>{row.name}</Text>
                  <Text style={styles.cellNumeric}>{formatIdr(row.amountIdr)}</Text>
                  <Text style={styles.cellNumeric}>
                    {percentageOfTotal(row.amountIdr, totalExpense)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {report.filters.includeDetails ? (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>DETAIL TRANSAKSI</Text>
            <View style={styles.table}>
              <View style={[styles.row, styles.header]} fixed>
                <Text style={styles.cell}>Tanggal</Text>
                <Text style={styles.cellWide}>Deskripsi</Text>
                <Text style={styles.cellWide}>Kategori</Text>
                <Text style={styles.cell}>Tipe</Text>
                <Text style={styles.cellNumeric}>Nominal</Text>
              </View>
              {report.transactions.map((row) => (
                <View style={styles.row} key={row.id} wrap={false}>
                  <Text style={styles.cell}>{formatShortDate(row.transactionAt)}</Text>
                  <Text style={styles.cellWide}>{row.note || "—"}</Text>
                  <Text style={styles.cellWide}>{row.categoryName}</Text>
                  <Text style={styles.cell}>
                    {row.type === "income" ? "Masuk" : "Keluar"}
                  </Text>
                  <Text style={styles.cellNumeric}>{formatIdr(row.amountIdr)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMASI</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total transaksi</Text>
            <Text style={styles.infoValue}>{report.transactionCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Periode</Text>
            <Text style={styles.infoValue}>{report.filters.interval.label}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dibuat pada</Text>
            <Text style={styles.infoValue}>{formatGeneratedAt(report.generatedAt)}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Generated by Spenles</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Halaman ${pageNumber} dari ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}