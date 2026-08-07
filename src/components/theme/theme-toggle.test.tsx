import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";
import { setThemeAction } from "@/modules/profiles/actions/update-profile";

vi.mock("@/modules/profiles/actions/update-profile", () => ({
  setThemeAction: vi.fn(),
}));

afterEach(() => {
  cleanup();
  document.documentElement.className = "";
});

describe("ThemeToggle", () => {
  it("offers a single light to dark toggle with a dynamic label", () => {
    render(<ThemeToggle currentTheme="light" />);
    const button = screen.getByRole("button", { name: "Aktifkan mode gelap" });
    expect(screen.queryByRole("button", { name: "Tema Sistem" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tema Terang" })).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(setThemeAction).toHaveBeenCalledWith("dark");
    expect(document.documentElement.className).toBe("theme-dark");
    expect(
      screen.getByRole("button", { name: "Aktifkan mode terang" }),
    ).toBeInTheDocument();
  });

  it("labels the reverse direction when already dark", () => {
    render(<ThemeToggle currentTheme="dark" />);
    expect(
      screen.getByRole("button", { name: "Aktifkan mode terang" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aktifkan mode terang" }));
    expect(setThemeAction).toHaveBeenCalledWith("light");
    expect(document.documentElement.className).toBe("theme-light");
  });
});
