import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfileMenu } from "./profile-menu";

vi.mock("@/modules/auth/actions/logout", () => ({
  logoutAction: vi.fn(),
}));

const { logoutAction } = await import("@/modules/auth/actions/logout");

afterEach(cleanup);

function renderMenu() {
  return render(
    <ProfileMenu
      displayName="Budi"
      email="budi@example.com"
      defaultCurrency="IDR"
      timezone="Asia/Jakarta"
    />,
  );
}

describe("ProfileMenu", () => {
  it("shows the avatar trigger and opens an internal menu", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Open profile" });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profile" })).toBeInTheDocument();
    expect(logoutAction).toHaveBeenCalledTimes(0);
  });

  it("shows profile data directly when opened", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));

    expect(screen.getByRole("dialog", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getAllByText("Budi").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("budi@example.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("IDR")).toBeInTheDocument();
    expect(screen.getByText("Asia/Jakarta")).toBeInTheDocument();
  });

  it("places logout inside the menu, styled as destructive and not a header button", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));
    const logout = screen
      .getAllByText("Log out")[0]
      .closest("button") as HTMLButtonElement;
    expect(logout).toHaveClass("text-expense");
    expect(logout).toHaveAttribute("type", "submit");
  });

  it("closes the menu with the Escape key", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("keeps the Edit profile link clickable after opening", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));
    const editLinks = screen.getAllByRole("link", { name: "Edit profile" });
    expect(editLinks.length).toBeGreaterThanOrEqual(1);
    expect(editLinks[0]).toHaveAttribute("href", "/settings/profile");
  });

  it("submits logout from the opened panel", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));
    const logout = screen
      .getAllByText("Log out")[0]
      .closest("button") as HTMLButtonElement;
    fireEvent.click(logout);
    expect(logoutAction).toHaveBeenCalledTimes(1);
  });
});