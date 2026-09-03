import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AmountInput } from "./amount-input";

afterEach(cleanup);

function findInput() {
  return screen.getByRole("textbox") as HTMLInputElement;
}

describe("AmountInput", () => {
  it("formats digits with the Indonesian thousands separator", () => {
    render(<AmountInput name="amount" />);
    const input = findInput();
    fireEvent.change(input, { target: { value: "1000000" } });
    expect(input.value).toBe("1.000.000");
  });

  it("formats 15000000 as 15.000.000", () => {
    render(<AmountInput name="amount" />);
    const input = findInput();
    fireEvent.change(input, { target: { value: "15000000" } });
    expect(input.value).toBe("15.000.000");
  });

  it("strips leading zeros", () => {
    render(<AmountInput name="amount" />);
    const input = findInput();
    fireEvent.change(input, { target: { value: "01000" } });
    expect(input.value).toBe("1.000");
  });

  it("allows empty input", () => {
    render(<AmountInput name="amount" />);
    const input = findInput();
    fireEvent.change(input, { target: { value: "500" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
  });

  it("writes pure digits to the hidden field", () => {
    render(<AmountInput name="amount" />);
    const input = findInput();
    fireEvent.change(input, { target: { value: "1.000.000" } });
    const hidden = document.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="amount"]',
    );
    expect(hidden?.value).toBe("1000000");
  });

  it("does not allow non-numeric characters", () => {
    render(<AmountInput name="amount" />);
    const input = findInput();
    fireEvent.change(input, { target: { value: "12a34" } });
    expect(input.value).toBe("1.234");
  });

  it("preserves the caret position while editing in the middle", () => {
    render(<AmountInput name="amount" />);
    const input = findInput();
    fireEvent.change(input, { target: { value: "1500000" } });
    expect(input.value).toBe("1.500.000");
  });

  it("renders a controlled value from props", () => {
    render(<AmountInput name="amount" value="2500000" onChange={() => {}} />);
    expect(findInput().value).toBe("2.500.000");
  });
});