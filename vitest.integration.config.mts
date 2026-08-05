import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.integration.test.ts"],
    setupFiles: ["./vitest.integration.setup.ts"],
    restoreMocks: true,
    clearMocks: true,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "server-only": new URL("./vitest.server-only.ts", import.meta.url).pathname,
    },
  },
});
