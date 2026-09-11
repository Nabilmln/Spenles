import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FriendRow } from "@/modules/friends";
import { MakeBillFriendPickerSheet } from "./make-bill-friend-picker-sheet";

afterEach(cleanup);

const friends: FriendRow[] = [
  { id: "f1", name: "Nabil", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "f2", name: "Ayu", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "f3", name: "Budi", createdAt: "2026-01-01T00:00:00.000Z" },
];

describe("MakeBillFriendPickerSheet", () => {
  it("filters friends by search query", () => {
    render(
      <MakeBillFriendPickerSheet
        open
        onClose={vi.fn()}
        friends={friends}
        selectedIds={[]}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Nabil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ayu" })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search friends"), {
      target: { value: "nab" },
    });

    expect(screen.getByRole("button", { name: "Nabil" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ayu" })).not.toBeInTheDocument();
  });

  it("moves a selected friend into the selected chips and removes it on tap", () => {
    render(
      <MakeBillFriendPickerSheet
        open
        onClose={vi.fn()}
        friends={friends}
        selectedIds={[]}
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Nabil" }));

    expect(screen.queryByRole("button", { name: "Nabil" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Nabil" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove Nabil" }));

    expect(screen.getByRole("button", { name: "Nabil" })).toBeInTheDocument();
  });

  it("is disabled until a friend is added, then commits the selection", () => {
    const onConfirm = vi.fn();
    render(
      <MakeBillFriendPickerSheet
        open
        onClose={vi.fn()}
        friends={friends}
        selectedIds={[]}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("button", { name: "Add Friends" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Nabil" }));
    fireEvent.click(screen.getByRole("button", { name: "Ayu" }));

    fireEvent.click(screen.getByRole("button", { name: "Add 2 Friends" }));
    expect(onConfirm).toHaveBeenCalledWith(["f1", "f2"]);
  });

  it("excludes already selected friends from the candidate list", () => {
    render(
      <MakeBillFriendPickerSheet
        open
        onClose={vi.fn()}
        friends={friends}
        selectedIds={["f1"]}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Nabil" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ayu" })).toBeInTheDocument();
  });
});