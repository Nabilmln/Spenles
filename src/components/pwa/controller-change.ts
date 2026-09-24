const RELOAD_GUARD_KEY = "spenles-sw-reloaded";

export function createControllerChangeHandler(options: {
  hadInitialController: boolean;
  reload: () => void;
  storage?: Pick<Storage, "getItem" | "setItem">;
}) {
  return () => {
    if (!options.hadInitialController) return;
    const storage = options.storage ?? window.sessionStorage;
    if (storage.getItem(RELOAD_GUARD_KEY) === "1") return;
    storage.setItem(RELOAD_GUARD_KEY, "1");
    options.reload();
  };
}