export function FormMessage({
  id,
  children,
}: {
  id?: string;
  children?: React.ReactNode;
}) {
  if (!children) return null;

  return (
    <p id={id} className="form-message" role="alert">
      {children}
    </p>
  );
}
