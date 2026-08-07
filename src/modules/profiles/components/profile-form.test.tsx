import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfileForm } from "./profile-form";

vi.mock("../actions/update-profile", () => ({
  updateProfileAction: vi.fn(async () => ({})),
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

describe("ProfileForm theme field", () => {
  it("does not expose a system/laptop theme option in the visible UI", () => {
    render(<ProfileForm profile={profile} email="budi@example.com" />);
    const options = screen.getByLabelText("Tema").children;
    const labels = Array.from(options).map((option) => option.textContent);
    expect(labels).toEqual(["Terang", "Gelap"]);
    expect(labels).not.toContain("Ikuti sistem");
  });
});