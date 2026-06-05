export interface FileEntry {
  id: string;
  name: string;
  type: "folder" | "file";
  extension?: string;
  size?: string;
  modifiedAt: string;
}

export type FileDensity = "compact" | "comfortable";
