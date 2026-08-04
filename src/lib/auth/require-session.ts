import "server-only";

import { redirect } from "next/navigation";
import { auth } from "./server";

export async function getSessionUser() {
  const { data } = await auth.getSession();
  return data?.user ?? null;
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
