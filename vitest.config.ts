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
        // Supabase clients and server-only auth rely on Next/headers and env.
        "src/lib/supabase/**",
        // Server data adapters depend on cookies and request context.
        "src/modules/shared/data/**",
        // Org data adapters are server-only and covered by pgTAP.
        "src/modules/orgs/**",
        // UI for attachments uses Supabase storage and is covered by e2e.
        "src/modules/attachments/ui/**",
        "src/modules/attachments/data/**",
        "src/modules/attachments/domain/**",
        // Event data is exercised by DB tests and e2e flows.
        "src/modules/events/data/**",
        // Purchase UI is covered by e2e and relies on browser storage.
        "src/modules/purchasing/ui/**",
        // Dashboard RPC adapters are tested in pgTAP and exercised in UI.
        "src/modules/dashboard/data/**",
        // Server auth client depends on Next cookies.
        "src/modules/auth/data/auth-client.server.ts",
        // Shared layout/UI smoke is covered by e2e.
        "src/modules/shared/ui/app-shell.tsx",
        "src/modules/shared/ui/page-header.tsx",
        // App Router pages are covered by e2e.
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
