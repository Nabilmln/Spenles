import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export const getProfile = cache(async (userId: string) => {
  return db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
});
