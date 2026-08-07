import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CategoryIconPicker } from "./category-icon-picker";
import { CategoryManager } from "./category-manager";

afterEach(cleanup);

type Item = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string | null;
  color: string | null;
  status: "active" | "archived";
  isDefault: boolean;
};

const expense = (overrides: Partial<Item> = {}): Item => ({
  id: "exp-1",
  name: "Makanan",
  type: "expense",
  icon: "utensils",
  color: null,
  status: "active",
  isDefault: true,
  ...overrides,
});

const income = (overrides: Partial<Item> = {}): Item => ({
  id: "inc-1",
  name: "Gaji",
  type: "income",
  icon: "wallet",
  color: null,
  status: "active",
  isDefault: true,
  ...overrides,
});

const renderManager = (items: Item[], deletableIds: Set<string> = new Set()) =>
  render(<CategoryManager categories={items} deletableIds={deletableIds} />);

vi.mock("../actions/category-actions", () => ({
  archiveCategoryAction: async () => ({}),
  restoreCategoryAction: async () => ({}),
  deleteCategoryAction: async () => ({}),
  updateCategoryAction: async () => ({}),
}));

describe("category manager", () => {
  it("separates income and expense categories by tab", () => {
    renderManager([expense(), income()]);

    expect(screen.getByRole("tab", { name: "Pengeluaran" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Makanan")).toBeInTheDocument();
    expect(screen.queryByText("Gaji")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Pendapatan" }));
    expect(screen.getByRole("tab", { name: "Pendapatan" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Gaji")).toBeInTheDocument();
    expect(screen.queryByText("Makanan")).not.toBeInTheDocument();
  });

  it("shows an inline empty state for an empty selected tab", () => {
    renderManager([expense()]);

    fireEvent.click(screen.getByRole("tab", { name: "Pendapatan" }));
    expect(screen.getByText("Belum ada kategori pendapatan")).toBeInTheDocument();
    expect(screen.getByText("Kategori yang kamu buat akan muncul di sini.")).toBeInTheDocument();
  });

  it("renders each category row with an action button", () => {
    renderManager([expense(), expense({ id: "exp-2", name: "Transportasi" })]);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Aksi untuk Makanan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aksi untuk Transportasi" })).toBeInTheDocument();
  });

  it("opens the action menu with edit, archive and delete items", () => {
    renderManager([expense()]);
    fireEvent.click(screen.getByRole("button", { name: "Aksi untuk Makanan" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Edit kategori" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Arsipkan/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Hapus" })).toBeInTheDocument();
  });

  it("opens the edit sheet from the action menu", () => {
    renderManager([expense()]);
    fireEvent.click(screen.getByRole("button", { name: "Aksi untuk Makanan" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit kategori" }));

    expect(screen.getByRole("dialog", { name: "Edit kategori" })).toBeInTheDocument();
  });

  it("shows a permanent delete confirmation only when deletable", () => {
    renderManager([expense({ isDefault: false })], new Set(["exp-1"]));
    fireEvent.click(screen.getByRole("button", { name: "Aksi untuk Makanan" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Hapus" }));

    expect(screen.getByRole("dialog", { name: "Hapus kategori?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus permanen" })).toBeInTheDocument();
  });

  it("does not allow permanent delete for a referenced or default category", () => {
    renderManager([expense()], new Set());
    fireEvent.click(screen.getByRole("button", { name: "Aksi untuk Makanan" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Hapus" }));

    const dialog = screen.getByRole("dialog", { name: "Hapus kategori?" });
    expect(screen.queryByRole("button", { name: "Hapus permanen" })).not.toBeInTheDocument();
    expect(dialog).toHaveTextContent(/tidak dapat dihapus permanen/u);
  });

  it("opens the icon picker with accessible radio labels", () => {
    const onChange = vi.fn();
    render(<CategoryIconPicker value="utensils" onChange={onChange} />);

    expect(screen.getByRole("radiogroup", { name: "Pilih ikon" })).toBeInTheDocument();
    const option = screen.getByRole("radio", { name: "Ikon peralatan makan" });
    expect(option).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Ikon mobil" }));
    expect(onChange).toHaveBeenCalledWith("car");
  });
});