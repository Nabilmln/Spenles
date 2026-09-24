import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

async function readProfile(userId: string) {
  return db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
}

export const getProfile = cache(readProfile);

export const getProfileFresh = readProfile;