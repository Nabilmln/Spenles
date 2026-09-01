import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Select } from "./select";

afterEach(cleanup);

describe("Select shared control", () => {
  it("marks the trigger as selectable and renders options", () => {
    render(
      <Select aria-label="Jenis" name="type">
        <option value="expense">Pengeluaran</option>
        <option value="income">Pemasukan</option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "Jenis" });
    expect(select).toHaveAttribute("name", "type");
    expect(select.querySelectorAll("option")).toHaveLength(2);
  });

  it("forwards id and value to the underlying control", () => {
    render(
      <Select id="sort" name="sort" value="desc" onChange={() => {}}>
        <option value="desc">Terbaru dahulu</option>
        <option value="asc">Terlama dahulu</option>
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("id", "sort");
    expect(select).toHaveValue("desc");
  });

  it("disables the control together with its caret", () => {
    render(
      <Select aria-label="Account" disabled>
        <option value="a">Akun A</option>
      </Select>,
    );
    expect(screen.getByRole("combobox", { name: "Account" })).toBeDisabled();
  });

  it("reflects user selection via onChange", () => {
    let current = "expense";
    render(
      <Select
        aria-label="Jenis"
        onChange={(event) => {
          current = event.target.value;
        }}
        value={current}
      >
        <option value="expense">Pengeluaran</option>
        <option value="income">Pemasukan</option>
      </Select>,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "income" },
    });
    expect(current).toBe("income");
  });
});