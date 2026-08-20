"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { passwordToggleClass, passwordWrapClass } from "@/components/ui/styles";

export function PasswordField({
  id,
  name,
  autoComplete,
  describedBy,
  invalid,
  leadingIcon,
}: {
  id: string;
  name: string;
  autoComplete: string;
  describedBy?: string;
  invalid?: boolean;
  leadingIcon?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={passwordWrapClass}>
      {leadingIcon ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted [&_svg]:size-[1.05rem]"
        >
          {leadingIcon}
        </span>
      ) : null}
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className={`pr-12 ${leadingIcon ? "pl-10" : ""}`}
        required
      />
      <button
        className={passwordToggleClass}
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
      >
        {visible ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
  );
}