import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ParticipantAvatarStack } from "./participant-avatar-stack";

afterEach(cleanup);

describe("participant avatar stack", () => {
  it("renders nothing when there are no participants", () => {
    const { container } = render(
      <ParticipantAvatarStack names={[]} count={0} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a single participant avatar", () => {
    render(<ParticipantAvatarStack names={["Ayu"]} count={1} />);
    const stack = screen.getByRole("img", { name: "1 participants" });
    expect(stack.querySelector("img")?.getAttribute("src")).toContain(".webp");
  });

  it("stacks the selected friend images and shows the remaining count", () => {
    render(
      <ParticipantAvatarStack
        names={["Ayu", "Bima", "Caca", "Deni", "Eka"]}
        count={5}
        avatarIndexes={[2, 4, 5, null, null]}
      />,
    );
    const stack = screen.getByRole("img", { name: "5 participants" });
    const images = [...stack.querySelectorAll("img")];
    expect(images).toHaveLength(3);
    expect(images[0].getAttribute("src")).toContain("cat.webp");
    expect(images[1].getAttribute("src")).toContain("rabbit.webp");
    expect(images[2].getAttribute("src")).toContain("otter.webp");
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("overlaps stacked avatars", () => {
    const { container } = render(
      <ParticipantAvatarStack names={["Ayu", "Bima"]} count={2} />,
    );
    const avatarWrappers = Array.from(
      container.querySelectorAll("div:first-child > div > span"),
    );
    expect(
      avatarWrappers.some((el) => String(el.className).includes("-ml-[.75rem]")),
    ).toBe(true);
  });
});
