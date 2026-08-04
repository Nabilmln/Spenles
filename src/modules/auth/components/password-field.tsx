"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PasswordField({
  id,
  name,
  autoComplete,
  describedBy,
}: {
  id: string;
  name: string;
  autoComplete: string;
  describedBy?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-wrap">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        required
      />
      <button
        className="password-toggle"
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
      >
        {visible ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
  );
}
