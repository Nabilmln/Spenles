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
import { createPortal } from "react-dom";
import { Check, CircleAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetCloseButton } from "./sheet-close-button";

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

const TOAST_DURATION_MS = 4000;

const variantStyle = {
  success: {
    title: "Success",
    icon: Check,
    badge: "bg-[#168fe5] text-white",
    stripes: "notification-stripes-blue",
  },
  error: {
    title: "Unable to complete",
    icon: CircleAlert,
    badge: "bg-[#bb3f43] text-white",
    stripes: "notification-stripes-red",
  },
  info: {
    title: "Notice",
    icon: Info,
    badge: "bg-primary-700 text-white",
    stripes: "notification-stripes-ink",
  },
} as const;

function ToastSheet({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();
    return () => {
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  const style = variantStyle[toast.variant];
  const Icon = style.icon;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${style.title} notification`}
      onKeyDown={(event) => {
        if (event.key === "Escape") onDismiss(toast.id);
        if (event.key !== "Tab") return;
        if (event.shiftKey && document.activeElement === closeButtonRef.current) {
          event.preventDefault();
          doneButtonRef.current?.focus();
        } else if (!event.shiftKey && document.activeElement === doneButtonRef.current) {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }
      }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgb(15_15_18/34%)]"
        onClick={() => onDismiss(toast.id)}
        aria-hidden="true"
        tabIndex={-1}
      />
      <section
        className="notification-sheet-in relative flex min-h-[min(25rem,72dvh)] w-full max-w-[28rem] flex-col items-center rounded-t-[2rem] bg-surface px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[4rem] text-center text-foreground shadow-[0_-12px_40px_rgb(15_15_18/14%)] min-[601px]:mb-4 min-[601px]:rounded-[2rem]"
        role={toast.variant === "error" ? "alert" : "status"}
        aria-label={style.title}
      >
        <SheetCloseButton
          ref={closeButtonRef}
          className="absolute -top-5 left-1/2 -translate-x-1/2"
          onClick={() => onDismiss(toast.id)}
          ariaLabel="Close notification"
        />

        <div className={cn("mx-auto mb-5 grid size-[5.75rem] place-items-center rounded-full", style.stripes)} aria-hidden="true">
          <span className={cn("grid size-[3.7rem] place-items-center rounded-full", style.badge)}>
            <Icon size={30} strokeWidth={2.5} />
          </span>
        </div>
        <h2 className="m-0 text-[1.55rem] font-semibold tracking-[-.03em]">{style.title}</h2>
        <p className="mx-auto mb-8 mt-2 max-w-[25rem] text-[.84rem] leading-[1.5] text-muted">
          {toast.message}
        </p>
        <button
          ref={doneButtonRef}
          type="button"
          className="mt-auto min-h-[3rem] w-full rounded-full bg-primary-700 px-5 py-3 text-[.88rem] font-medium text-white transition-colors hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          onClick={() => onDismiss(toast.id)}
        >
          Done
        </button>
      </section>
    </div>,
    document.body,
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
    setToasts((current) => [...current, { id, variant, message }]);
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
      {toasts[0] ? <ToastSheet key={toasts[0].id} onDismiss={dismiss} toast={toasts[0]} /> : null}
    </ToastContext.Provider>
  );
}

type ActionStateFeedback = { error?: string; success?: string; redirectTo?: string };

export function useToastActionState<
  State extends ActionStateFeedback,
  Payload,
>(
  action: (previousState: State, payload: Payload) => Promise<State>,
  initialState: State,
  onRedirect?: (path: string) => void,
  onSuccess?: () => void,
) {
  const [state, formAction, pending] = useActionState<State, Payload>(
    action,
    initialState as Awaited<State>,
  );
  const toast = useToast();
  const onRedirectRef = useRef(onRedirect);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onRedirectRef.current = onRedirect;
    onSuccessRef.current = onSuccess;
  }, [onRedirect, onSuccess]);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success(state.success);
      if (state.redirectTo) onRedirectRef.current?.(state.redirectTo);
      onSuccessRef.current?.();
    }
  }, [state, toast]);

  return [state, formAction, pending] as const;
}
