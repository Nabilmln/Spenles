"use client";

import { useToastActionState } from "@/components/ui/toast";
import type { Profile } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { Select } from "@/components/ui/select";
import {
  fieldClass,
  fieldHintClass,
  fieldLabelClass,
  inputDisplayClass,
} from "@/components/ui/styles";
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
  const [state, action, pending] = useToastActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-[1.25rem]">
      <div className={fieldClass}>
        <label htmlFor="displayName" className={fieldLabelClass}>Display name</label>
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
      <div className={fieldClass}>
        <label htmlFor="profileEmail" className={fieldLabelClass}>Email</label>
        <Input id="profileEmail" value={email} readOnly disabled />
        <span className={fieldHintClass}>Email is managed by the authentication service.</span>
      </div>
      <div className="grid grid-cols-2 gap-[1rem] max-[540px]:grid-cols-1">
        <div className={fieldClass}>
          <label htmlFor="defaultCurrency" className={fieldLabelClass}>Currency</label>
          <div className={inputDisplayClass} id="defaultCurrency">
            IDR — Indonesian Rupiah
          </div>
          <input type="hidden" name="defaultCurrency" value="IDR" />
          <span className={fieldHintClass}>Spenles only supports IDR.</span>
        </div>
        <div className={fieldClass}>
          <label htmlFor="timezone" className={fieldLabelClass}>Timezone</label>
          <div className={inputDisplayClass} id="timezone">Asia/Jakarta</div>
          <input type="hidden" name="timezone" value="Asia/Jakarta" />
          <span className={fieldHintClass}>
            Spenles only supports Asia/Jakarta.
          </span>
        </div>
      </div>
      <div className={fieldClass}>
        <label htmlFor="theme" className={fieldLabelClass}>Theme</label>
        <Select
          id="theme"
          name="theme"
          defaultValue={profile.theme === "system" ? "light" : profile.theme}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>
        <span className={fieldHintClass}>
          Quickly change the theme via the sun or moon icon in the top-right corner.
        </span>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
