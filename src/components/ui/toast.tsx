"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useActionState } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  variant: ToastVariant;
  message: string;
};

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const NOOP_TOAST: ToastApi = {
  success: () => {},
  error: () => {},
  info: () => {},
};

export function useToast(): ToastApi {
  return useContext(ToastContext) ?? NOOP_TOAST;
}

const TOAST_DURATION_MS = 5000;

const variantIcon = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
} as const;

const variantTone = {
  success: "text-income",
  error: "text-expense",
  info: "text-primary-600",
} as const;

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id]);

  const Icon = variantIcon[toast.variant];

  return (
    <div
      className="toast-in pointer-events-auto flex items-start gap-3 rounded-[.8rem] border border-border bg-surface p-[.8rem] shadow-card"
      role={toast.variant === "error" ? "alert" : "status"}
    >
      <Icon
        className={cn(
          "mt-[.1rem] size-[1.1rem] shrink-0",
          variantTone[toast.variant],
        )}
        aria-hidden="true"
      />
      <p className="m-0 flex-1 text-[.85rem]">{toast.message}</p>
      <button
        type="button"
        className="grid size-[1.6rem] shrink-0 place-items-center rounded-[.45rem] text-muted transition-colors hover:bg-surface-subtle hover:text-foreground"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close notification"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed top-4 right-4 z-50 grid w-[min(22rem,calc(100vw-2rem))] gap-2"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} onDismiss={onDismiss} toast={toast} />
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((variant: ToastVariant, message: string) => {
    const id = String(++idRef.current);
    setToasts((current) => [...current.slice(-4), { id, variant, message }]);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message: string) => show("success", message),
      error: (message: string) => show("error", message),
      info: (message: string) => show("info", message),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster onDismiss={dismiss} toasts={toasts} />
    </ToastContext.Provider>
  );
}

type ActionStateFeedback = { error?: string; success?: string };

export function useToastActionState<
  State extends ActionStateFeedback,
  Payload,
>(
  action: (previousState: State, payload: Payload) => Promise<State>,
  initialState: State,
) {
  const [state, formAction, pending] = useActionState<State, Payload>(
    action,
    initialState as Awaited<State>,
  );
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error, toast]);

  useEffect(() => {
    if (state.success) toast.success(state.success);
  }, [state.success, toast]);

  return [state, formAction, pending] as const;
}
