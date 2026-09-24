import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ServiceWorkerRegister } from "./service-worker-register";

const register = vi.fn();
const addEventListener = vi.fn();
const removeEventListener = vi.fn();
const serviceWorker = {
  controller: null,
  addEventListener,
  removeEventListener,
  register,
};

let restoreNavigator: (() => void) | undefined;
let restoreSecureContext: (() => void) | undefined;

afterEach(() => {
  vi.unstubAllEnvs();
  cleanup();
  restoreNavigator?.();
  restoreNavigator = undefined;
  restoreSecureContext?.();
  restoreSecureContext = undefined;
  register.mockClear();
  addEventListener.mockClear();
  removeEventListener.mockClear();
});

describe("ServiceWorkerRegister", () => {
  it("registers the service worker with updateViaCache none in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    register.mockResolvedValue(undefined);
    restoreNavigator = stubNavigatorServiceWorker();
    restoreSecureContext = stubSecureContext(true);

    render(<ServiceWorkerRegister />);

    expect(register).toHaveBeenCalledWith("/sw.js", {
      updateViaCache: "none",
    });
    expect(addEventListener).toHaveBeenCalledWith(
      "controllerchange",
      expect.any(Function),
    );
  });

  it("does not register outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    restoreNavigator = stubNavigatorServiceWorker();

    render(<ServiceWorkerRegister />);

    expect(register).not.toHaveBeenCalled();
  });
});

function stubNavigatorServiceWorker() {
  const original = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: serviceWorker,
  });
  return () => {
    if (original) {
      Object.defineProperty(navigator, "serviceWorker", original);
      return;
    }
    delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker;
  };
}

function stubSecureContext(value: boolean) {
  const original = Object.getOwnPropertyDescriptor(window, "isSecureContext");
  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value,
  });
  return () => {
    if (original) Object.defineProperty(window, "isSecureContext", original);
    else {
      Object.defineProperty(window, "isSecureContext", {
        configurable: true,
        value: undefined,
      });
    }
  };
}