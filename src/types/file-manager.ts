export interface FileEntry {
  id: string;
  modifiedAt: string;
  name: string;
  path: string;
  permissions?: number;
  size?: string;
  type: "folder" | "file";
  extension?: string;
}

export type FileDensity = "compact" | "comfortable";
