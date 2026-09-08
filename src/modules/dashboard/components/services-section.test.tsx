import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesSection } from "./services-section";

vi.mock("@/modules/transactions/components/add-transaction-sheet", () => ({
  AddTransactionSheet: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="Add transaction" /> : null,
}));

vi.mock("@/modules/profiles/actions/update-profile", () => ({
  updateProfileAction: vi.fn(async () => ({})),
}));

vi.mock("@/modules/auth/actions/logout", () => ({
  logoutAction: vi.fn(),
}));

afterEach(cleanup);

const profile = {
  id: "p-1",
  userId: "u-1",
  displayName: "Budi",
  defaultCurrency: "IDR",
  timezone: "Asia/Jakarta",
  theme: "light" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ServicesSection", () => {
  it("shows the quick services and a More Services action on the heading", () => {
    render(<ServicesSection profile={profile} email="budi@example.com" />);

    expect(screen.getByRole("heading", { name: "Services" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "More Services" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Quick services" }),
    ).toBeInTheDocument();
  });

  it("lists every service in the More Services modal as pages or sheets", () => {
    render(<ServicesSection profile={profile} email="budi@example.com" />);

    fireEvent.click(screen.getByRole("button", { name: "More Services" }));

    expect(screen.getByRole("dialog", { name: "Services" })).toBeInTheDocument();

    for (const label of ["Accounts", "Categories", "Reports", "Split Bill"]) {
      expect(
        screen.getAllByRole("link", { name: label }).length,
      ).toBeGreaterThanOrEqual(1);
    }

    expect(screen.getByRole("button", { name: "Add Expense" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Profile" })).toBeInTheDocument();
  });

  it("opens the Add Expense sheet from the services modal", () => {
    render(<ServicesSection profile={profile} email="budi@example.com" />);

    fireEvent.click(screen.getByRole("button", { name: "More Services" }));
    expect(screen.queryByRole("dialog", { name: "Add transaction" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add Expense" }));
    expect(screen.getByRole("dialog", { name: "Add transaction" })).toBeInTheDocument();
  });

  it("opens the Profile sheet from the services modal", () => {
    render(<ServicesSection profile={profile} email="budi@example.com" />);

    fireEvent.click(screen.getByRole("button", { name: "More Services" }));
    fireEvent.click(screen.getByRole("button", { name: "Profile" }));

    expect(screen.getByRole("dialog", { name: "Profile" })).toBeInTheDocument();
  });

  it("closes the modal with the close button", async () => {
    render(<ServicesSection profile={profile} email="budi@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: "More Services" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
