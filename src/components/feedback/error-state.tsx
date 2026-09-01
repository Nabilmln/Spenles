"use client";

import { Button } from "@/components/ui/button";
import { statePanelClass } from "@/components/ui/styles";

export function ErrorState({
  title = "Something went wrong",
  message = "We could not load this page.",
  retry,
}: {
  title?: string;
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className={statePanelClass} role="alert">
      <h2>{title}</h2>
      <p className="m-0 text-muted">{message}</p>
      {retry ? <Button onClick={retry}>Try again</Button> : null}
    </div>
  );
}
