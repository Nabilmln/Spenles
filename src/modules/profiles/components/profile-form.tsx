"use client";

import { useToastActionState } from "@/components/ui/toast";
import type { Profile } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { fieldClass, fieldLabelClass } from "@/components/ui/styles";
import { updateProfileAction, type ProfileActionState } from "../actions/update-profile";

const initialState: ProfileActionState = {};

export function ProfileForm({ profile, onSuccess }: { profile: Profile; onSuccess?: () => void }) {
  const [state, action, pending] = useToastActionState(
    updateProfileAction, initialState, undefined, onSuccess,
  );

  return (
    <form action={action} className="grid gap-4">
      <div className={fieldClass}>
        <label htmlFor="displayName" className={fieldLabelClass}>Display name</label>
        <Input
          id="displayName" name="displayName" defaultValue={profile.displayName}
          aria-describedby="display-name-error"
          aria-invalid={Boolean(state.fieldErrors?.displayName)} required
        />
        <FormMessage id="display-name-error">{state.fieldErrors?.displayName?.[0]}</FormMessage>
      </div>
      <input type="hidden" name="defaultCurrency" value="IDR" />
      <input type="hidden" name="timezone" value="Asia/Jakarta" />
      <Button type="submit" disabled={pending} className="w-full rounded-full">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
