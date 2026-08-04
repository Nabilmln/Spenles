import { z } from "zod";
import { jakartaDateBoundary } from "@/lib/dates/jakarta";

export const transactionFilterSchema = z
  .object({
    q: z.string().trim().max(100).default(""),
    type: z.enum(["income", "expense"]).optional(),
    category: z.uuid().optional(),
    account: z.uuid().optional(),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/u).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    sort: z.enum(["transactionAt", "amount"]).default("transactionAt"),
    direction: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().pipe(z.union([z.literal(10), z.literal(20), z.literal(50)])).default(20),
  })
  .superRefine((value, context) => {
    if (value.month && (value.from || value.to)) {
      context.addIssue({ code: "custom", message: "Pilih bulan atau rentang tanggal, bukan keduanya." });
    }
    if (!!value.from !== !!value.to) {
      context.addIssue({ code: "custom", message: "Tanggal awal dan akhir harus diisi bersama." });
    }
    if (value.from && value.to) {
      const from = jakartaDateBoundary(value.from);
      const to = jakartaDateBoundary(value.to);
      if (!from || !to || from > to || to.getTime() - from.getTime() > 366 * 86_400_000) {
        context.addIssue({ code: "custom", message: "Rentang tanggal tidak valid atau melebihi 366 hari." });
      }
    }
  });

export type TransactionFilters = z.infer<typeof transactionFilterSchema>;

export function parseTransactionFilters(searchParams: Record<string, string | string[] | undefined>) {
  const recognized = Object.fromEntries(
    ["q", "type", "category", "account", "month", "from", "to", "sort", "direction", "page", "pageSize"]
      .map((key) => [key, Array.isArray(searchParams[key]) ? searchParams[key]?.[0] : searchParams[key]])
      .filter(([, value]) => value !== undefined && value !== ""),
  );
  return transactionFilterSchema.safeParse(recognized);
}
