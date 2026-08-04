import "server-only";

import { drizzle } from "drizzle-orm/neon-http";
import { getServerEnv } from "@/lib/env/server";
import * as schema from "@/db/schema";

export const db = drizzle(getServerEnv().DATABASE_URL, { schema });
