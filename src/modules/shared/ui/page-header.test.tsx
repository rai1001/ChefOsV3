import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { PageHeader } from "./page-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard"
}));

describe("PageHeader", () => {
  it("muestra título y subtítulo", () => {
    render(<PageHeader title="Dashboard" subtitle="Resumen" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Resumen")).toBeInTheDocument();
    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });
});
