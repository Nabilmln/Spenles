export const MAX_TRANSACTION_AMOUNT = BigInt("9007199254740991");

export function formatIdr(value: bigint | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(BigInt(value));
}
