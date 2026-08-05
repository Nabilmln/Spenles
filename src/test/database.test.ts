import { describe, expect, it } from "vitest";
import { parseTestDatabaseEnv } from "./database";

const testUrl = "postgresql://test:test@test.example/test_db?sslmode=require";
const developmentUrl = "postgresql://dev:dev@dev.example/development?sslmode=require";

describe("parseTestDatabaseEnv", () => {
  it("accepts a distinct non-production test database", () => {
    expect(parseTestDatabaseEnv({
      TEST_DATABASE_URL: testUrl,
      DATABASE_URL: developmentUrl,
      NODE_ENV: "test",
    })).toEqual({ testDatabaseUrl: testUrl });
  });

  it("fails closed when TEST_DATABASE_URL is missing", () => {
    expect(() => parseTestDatabaseEnv({ DATABASE_URL: developmentUrl })).toThrow(
      "TEST_DATABASE_URL",
    );
  });

  it("rejects the application database", () => {
    expect(() => parseTestDatabaseEnv({
      TEST_DATABASE_URL: developmentUrl,
      DATABASE_URL: developmentUrl,
    })).toThrow("sama dengan DATABASE_URL");
  });

  it.each([
    { TEST_DATABASE_URL: "postgresql://test:test@prod.example/neondb", NODE_ENV: "test" },
    { TEST_DATABASE_URL: testUrl, NODE_ENV: "production" },
    { TEST_DATABASE_URL: testUrl, VERCEL_ENV: "production" },
  ])("rejects production targets %#", (source) => {
    expect(() => parseTestDatabaseEnv(source)).toThrow("production");
  });
});
