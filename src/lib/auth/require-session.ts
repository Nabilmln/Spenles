import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "./server";

export const getSessionUser = cache(async () => {
  // Refreshing may write cookies, which Next.js forbids during page rendering.
  // Protected GET requests refresh in the proxy before this read.
  const { data } = await auth.getSession({ query: { disableRefresh: "true" } });
  return data?.user ?? null;
});

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
