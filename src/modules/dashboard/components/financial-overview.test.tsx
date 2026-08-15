import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FinancialOverview } from "./financial-overview";

afterEach(cleanup);

const MASK = "••••••";

function renderOverview(income = "4500000", expense = "1200000") {
  return render(
    <FinancialOverview income={income} expense={expense} name="Nabil" />,
  );
}

describe("FinancialOverview", () => {
  it("shows the greeting together with the user name", () => {
    renderOverview();
    expect(screen.getByRole("heading", { name: "Halo, Nabil" })).toBeInTheDocument();
  });

  it("shows Pendapatan and Pengeluaran with their values only", () => {
    renderOverview();
    expect(screen.getByText("Pendapatan")).toBeInTheDocument();
    expect(screen.getByText("Pengeluaran")).toBeInTheDocument();
    expect(screen.queryByText("Arus kas bersih")).not.toBeInTheDocument();
    expect(screen.getByText(/4\.500\.000/u)).toBeInTheDocument();
    expect(screen.getByText(/1\.200\.000/u)).toBeInTheDocument();
    expect(screen.getByLabelText("Ringkasan keuangan")).toBeInTheDocument();
  });

  it("keeps zero values visible without removing the container", () => {
    renderOverview("0", "0");
    const values = screen.getAllByText(/Rp\s*0/u);
    expect(values).toHaveLength(2);
    expect(screen.getByLabelText("Ringkasan keuangan")).toBeInTheDocument();
    expect(screen.getByText("Pendapatan")).toBeInTheDocument();
    expect(screen.getByText("Pengeluaran")).toBeInTheDocument();
  });

  it("starts visible with a dynamic 'Sembunyikan nominal' label", () => {
    renderOverview();
    const eye = screen.getByRole("button", { name: "Sembunyikan nominal" });
    expect(eye).toHaveAttribute("aria-pressed", "false");
  });

  it("hides all amounts when the eye button is pressed", () => {
    renderOverview();
    fireEvent.click(screen.getByRole("button", { name: "Sembunyikan nominal" }));

    expect(screen.getAllByText(MASK)).toHaveLength(2);
    expect(screen.queryByText(/4\.500\.000/u)).not.toBeInTheDocument();
    expect(screen.queryByText(/1\.200\.000/u)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tampilkan nominal" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("restores the amounts and switches the label back when pressed again", () => {
    renderOverview();
    fireEvent.click(screen.getByRole("button", { name: "Sembunyikan nominal" }));
    fireEvent.click(screen.getByRole("button", { name: "Tampilkan nominal" }));

    expect(screen.getByText(/4\.500\.000/u)).toBeInTheDocument();
    expect(screen.getByText(/1\.200\.000/u)).toBeInTheDocument();
    expect(screen.queryAllByText(MASK)).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "Sembunyikan nominal" }),
    ).toBeInTheDocument();
  });

  it("never hides the Pendapatan or Pengeluaran labels", () => {
    renderOverview();
    fireEvent.click(screen.getByRole("button", { name: "Sembunyikan nominal" }));
    expect(screen.getByText("Pendapatan")).toBeInTheDocument();
    expect(screen.getByText("Pengeluaran")).toBeInTheDocument();
  });

  it("exposes no dashboard add-transaction button (only the privacy eye)", () => {
    renderOverview();
    expect(screen.queryByRole("link", { name: "Tambah transaksi" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /(Tambah|Buat)/u }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});