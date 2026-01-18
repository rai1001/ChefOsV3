import { render, screen } from "@testing-library/react";
import { AppShell } from "./app-shell";
import { vi } from "vitest";

vi.mock("@/modules/auth/ui/sign-out-button", () => ({
  SignOutButton: () => <button>Salir</button>
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard"
}));

describe("AppShell", () => {
  it("muestra email y navegación", () => {
    render(
      <AppShell userEmail="user@example.com" orgName="Demo Org">
        <div>Contenido</div>
      </AppShell>
    );

    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});
