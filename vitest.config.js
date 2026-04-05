import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: ["src/**/*.test.ts", "example/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/opensrc/**", "**/dist/**"],
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
});
