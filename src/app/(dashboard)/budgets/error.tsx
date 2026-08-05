"use client";
import { PrivateDataError } from "@/components/feedback/private-data-error";
export default function BudgetsError(props: Parameters<typeof PrivateDataError>[0]) {
  return <PrivateDataError {...props} subject="Anggaran" />;
}
