import { formMessageClass } from "./styles";

export function FormMessage({
  id,
  children,
}: {
  id?: string;
  children?: React.ReactNode;
}) {
  if (!children) return null;

  return (
    <p id={id} className={formMessageClass} role="alert">
      {children}
    </p>
  );
}
