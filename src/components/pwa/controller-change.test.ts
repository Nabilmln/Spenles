import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createControllerChangeHandler } from "./controller-change";

describe("createControllerChangeHandler", () => {
  const reloadGuardKey = "spenles-sw-reloaded";
  let storage: Map<string, string>;
  let reload: Mock;

  beforeEach(() => {
    storage = new Map();
    reload = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not reload on the first-ever registration without a previous controller", () => {
    const handler = createControllerChangeHandler({
      hadInitialController: false,
      reload,
      storage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => void storage.set(key, value),
      },
    });

    handler();

    expect(reload).not.toHaveBeenCalled();
  });

  it("reloads once when a new service worker takes control after an update", () => {
    const handler = createControllerChangeHandler({
      hadInitialController: true,
      reload,
      storage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => void storage.set(key, value),
      },
    });

    handler();
    handler();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.get(reloadGuardKey)).toBe("1");
  });
});