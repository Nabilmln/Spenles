export type AccountBalanceParts = {
  openingBalance: bigint;
  income: bigint;
  expense: bigint;
  incomingTransfers: bigint;
  outgoingTransfers: bigint;
};

export function calculateAccountBalance(parts: AccountBalanceParts) {
  return (
    parts.openingBalance +
    parts.income -
    parts.expense +
    parts.incomingTransfers -
    parts.outgoingTransfers
  );
}
