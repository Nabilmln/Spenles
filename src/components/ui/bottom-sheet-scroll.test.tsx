import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BottomSheet } from "./bottom-sheet";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.overflowY = "";
});

describe("BottomSheet scroll lock", () => {
  it("locks the page body while open and fully restores it after close", async () => {
    const { rerender } = render(
      <BottomSheet open={false} onClose={vi.fn()} title="T" ariaLabel="T">
        content
      </BottomSheet>,
    );
    expect(document.body.style.position).toBe("");
    expect(document.documentElement.style.overflow).toBe("");

    rerender(
      <BottomSheet open={true} onClose={vi.fn()} title="T" ariaLabel="T">
        content
      </BottomSheet>,
    );
    expect(document.body.style.position).toBe("fixed");
    expect(document.documentElement.style.overflow).toBe("hidden");

    rerender(
      <BottomSheet open={false} onClose={vi.fn()} title="T" ariaLabel="T">
        content
      </BottomSheet>,
    );

    await waitFor(
      () => {
        expect(document.body.style.position).toBe("");
        expect(document.documentElement.style.overflow).toBe("");
      },
      { timeout: 2000 },
    );
  });

  it("keeps the page locked until every open sheet has closed", async () => {
    const { rerender } = render(
      <>
        <BottomSheet open={false} onClose={vi.fn()} title="T" ariaLabel="T">
          content
        </BottomSheet>
        <BottomSheet open={false} onClose={vi.fn()} title="B" ariaLabel="B">
          other
        </BottomSheet>
      </>,
    );

    rerender(
      <>
        <BottomSheet open={true} onClose={vi.fn()} title="T" ariaLabel="T">
          content
        </BottomSheet>
        <BottomSheet open={false} onClose={vi.fn()} title="B" ariaLabel="B">
          other
        </BottomSheet>
      </>,
    );
    rerender(
      <>
        <BottomSheet open={true} onClose={vi.fn()} title="T" ariaLabel="T">
          content
        </BottomSheet>
        <BottomSheet open={true} onClose={vi.fn()} title="B" ariaLabel="B">
          other
        </BottomSheet>
      </>,
    );
    expect(document.body.style.position).toBe("fixed");

    rerender(
      <>
        <BottomSheet open={false} onClose={vi.fn()} title="T" ariaLabel="T">
          content
        </BottomSheet>
        <BottomSheet open={true} onClose={vi.fn()} title="B" ariaLabel="B">
          other
        </BottomSheet>
      </>,
    );
    expect(document.body.style.position).toBe("fixed");

    rerender(
      <>
        <BottomSheet open={false} onClose={vi.fn()} title="T" ariaLabel="T">
          content
        </BottomSheet>
        <BottomSheet open={false} onClose={vi.fn()} title="B" ariaLabel="B">
          other
        </BottomSheet>
      </>,
    );
    await waitFor(
      () => {
        expect(document.body.style.position).toBe("");
        expect(document.documentElement.style.overflow).toBe("");
      },
      { timeout: 2000 },
    );
  });
});