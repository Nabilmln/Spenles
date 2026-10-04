import Image from "next/image";

export function AppLaunchScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background" role="status" aria-live="polite">
      <Image src="/brand-mark.svg" alt="" aria-hidden="true" width={72} height={72} priority className="size-[4.5rem]" />
      <span className="sr-only">Opening Spenles</span>
    </div>
  );
}
