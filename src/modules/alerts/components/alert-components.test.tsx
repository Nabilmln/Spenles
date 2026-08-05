import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AlertList } from "./alert-list";

describe("AlertList", () => {
  it("renders private alerts in a polite live region", () => {
    render(
      <AlertList
        alerts={[
          {
            id: "budget-1",
            tone: "warning",
            title: "Anggaran mendekati batas",
            message: "Pemakaian sudah mencapai ambang.",
            href: "/budgets",
          },
        ]}
      />,
    );
    expect(screen.getByLabelText("Peringatan keuangan")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });
});
