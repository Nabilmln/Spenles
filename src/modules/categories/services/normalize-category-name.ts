export function normalizeCategoryDisplayName(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ");
}

export function normalizeCategoryName(value: string) {
  return normalizeCategoryDisplayName(value).toLocaleLowerCase("id-ID");
}
