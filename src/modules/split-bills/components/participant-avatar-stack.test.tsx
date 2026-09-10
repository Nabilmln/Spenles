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
    expect(
      screen.getByRole("img", { name: "1 participants" }),
    ).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("stacks up to three avatars and shows the remaining count", () => {
    render(
      <ParticipantAvatarStack
        names={["Ayu", "Bima", "Caca", "Deni", "Eka"]}
        count={5}
      />,
    );
    expect(
      screen.getByRole("img", { name: "5 participants" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^[ABC]$/).length).toBe(3);
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
      avatarWrappers.some((el) => String(el.className).includes("-ml-[1.3rem]")),
    ).toBe(true);
  });
});