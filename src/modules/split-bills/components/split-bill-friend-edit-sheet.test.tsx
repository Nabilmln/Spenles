import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SplitBillFriendEditSheet } from "./split-bill-friend-edit-sheet";

const { updateFriendAction, deleteFriendAction } = vi.hoisted(() => ({
  updateFriendAction: vi.fn(async () => ({ success: "Friend saved." })),
  deleteFriendAction: vi.fn(async () => ({ ok: true })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("../../friends/actions/friend-actions", () => ({
  updateFriendAction,
  deleteFriendAction,
}));

afterEach(() => {
  cleanup();
  updateFriendAction.mockClear();
  deleteFriendAction.mockClear();
});

const friend = { id: "f1", name: "Ayu", createdAt: "2026-01-01T00:00:00.000Z" };

describe("split-bill friend edit sheet", () => {
  it("renders the friend name prefilled and lets it be changed", () => {
    render(
      <SplitBillFriendEditSheet
        open
        onClose={vi.fn()}
        friend={friend}
        onSaved={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    const input = screen.getByLabelText("Friend name") as HTMLInputElement;
    expect(input.value).toBe("Ayu");
    fireEvent.change(input, { target: { value: "Ayu Lestari" } });
    expect(input.value).toBe("Ayu Lestari");
  });

  it("saves a renamed friend", async () => {
    const onSaved = vi.fn();
    const onClose = vi.fn();
    render(
      <SplitBillFriendEditSheet
        open
        onClose={onClose}
        friend={friend}
        onSaved={onSaved}
        onDeleted={vi.fn()}
      />,
    );
    const input = screen.getByLabelText("Friend name");
    fireEvent.change(input, { target: { value: "Ayu Lestari" } });
    const form = screen
      .getByLabelText("Friend name")
      .closest("form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(onSaved).toHaveBeenCalledWith({
      ...friend,
      name: "Ayu Lestari",
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("deletes the friend only after confirmation", async () => {
    const onDeleted = vi.fn();
    const onClose = vi.fn();
    render(
      <SplitBillFriendEditSheet
        open
        onClose={onClose}
        friend={friend}
        onSaved={vi.fn()}
        onDeleted={onDeleted}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete Friend" }));
    const dialog = screen.getByRole("alertdialog");
    expect(
      within(dialog).getByText(/Existing split bills are not affected/),
    ).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete Friend" }),
    );

    await waitFor(() => expect(deleteFriendAction).toHaveBeenCalledWith("f1"));
    expect(onDeleted).toHaveBeenCalledWith("f1");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});