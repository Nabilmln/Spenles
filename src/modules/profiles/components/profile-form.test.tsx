import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfileForm } from "./profile-form";

vi.mock("../actions/update-profile", () => ({ updateProfileAction: vi.fn(async () => ({})) }));
afterEach(cleanup);

const profile = {
  id: "p-1",
  userId: "u-1",
  displayName: "Budi",
  defaultCurrency: "IDR",
  timezone: "Asia/Jakarta",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ProfileForm", () => {
  it("keeps the account settings and excludes theme controls", () => {
    render(<ProfileForm profile={profile} email="budi@example.com" />);
    expect(screen.getByLabelText("Display name")).toHaveValue("Budi");
    expect(screen.getByLabelText("Email")).toHaveValue("budi@example.com");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Theme")).not.toBeInTheDocument();
  });
});
