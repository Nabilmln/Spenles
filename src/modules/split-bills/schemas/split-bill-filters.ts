import { z } from "zod";
import { SPLIT_BILL_PAGE_SIZES } from "../constants/limits";

export const splitBillFilterSchema = z.object({
  status: z
    .enum(["draft", "finalized", "archived", "all"])
    .optional(),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/u)
    .optional(),
  q: z.string().trim().max(100).default(""),
  sort: z.enum(["billDate", "amount"]).default("billDate"),
  direction: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce
    .number()
    .pipe(
      z.union(
        SPLIT_BILL_PAGE_SIZES.map((size) => z.literal(size)) as [
          z.ZodLiteral<10>,
          z.ZodLiteral<20>,
          z.ZodLiteral<50>,
        ],
      ),
    )
    .default(20),
});

export type SplitBillFilters = z.infer<typeof splitBillFilterSchema>;

export function parseSplitBillFilters(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const input = Object.fromEntries(
    ["status", "month", "q", "sort", "direction", "page", "pageSize"]
      .map((key) => [
        key,
        Array.isArray(searchParams[key])
          ? searchParams[key]?.[0]
          : searchParams[key],
      ])
      .filter(([, value]) => value !== undefined && value !== ""),
  );
  return splitBillFilterSchema.safeParse(input);
}
