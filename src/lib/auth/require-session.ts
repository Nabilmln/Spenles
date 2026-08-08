import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "./server";

export const getSessionUser = cache(async () => {
  const { data } = await auth.getSession();
  return data?.user ?? null;
});

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
