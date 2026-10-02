import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast, useToastActionState } from "./toast";

const push = vi.fn();

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  push.mockClear();
});

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

function ActionTrigger() {
  const [, action] = useToastActionState<{ success?: string; redirectTo?: string }, FormData>(
    async () => ({ success: "Expense recorded.", redirectTo: "/transactions" }),
    {},
    push,
  );
  return <form action={action}><button type="submit">Save expense</button></form>;
}

function SheetActionTrigger({ onSuccess, fail = false }: { onSuccess: () => void; fail?: boolean }) {
  const [, action] = useToastActionState<{ success?: string; error?: string }, FormData>(
    async () => fail ? { error: "Could not save." } : { success: "Saved." },
    {},
    undefined,
    onSuccess,
  );
  return <form action={action}><button type="submit">Save in sheet</button></form>;
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
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");

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

  it("shows multiple notifications one at a time", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "ok" }));
    fireEvent.click(screen.getByRole("button", { name: "info" }));
    fireEvent.click(screen.getByRole("button", { name: "err" }));

    expect(screen.getByRole("status")).toHaveTextContent("Saved successfully");
    expect(screen.queryByText("Informasi terbaru")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByRole("status")).toHaveTextContent("Informasi terbaru");

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Terjadi kesalahan");
  });

  it("dismisses automatically after four seconds", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "ok" }));
    act(() => vi.advanceTimersByTime(3999));
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows successful action feedback and navigates to its destination", async () => {
    render(
      <ToastProvider>
        <ActionTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save expense" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Expense recorded.");
    expect(push).toHaveBeenCalledWith("/transactions");

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    fireEvent.click(screen.getByRole("button", { name: "Save expense" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Expense recorded.");
    expect(push).toHaveBeenCalledTimes(2);
  });

  it("calls a sheet success handler once per successful submission and never on errors", async () => {
    const onSuccess = vi.fn();
    const view = render(
      <ToastProvider>
        <SheetActionTrigger onSuccess={onSuccess} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save in sheet" }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    view.rerender(<ToastProvider><SheetActionTrigger onSuccess={onSuccess} /></ToastProvider>);
    expect(onSuccess).toHaveBeenCalledTimes(1);

    view.unmount();
    render(<ToastProvider><SheetActionTrigger onSuccess={onSuccess} fail /></ToastProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Save in sheet" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save.");
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
