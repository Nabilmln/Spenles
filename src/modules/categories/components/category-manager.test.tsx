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

    expect(screen.getByRole("tab", { name: "Expense" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Makanan")).toBeInTheDocument();
    expect(screen.queryByText("Gaji")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Income" }));
    expect(screen.getByRole("tab", { name: "Income" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Gaji")).toBeInTheDocument();
    expect(screen.queryByText("Makanan")).not.toBeInTheDocument();
  });

  it("shows an inline empty state for an empty selected tab", () => {
    renderManager([expense()]);

    fireEvent.click(screen.getByRole("tab", { name: "Income" }));
    expect(screen.getByText("No income categories yet")).toBeInTheDocument();
    expect(screen.getByText("Categories you create will show up here.")).toBeInTheDocument();
  });

  it("renders each category row with an action button", () => {
    renderManager([expense(), expense({ id: "exp-2", name: "Transportasi" })]);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Actions for Makanan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actions for Transportasi" })).toBeInTheDocument();
  });

  it("opens the action menu with edit, archive and delete items", () => {
    renderManager([expense()]);
    fireEvent.click(screen.getByRole("button", { name: "Actions for Makanan" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Edit category" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Archive/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
  });

  it("opens the edit sheet from the action menu", () => {
    renderManager([expense()]);
    fireEvent.click(screen.getByRole("button", { name: "Actions for Makanan" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit category" }));

    expect(screen.getByRole("dialog", { name: "Edit category" })).toBeInTheDocument();
  });

  it("shows a permanent delete confirmation only when deletable", () => {
    renderManager([expense({ isDefault: false })], new Set(["exp-1"]));
    fireEvent.click(screen.getByRole("button", { name: "Actions for Makanan" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(screen.getByRole("dialog", { name: "Delete category?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete permanently" })).toBeInTheDocument();
  });

  it("does not allow permanent delete for a referenced or default category", () => {
    renderManager([expense()], new Set());
    fireEvent.click(screen.getByRole("button", { name: "Actions for Makanan" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

    const dialog = screen.getByRole("dialog", { name: "Delete category?" });
    expect(screen.queryByRole("button", { name: "Delete permanently" })).not.toBeInTheDocument();
    expect(dialog).toHaveTextContent(/cannot be permanently deleted/u);
  });

  it("opens the icon picker with accessible radio labels", () => {
    const onChange = vi.fn();
    render(<CategoryIconPicker value="utensils" onChange={onChange} />);

    expect(screen.getByRole("radiogroup", { name: "Choose icon" })).toBeInTheDocument();
    const option = screen.getByRole("radio", { name: "Dining icon" });
    expect(option).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Car icon" }));
    expect(onChange).toHaveBeenCalledWith("car");
  });
});