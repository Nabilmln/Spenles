import "server-only";

import { parseServerEnv, type ServerEnv } from "./schema";

let cachedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cachedEnv ??= parseServerEnv(process.env);
  return cachedEnv;
}
