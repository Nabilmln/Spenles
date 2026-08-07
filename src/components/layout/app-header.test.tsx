import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { setThemeAction } from "@/modules/profiles/actions/update-profile";
import { HeaderContent } from "./header-content";

const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/transactions"),
  useRouter: () => ({ push: pushMock, back: backMock }),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("@/modules/profiles/actions/update-profile", () => ({
  setThemeAction: vi.fn(),
}));

vi.mock("@/modules/auth/actions/logout", () => ({
  logoutAction: vi.fn(),
}));

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

afterEach(cleanup);
beforeEach(() => {
  pushMock.mockClear();
  backMock.mockClear();
  vi.mocked(setThemeAction).mockClear();
});

function renderHeader() {
  return render(<HeaderContent profile={profile} email="budi@example.com" />);
}

describe("HeaderContent shared mobile header", () => {
  it("shows back button, page title, theme toggle and profile menu on secondary pages", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: "Kembali" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Transaksi" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Aktifkan mode gelap" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menu profil" })).toBeInTheDocument();
  });

  it("exposes no system/laptop theme control", () => {
    renderHeader();
    expect(
      screen.queryByRole("button", { name: "Pilih tema" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Ikuti sistem")).not.toBeInTheDocument();
  });

  it("navigates back when the back button is used", () => {
    Object.defineProperty(window.history, "length", { value: 3, configurable: true });
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "Kembali" }));
    expect(backMock).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("falls back to the parent route when there is no history to go back to", () => {
    Object.defineProperty(window.history, "length", { value: 1, configurable: true });
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "Kembali" }));
    expect(window.history.length).toBe(1);
    expect(pushMock.mock.calls).toEqual([["/dashboard"]]);
    expect(backMock).not.toHaveBeenCalled();
  });

  it("toggles the theme from the header", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "Aktifkan mode gelap" }));
    expect(setThemeAction).toHaveBeenCalledWith("dark");
    expect(document.documentElement.className).toBe("theme-dark");
  });
});

describe("HeaderContent home tab", () => {
  it("shows the brand without a back button on the dashboard", () => {
    vi.mocked(usePathname).mockReturnValue("/dashboard");
    renderHeader();
    expect(screen.queryByRole("button", { name: "Kembali" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Spenles" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Beranda" }),
    ).not.toBeInTheDocument();
  });
});
