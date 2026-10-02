import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SplitBillFriendAddSheet } from "./split-bill-friend-add-sheet";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("../../friends/actions/friend-actions", () => ({
  createFriendAction: vi.fn(async () => ({ success: "Friend added." })),
}));

afterEach(cleanup);

describe("split-bill friend add sheet", () => {
  it("starts with one portrait and submits the one selected by the user", () => {
    render(<SplitBillFriendAddSheet open onClose={vi.fn()} />);

    const choices = screen.getAllByRole("radio", { name: /^Avatar \d$/ });
    expect(choices).toHaveLength(5);
    expect(choices.filter((choice) => (choice as HTMLInputElement).checked)).toHaveLength(1);

    fireEvent.click(screen.getByRole("radio", { name: "Avatar 5" }));
    const form = screen.getByLabelText("Friend name").closest("form") as HTMLFormElement;
    expect(new FormData(form).get("avatarIndex")).toBe("5");
  });

  it("closes after a friend is added", async () => {
    const onClose = vi.fn();
    render(<SplitBillFriendAddSheet open onClose={onClose} />);

    fireEvent.change(screen.getByLabelText("Friend name"), { target: { value: "Ayu" } });
    fireEvent.submit(screen.getByLabelText("Friend name").closest("form") as HTMLFormElement);

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});
