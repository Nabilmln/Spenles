"use client";

import { useActionState } from "react";
import type { Profile } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { Select } from "@/components/ui/select";
import { inputDisplayClass, successMessageClass } from "@/components/ui/styles";
import {
  updateProfileAction,
  type ProfileActionState,
} from "../actions/update-profile";

const initialState: ProfileActionState = {};

export function ProfileForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const [state, action, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={action} className="settings-form">
      <FormMessage>{state.error}</FormMessage>
      {state.success ? (
        <p className={successMessageClass} role="status">
          {state.success}
        </p>
      ) : null}
      <div className="field">
        <label htmlFor="displayName">Nama</label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={profile.displayName}
          aria-describedby="display-name-error"
          aria-invalid={Boolean(state.fieldErrors?.displayName)}
          required
        />
        <FormMessage id="display-name-error">
          {state.fieldErrors?.displayName?.[0]}
        </FormMessage>
      </div>
      <div className="field">
        <label htmlFor="profileEmail">Email</label>
        <Input id="profileEmail" value={email} readOnly disabled />
        <span className="field-hint">Email dikelola oleh layanan autentikasi.</span>
      </div>
      <div className="settings-grid">
        <div className="field">
          <label htmlFor="defaultCurrency">Mata uang</label>
          <div className={inputDisplayClass} id="defaultCurrency">
            IDR — Rupiah Indonesia
          </div>
          <input type="hidden" name="defaultCurrency" value="IDR" />
          <span className="field-hint">Spenles hanya mendukung IDR.</span>
        </div>
        <div className="field">
          <label htmlFor="timezone">Zona waktu</label>
          <div className={inputDisplayClass} id="timezone">Asia/Jakarta</div>
          <input type="hidden" name="timezone" value="Asia/Jakarta" />
          <span className="field-hint">
            Spenles hanya mendukung Asia/Jakarta.
          </span>
        </div>
      </div>
      <div className="field">
        <label htmlFor="theme">Tema</label>
        <Select
          id="theme"
          name="theme"
          defaultValue={profile.theme === "system" ? "light" : profile.theme}
        >
          <option value="light">Terang</option>
          <option value="dark">Gelap</option>
        </Select>
        <span className="field-hint">
          Ubah tema dengan cepat lewat ikon matahari atau bulan di pojok kanan.
        </span>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan perubahan"}
      </Button>
    </form>
  );
}
