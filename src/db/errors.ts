const MAX_ERROR_CHAIN_DEPTH = 8;

function readStringProperty(
  value: object,
  property: "code",
): string | undefined {
  const candidate = (value as Record<string, unknown>)[property];
  return typeof candidate === "string" ? candidate : undefined;
}

function readNestedError(
  value: object,
): unknown {
  const candidate = value as Record<string, unknown>;
  return candidate.cause ?? candidate.sourceError;
}

export function hasPostgresErrorCode(
  error: unknown,
  expectedCode: string,
) {
  const visited = new Set<object>();
  let current = error;

  for (let depth = 0; depth < MAX_ERROR_CHAIN_DEPTH; depth += 1) {
    if (typeof current !== "object" || current === null || visited.has(current)) {
      return false;
    }

    if (readStringProperty(current, "code") === expectedCode) {
      return true;
    }

    visited.add(current);
    current = readNestedError(current);
  }

  return false;
}
