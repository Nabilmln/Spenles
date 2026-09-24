"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.25rem",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          backgroundColor: "#f5f5f7",
          color: "#1a1a1f",
        }}
      >
        <div
          role="alert"
          style={{
            textAlign: "center",
            maxWidth: "28rem",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>
            Spenles sedang mengalami gangguan
          </h1>
          <p style={{ margin: "0 0 1rem", color: "#6b7280" }}>
            Data pribadi Anda tetap aman. Coba muat ulang aplikasi.
          </p>
          <button
            onClick={() => window.location.reload()}
            type="button"
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "0.5rem",
              border: "0",
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Muat ulang
          </button>
          {error.digest ? (
            <p
              style={{
                margin: "1rem 0 0",
                color: "#9ca3af",
                fontSize: "0.75rem",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              Kode error: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}