import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  updateCategoryAction: async () => ({ success: "Category updated successfully." }),
  createCategoryAction: async () => ({ success: "Category created successfully." }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
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

  it("opens the action sheet with edit, archive and delete items", () => {
    renderManager([expense()]);
    fireEvent.click(screen.getByRole("button", { name: "Actions for Makanan" }));

    expect(screen.getByRole("dialog", { name: "Category actions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit category" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Archive/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("opens the edit sheet from the action sheet", () => {
    renderManager([expense()]);
    fireEvent.click(screen.getByRole("button", { name: "Actions for Makanan" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit category" }));

    expect(screen.getByRole("dialog", { name: "Edit category" })).toBeInTheDocument();
  });

  it("shows a permanent delete confirmation only when deletable", () => {
    renderManager([expense({ isDefault: false })], new Set(["exp-1"]));
    fireEvent.click(screen.getByRole("button", { name: "Actions for Makanan" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByRole("dialog", { name: "Delete category?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete permanently" })).toBeInTheDocument();
  });

  it("does not allow permanent delete for a referenced or default category", () => {
    renderManager([expense()], new Set());
    fireEvent.click(screen.getByRole("button", { name: "Actions for Makanan" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    const dialog = screen.getByRole("dialog", { name: "Delete category?" });
    expect(screen.queryByRole("button", { name: "Delete permanently" })).not.toBeInTheDocument();
    expect(dialog).toHaveTextContent(/cannot be permanently deleted/u);
  });

  it("closes the edit sheet after a successful save", async () => {
    renderManager([expense()]);
    fireEvent.click(screen.getByRole("button", { name: "Actions for Makanan" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit category" }));
    const dialog = screen.getByRole("dialog", { name: "Edit category" });
    expect(dialog).toBeInTheDocument();

    const item = dialog.querySelector("input[name=name]");
    await waitFor(() => {
      expect(item).not.toBeNull();
    });
    fireEvent.change(item as HTMLInputElement, { target: { value: "Makan baru" } });
    fireEvent.submit(dialog.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Edit category" })).not.toBeInTheDocument();
    });
  });

  it("closes the create sheet after a successful add", async () => {
    renderManager([]);
    fireEvent.click(screen.getByRole("button", { name: "Add Category" }));
    const dialog = screen.getByRole("dialog", { name: "Add category" });
    expect(dialog).toBeInTheDocument();

    const item = dialog.querySelector("input[name=name]");
    await waitFor(() => {
      expect(item).not.toBeNull();
    });
    fireEvent.change(item as HTMLInputElement, { target: { value: "Kesehatan baru" } });
    fireEvent.submit(dialog.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Add category" })).not.toBeInTheDocument();
    });
  });

  it("lets an existing category change its icon in the edit sheet", () => {
    renderManager([expense({ icon: "utensils" })]);
    fireEvent.click(screen.getByRole("button", { name: "Actions for Makanan" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit category" }));

    expect(screen.getByRole("radio", { name: "Dining icon" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Car icon" }));
    expect(screen.getByRole("radio", { name: "Car icon" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Dining icon" })).not.toBeChecked();
  });

  it("renders the category icon circle with its configured color", () => {
    const { container } = renderManager([
      expense({ id: "exp-red", name: "Kesehatan", color: "red" }),
      expense({ color: null }),
    ]);

    const rows = container.querySelectorAll("[role=listitem]");
    expect(rows[0].firstElementChild).toHaveClass("bg-red-50");
    expect(rows[1].firstElementChild).toHaveClass("bg-primary-50");
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