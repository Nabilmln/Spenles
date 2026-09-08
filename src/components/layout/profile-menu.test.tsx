import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfileMenu } from "./profile-menu";

vi.mock("@/modules/auth/actions/logout", () => ({
  logoutAction: vi.fn(),
}));

vi.mock("@/modules/profiles/actions/update-profile", () => ({
  updateProfileAction: vi.fn(async () => ({})),
}));

const { logoutAction } = await import("@/modules/auth/actions/logout");

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

function renderMenu() {
  return render(<ProfileMenu profile={profile} email="budi@example.com" />);
}

describe("ProfileMenu", () => {
  it("shows the avatar trigger and opens the profile sheet", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Open profile" });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Profile" })).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Profile" })).toBeInTheDocument();
    expect(logoutAction).toHaveBeenCalledTimes(0);
  });

  it("shows profile data and an editable form when opened", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));

    expect(screen.getAllByText("Budi").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("budi@example.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("places logout inside the sheet, styled as destructive", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));
    const logout = screen
      .getAllByText("Log out")[0]
      .closest("button") as HTMLButtonElement;
    expect(logout).toHaveClass("text-expense");
    expect(logout).toHaveAttribute("type", "submit");
  });

  it("closes the sheet with the Escape key", async () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));
    expect(screen.getByRole("dialog", { name: "Profile" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Profile" })).not.toBeInTheDocument(),
    );
  });

  it("submits logout from the opened sheet", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));
    const logout = screen
      .getAllByText("Log out")[0]
      .closest("button") as HTMLButtonElement;
    fireEvent.click(logout);
    expect(logoutAction).toHaveBeenCalledTimes(1);
  });
});
