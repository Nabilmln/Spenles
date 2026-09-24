"use client";

export function reloadApp(): void {
  window.location.reload();
}

export function reportClientError(error: Error & { digest?: string }): void {
  console.error(error);
}