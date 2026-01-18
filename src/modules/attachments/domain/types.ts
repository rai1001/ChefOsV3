/* istanbul ignore file */
export type Attachment = {
  id: string;
  orgId: string;
  eventId?: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export type UploadAttachmentInput = {
  orgId: string;
  eventId?: string;
  file: File;
};
