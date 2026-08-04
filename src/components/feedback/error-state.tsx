"use client";

import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Terjadi kendala",
  message = "Kami belum dapat memuat halaman ini.",
  retry,
}: {
  title?: string;
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="state-panel" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
      {retry ? <Button onClick={retry}>Coba lagi</Button> : null}
    </div>
  );
}
