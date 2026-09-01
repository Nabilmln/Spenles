import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ToastProvider, useToast } from "./toast";

afterEach(cleanup);

function Trigger() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success("Saved successfully")}>ok</button>
      <button onClick={() => toast.error("Terjadi kesalahan")}>err</button>
      <button onClick={() => toast.info("Informasi terbaru")}>info</button>
    </div>
  );
}

describe("ToastProvider", () => {
  it("shows a success notification and dismisses it", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "ok" }));
    expect(screen.getByRole("status")).toHaveTextContent("Saved successfully");

    fireEvent.click(screen.getByRole("button", { name: "Close notification" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows errors as alert notifications", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "err" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Terjadi kesalahan");
  });

  it("stacks multiple notifications", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "ok" }));
    fireEvent.click(screen.getByRole("button", { name: "info" }));
    fireEvent.click(screen.getByRole("button", { name: "err" }));

    expect(screen.getAllByRole("status")).toHaveLength(2);
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });
});
