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

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingRight: 40,
    paddingBottom: 52,
    paddingLeft: 40,
    color: "#172033",
    fontFamily: "Noto Sans",
    fontSize: 9,
    lineHeight: 1.45,
  },
  brand: { color: "#2563eb", fontSize: 17, fontWeight: 600 },
  title: { marginTop: 18, fontSize: 15, fontWeight: 600 },
  muted: { color: "#657187" },
  section: { marginTop: 18 },
  sectionTitle: {
    marginBottom: 7,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#dce2ec",
    fontSize: 11,
    fontWeight: 600,
  },
  summaryGrid: { flexDirection: "row", gap: 8, marginTop: 12 },
  summaryCard: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 9,
    borderWidth: 1,
    borderColor: "#dce2ec",
    borderRadius: 5,
  },
  summaryLabel: { color: "#657187", fontSize: 7 },
  summaryValue: { marginTop: 4, fontSize: 11, fontWeight: 600 },
  table: { width: "100%" },
  row: {
    flexDirection: "row",
    minHeight: 22,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e8edf4",
  },
  header: { color: "#657187", backgroundColor: "#f6f8fc", fontWeight: 600 },
  cell: { flexGrow: 1, flexBasis: 0, padding: 4 },
  cellWide: { flexGrow: 2, flexBasis: 0, padding: 4 },
  cellNumeric: { flexGrow: 1, flexBasis: 0, padding: 4, textAlign: "right" },
  warning: {
    marginTop: 8,
    padding: 7,
    borderRadius: 4,
    color: "#92400e",
    backgroundColor: "#fffbeb",
  },
  chart: { marginTop: 8, height: 112 },
  footer: {
    position: "absolute",
    right: 40,
    bottom: 24,
    left: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#657187",
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

function SummaryCard({
  label,
  amount,
}: {
  label: string;
  amount: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{formatIdr(amount)}</Text>
    </View>
  );
}

function CategoryChart({ report }: { report: FinancialReport }) {
  const rows = report.categories.slice(0, 8);
  const max = rows.reduce(
    (current, row) =>
      BigInt(row.amountIdr) > current ? BigInt(row.amountIdr) : current,
    0n,
  );
  if (max === 0n) return null;
  return (
    <Svg style={styles.chart} viewBox="0 0 500 112">
      {rows.map((row, index) => {
        const width = Number((BigInt(row.amountIdr) * 300n) / max);
        const y = index * 13 + 3;
        return (
          <View key={row.categoryId}>
            <Text x={0} y={y + 8} style={{ fontSize: 7 }}>
              {row.name.slice(0, 25)}
            </Text>
            <Rect x={150} y={y} width={Math.max(width, 1)} height={8} fill="#3b82f6" />
            <Text x={458} y={y + 8} style={{ fontSize: 7, textAnchor: "end" }}>
              {formatIdr(row.amountIdr)}
            </Text>
          </View>
        );
      })}
    </Svg>
  );
}

export function FinancialReportDocument({
  report,
  includeCharts = true,
}: {
  report: FinancialReport;
  includeCharts?: boolean;
}) {
  return (
    <Document
      title={`Laporan keuangan Spenles - ${report.filters.interval.label}`}
      author="Spenles"
      subject="Laporan keuangan pribadi"
      language="id-ID"
    >
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.brand}>Spenles</Text>
        <Text style={styles.title}>Laporan keuangan</Text>
        <Text>{report.filters.interval.label}</Text>
        <Text style={styles.muted}>Pemilik: {report.displayName}</Text>
        <Text style={styles.muted}>
          Dibuat: {formatGeneratedAt(report.generatedAt)} ({REPORT_TIMEZONE})
        </Text>

        <View style={styles.summaryGrid}>
          <SummaryCard label="Total pemasukan" amount={report.summary.incomeIdr} />
          <SummaryCard label="Total pengeluaran" amount={report.summary.expenseIdr} />
          <SummaryCard label="Arus kas bersih" amount={report.summary.netIdr} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pengeluaran per kategori</Text>
          {report.categories.length === 0 ? (
            <Text style={styles.muted}>Tidak ada pengeluaran pada periode ini.</Text>
          ) : (
            <>
              {includeCharts ? <CategoryChart report={report} /> : null}
              <View style={styles.table}>
                <View style={[styles.row, styles.header]} fixed>
                  <Text style={styles.cellWide}>Kategori</Text>
                  <Text style={styles.cellNumeric}>Jumlah</Text>
                </View>
                {report.categories.map((row) => (
                  <View style={styles.row} key={row.categoryId} wrap={false}>
                    <Text style={styles.cellWide}>{row.name}</Text>
                    <Text style={styles.cellNumeric}>{formatIdr(row.amountIdr)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan akun</Text>
          <View style={styles.table}>
            <View style={[styles.row, styles.header]} fixed>
              <Text style={styles.cellWide}>Akun</Text>
              <Text style={styles.cellNumeric}>Saldo awal</Text>
              <Text style={styles.cellNumeric}>Saldo akhir</Text>
            </View>
            {report.accounts.map((row) => (
              <View style={styles.row} key={row.accountId} wrap={false}>
                <Text style={styles.cellWide}>{row.name}</Text>
                <Text style={styles.cellNumeric}>
                  {formatIdr(row.openingBalanceIdr)}
                </Text>
                <Text style={styles.cellNumeric}>
                  {formatIdr(row.closingBalanceIdr)}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[styles.muted, { marginTop: 5 }]}>
            Transfer internal tercermin dalam saldo akun, tetapi tidak dihitung
            sebagai pemasukan atau pengeluaran.
          </Text>
        </View>

        {report.budgets.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ringkasan anggaran bulan</Text>
            <View style={styles.table}>
              <View style={[styles.row, styles.header]} fixed>
                <Text style={styles.cellWide}>Kategori</Text>
                <Text style={styles.cellNumeric}>Anggaran</Text>
                <Text style={styles.cellNumeric}>Terpakai</Text>
                <Text style={styles.cell}>Status</Text>
              </View>
              {report.budgets.map((row) => (
                <View style={styles.row} key={row.categoryName} wrap={false}>
                  <Text style={styles.cellWide}>{row.categoryName}</Text>
                  <Text style={styles.cellNumeric}>{formatIdr(row.amountIdr)}</Text>
                  <Text style={styles.cellNumeric}>{formatIdr(row.usageIdr)}</Text>
                  <Text style={styles.cell}>{row.status}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {report.filters.includeDetails ? (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Detail transaksi</Text>
            <View style={styles.table}>
              <View style={[styles.row, styles.header]} fixed>
                <Text style={styles.cell}>Tanggal</Text>
                <Text style={styles.cell}>Jenis</Text>
                <Text style={styles.cellWide}>Kategori / catatan</Text>
                <Text style={styles.cellNumeric}>Jumlah</Text>
              </View>
              {report.transactions.map((row) => (
                <View style={styles.row} key={row.id} wrap={false}>
                  <Text style={styles.cell}>
                    {new Intl.DateTimeFormat("sv-SE", {
                      timeZone: REPORT_TIMEZONE,
                    }).format(row.transactionAt)}
                  </Text>
                  <Text style={styles.cell}>
                    {row.type === "income" ? "Pemasukan" : "Pengeluaran"}
                  </Text>
                  <Text style={styles.cellWide}>
                    {row.categoryName}
                    {row.note ? ` — ${row.note}` : ""}
                  </Text>
                  <Text style={styles.cellNumeric}>{formatIdr(row.amountIdr)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>Spenles · Laporan pribadi · IDR</Text>
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
