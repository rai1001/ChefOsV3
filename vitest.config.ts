import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/modules/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}"],
      exclude: [
        "src/lib/supabase/**",
        "src/modules/shared/data/**",
        "src/modules/orgs/**",
        "src/app/**",
        "scripts/**",
        "middleware.ts"
      ],
      thresholds: {
        lines: 90,
        branches: 80,
        statements: 90,
        functions: 85
      }
    },
    include: ["src/**/*.test.{ts,tsx}"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
