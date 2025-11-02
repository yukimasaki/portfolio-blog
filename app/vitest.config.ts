/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "**/*.config.{js,mjs,ts}",
        "**/*.d.ts",
        "**/node_modules/**",
        "**/__tests__/**",
        "**/__mocks__/**",
        "coverage/**",
        "**/.next/**",
        "**/dist/**",
      ],
    },
  },
});
