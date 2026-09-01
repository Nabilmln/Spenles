import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ServicesSection } from "./services-section";
import { ALL_SERVICES } from "./services";

afterEach(cleanup);

describe("ServicesSection", () => {
  it("shows the quick services and a More Services action on the heading", () => {
    render(<ServicesSection />);

    expect(screen.getByRole("heading", { name: "Services" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "More Services" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Quick services" }),
    ).toBeInTheDocument();
  });

  it("opens a modal listing every service when More Services is pressed", () => {
    render(<ServicesSection />);

    fireEvent.click(screen.getByRole("button", { name: "More Services" }));

    expect(screen.getByRole("dialog", { name: "Services" })).toBeInTheDocument();
    for (const service of ALL_SERVICES) {
      expect(
        screen.getAllByRole("link", { name: service.label }).length,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it("closes the modal with the close button", () => {
    render(<ServicesSection />);
    fireEvent.click(screen.getByRole("button", { name: "More Services" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});