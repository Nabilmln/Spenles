import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfileMenu } from "./profile-menu";

vi.mock("@/modules/auth/actions/logout", () => ({
  logoutAction: vi.fn(),
}));

const { logoutAction } = await import("@/modules/auth/actions/logout");

afterEach(cleanup);

describe("ProfileMenu", () => {
  it("shows the avatar trigger and opens an internal menu", () => {
    render(<ProfileMenu displayName="Budi" email="budi@example.com" />);
    const trigger = screen.getByRole("button", { name: "Menu profil" });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profil" })).toBeInTheDocument();
    expect(logoutAction).toHaveBeenCalledTimes(0);
  });

  it("places logout inside the menu, styled as destructive and not a header button", () => {
    render(<ProfileMenu displayName="Budi" email="budi@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: "Menu profil" }));
    const logout = screen
      .getByText("Keluar")
      .closest("button") as HTMLButtonElement;
    expect(logout).toHaveClass("text-expense");
    expect(logout).toHaveAttribute("type", "submit");
  });

  it("closes the menu with the Escape key", () => {
    render(<ProfileMenu displayName="Budi" email="budi@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: "Menu profil" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});