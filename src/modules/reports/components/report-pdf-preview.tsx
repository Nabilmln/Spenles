"use client";

import { useEffect, useState } from "react";

type PreviewState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error" };

export function ReportPdfPreview({
  href,
  title = "Report preview",
}: {
  href: string;
  title?: string;
}) {
  const [preview, setPreview] = useState<PreviewState>({ status: "loading" });
  const [loadedHref, setLoadedHref] = useState(href);

  if (href !== loadedHref) {
    setLoadedHref(href);
    setPreview({ status: "loading" });
  }

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    fetch(href)
      .then(async (response) => {
        if (!response.ok) throw new Error("Report preview could not be loaded.");
        const blob = await response.blob();
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPreview({ status: "ready", url: objectUrl });
      })
      .catch(() => {
        if (active) setPreview({ status: "error" });
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [href]);

  if (preview.status === "error") {
    return (
      <p
        className="grid h-[min(52dvh,26rem)] w-full place-items-center rounded-[.7rem] border border-border bg-surface-subtle p-4 text-center text-muted"
        role="status"
      >
        Preview tidak dapat dimuat. Unduh file PDF-nya melalui tombol di
        bawah.
      </p>
    );
  }

  if (preview.status !== "ready") {
    return (
      <div
        className="grid h-[min(52dvh,26rem)] w-full place-items-center rounded-[.7rem] border border-border bg-surface-subtle text-muted"
        role="status"
      >
        Memuat pratinjau…
      </div>
    );
  }

  return (
    <iframe
      className="h-[min(52dvh,26rem)] w-full rounded-[.7rem] border border-border bg-surface-subtle"
      src={preview.url}
      title={title}
    />
  );
}