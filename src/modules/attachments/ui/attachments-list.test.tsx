import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AttachmentsList } from "./attachments-list";
import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listAttachments: vi.fn().mockResolvedValue([
    {
      id: "att-1",
      orgId: "org-1",
      eventId: undefined,
      path: "org-1/demo.txt",
      mimeType: "text/plain",
      sizeBytes: 1024,
      createdAt: "2024-01-01"
    }
  ]),
  uploadAttachment: vi.fn(),
  deleteAttachment: vi.fn()
}));

vi.mock("../data/attachments.client", () => ({
  listAttachments: mocks.listAttachments,
  uploadAttachment: mocks.uploadAttachment,
  deleteAttachment: mocks.deleteAttachment
}));

const renderWithQuery = (ui: ReactNode, retry = true) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry } }
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe("AttachmentsList", () => {
  it("renderiza adjuntos existentes", async () => {
    renderWithQuery(<AttachmentsList orgId="org-1" />);
    await waitFor(() => expect(mocks.listAttachments).toHaveBeenCalled());
    expect(await screen.findByText("org-1/demo.txt")).toBeInTheDocument();
    expect(screen.getByText(/KB/)).toBeInTheDocument();
  });

  it("muestra estado vacio cuando no hay adjuntos", async () => {
    mocks.listAttachments.mockResolvedValueOnce([]);
    renderWithQuery(<AttachmentsList orgId="org-1" />);
    expect(await screen.findByText("Aún no hay archivos.")).toBeInTheDocument();
  });

  it("muestra error si la carga falla", async () => {
    mocks.listAttachments.mockRejectedValueOnce(new Error("falló"));
    renderWithQuery(<AttachmentsList orgId="org-1" />, false);
    expect(await screen.findByText(/Error: Error: falló/)).toBeInTheDocument();
  });
});
