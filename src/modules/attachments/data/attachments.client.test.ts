import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  deleteAttachment,
  listAttachments,
  uploadAttachment
} from "./attachments.client";

const order = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const insert = vi.fn().mockResolvedValue({ error: null });
const deleteEq = vi.fn().mockResolvedValue({ error: null });
const deleteOp = vi.fn(() => ({ eq: deleteEq }));
const upload = vi.fn().mockResolvedValue({ error: null });
const remove = vi.fn().mockResolvedValue({ error: null });

const queryMock = {
  select: vi.fn(() => queryMock),
  eq: vi.fn(() => queryMock),
  order: vi.fn().mockResolvedValue({
    data: [
      {
        id: "att-1",
        org_id: "org-1",
        event_id: null,
        path: "org-1/demo.txt",
        mime_type: "text/plain",
        size_bytes: 12,
        created_at: "2024-01-01"
      }
    ],
    error: null
  }),
  insert,
  delete: deleteOp
};

const from = vi.fn((table: string) => {
  if (table === "event_attachments") {
    return queryMock;
  }
  return {};
});
const storageFrom = vi.fn(() => ({ upload, remove }));

vi.mock("@/lib/supabase/client", () => ({
  createBrowserClient: () => ({
    from,
    storage: { from: storageFrom }
  })
}));

describe("attachments.client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista adjuntos mapeando campos", async () => {
    const result = await listAttachments("org-1");
    expect(from).toHaveBeenCalledWith("event_attachments");
    expect(queryMock.eq).toHaveBeenCalledWith("org_id", "org-1");
    expect(queryMock.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result[0]).toMatchObject({
      id: "att-1",
      orgId: "org-1",
      path: "org-1/demo.txt",
      mimeType: "text/plain"
    });
  });

  it("aplica filtro de evento cuando se pasa eventId", async () => {
    await listAttachments("org-1", "evt-1");
    expect(queryMock.eq).toHaveBeenCalledWith("event_id", "evt-1");
  });

  it("sube archivo y registra metadata", async () => {
    const file = new File(["demo"], "demo.txt", { type: "text/plain" });
    await uploadAttachment({ orgId: "org-1", file });
    expect(storageFrom).toHaveBeenCalledWith("attachments");
    expect(upload).toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith({
      org_id: "org-1",
      event_id: null,
      path: expect.stringContaining("org-1/"),
      mime_type: "text/plain",
      size_bytes: file.size
    });
  });

  it("borra storage y metadata", async () => {
    await deleteAttachment("att-1", "org-1/demo.txt");
    expect(remove).toHaveBeenCalledWith(["org-1/demo.txt"]);
    expect(deleteOp).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("id", "att-1");
  });
});
