import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FriendRow } from "@/modules/friends/queries/friends";
import { FriendCarousel } from "./friend-carousel";

afterEach(cleanup);

const friends: FriendRow[] = [
  { id: "f1", name: "Ayu", avatarIndex: 2, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "f2", name: "Bima", avatarIndex: null, createdAt: "2026-01-02T00:00:00.000Z" },
];

describe("friend carousel", () => {
  it("shows a dashed add-friend state when there are no friends", () => {
    const onAddFriend = vi.fn();
    render(
      <FriendCarousel
        friends={[]}
        onAddFriend={onAddFriend}
        onSelectFriend={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /add friend/i }));
    expect(onAddFriend).toHaveBeenCalledTimes(1);
  });

  it("renders saved and fallback portraits with an add entry", () => {
    const onAddFriend = vi.fn();
    render(
      <FriendCarousel
        friends={friends}
        onAddFriend={onAddFriend}
        onSelectFriend={vi.fn()}
      />,
    );
    expect(screen.getByText("Ayu")).toBeInTheDocument();
    expect(screen.getByText("Bima")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ayu" }).querySelector("img")?.getAttribute("src")).toContain("cat.webp");
    expect(screen.getByRole("button", { name: "Bima" }).querySelector("img")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    expect(onAddFriend).toHaveBeenCalledTimes(1);
  });

  it("selects a friend when an avatar is tapped", () => {
    const onSelectFriend = vi.fn();
    render(
      <FriendCarousel
        friends={friends}
        onAddFriend={vi.fn()}
        onSelectFriend={onSelectFriend}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /ayu/i }));
    expect(onSelectFriend).toHaveBeenCalledTimes(1);
    expect(onSelectFriend).toHaveBeenCalledWith(friends[0]);
  });
});
