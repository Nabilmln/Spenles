export type AllocationEntry = {
  id: string;
  position: number;
  weight: bigint;
};

export type AllocationResult = AllocationEntry & {
  amount: bigint;
  remainder: bigint;
  receivedRemainder: boolean;
};

export function divideHalfUp(numerator: bigint, denominator: bigint) {
  if (numerator < 0n || denominator <= 0n) {
    throw new Error("Pembagian finansial tidak valid.");
  }
  return (numerator + denominator / 2n) / denominator;
}

export function calculateBasisPointAmount(amount: bigint, basisPoints: number) {
  if (
    amount < 0n ||
    !Number.isInteger(basisPoints) ||
    basisPoints < 0 ||
    basisPoints > 10_000
  ) {
    throw new Error("Nilai persentase tidak valid.");
  }
  return divideHalfUp(amount * BigInt(basisPoints), 10_000n);
}

export function allocateLargestRemainder(
  target: bigint,
  entries: AllocationEntry[],
): AllocationResult[] {
  if (target < 0n || entries.length === 0) {
    throw new Error("Target alokasi tidak valid.");
  }
  const ids = new Set<string>();
  for (const entry of entries) {
    if (
      ids.has(entry.id) ||
      !Number.isInteger(entry.position) ||
      entry.position < 1 ||
      entry.weight < 0n
    ) {
      throw new Error("Bobot atau kunci alokasi tidak valid.");
    }
    ids.add(entry.id);
  }

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0n);
  if (target > 0n && totalWeight === 0n) {
    throw new Error("Target positif memerlukan bobot positif.");
  }
  if (totalWeight === 0n) {
    return entries.map((entry) => ({
      ...entry,
      amount: 0n,
      remainder: 0n,
      receivedRemainder: false,
    }));
  }

  const initial = entries.map((entry) => {
    const numerator = target * entry.weight;
    return {
      ...entry,
      amount: numerator / totalWeight,
      remainder: numerator % totalWeight,
      receivedRemainder: false,
    };
  });
  let remaining =
    target - initial.reduce((sum, entry) => sum + entry.amount, 0n);
  const order = [...initial].sort(
    (left, right) =>
      (left.remainder === right.remainder
        ? 0
        : left.remainder > right.remainder
          ? -1
          : 1) ||
      left.position - right.position ||
      left.id.localeCompare(right.id),
  );
  for (const entry of order) {
    if (remaining === 0n) break;
    entry.amount += 1n;
    entry.receivedRemainder = true;
    remaining -= 1n;
  }
  if (remaining !== 0n) {
    throw new Error("Alokasi tidak dapat direkonsiliasi.");
  }
  return initial;
}
