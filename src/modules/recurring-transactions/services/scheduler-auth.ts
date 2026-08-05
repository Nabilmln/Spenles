import { timingSafeEqual } from "node:crypto";

export function isSchedulerAuthorized(
  authorizationHeader: string | null,
  configuredSecret: string | undefined,
) {
  if (!configuredSecret || configuredSecret.length < 32) return false;
  const prefix = "Bearer ";
  if (!authorizationHeader?.startsWith(prefix)) return false;
  const supplied = authorizationHeader.slice(prefix.length);
  const expectedBuffer = Buffer.from(configuredSecret);
  const suppliedBuffer = Buffer.from(supplied);
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}
