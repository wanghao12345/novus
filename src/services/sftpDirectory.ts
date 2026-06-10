import { invoke } from "@tauri-apps/api/core";
import type { FileEntry } from "../types/file-manager";

type DirectoryEntryResponse =
  | string
  | {
      extension?: string;
      file_name?: string;
      is_dir?: boolean;
      is_directory?: boolean;
      isDirectory?: boolean;
      modified?: number | string;
      modified_at?: string;
      modifiedAt?: string;
      name?: string;
      path?: string;
      permissions?: number;
      size?: number | string;
      type?: "file" | "folder" | "directory";
    };

interface ListDirectoryParams {
  connectionId: string;
  path: string;
}

export async function listDirectory({ connectionId, path }: ListDirectoryParams): Promise<FileEntry[]> {
  const entries = await invoke<DirectoryEntryResponse[]>("list_directory", {
    connectionId,
    path,
  });

  return entries
    .map((entry, index) => normalizeDirectoryEntry(entry, index))
    .filter((entry) => entry.name !== "." && entry.name !== "..")
    .sort(sortDirectoryEntries);
}

export async function createDirectory({ connectionId, path }: ListDirectoryParams): Promise<void> {
  await invoke("create_directory", {
    connectionId,
    path,
  });
}

export async function deleteItem({ connectionId, path }: ListDirectoryParams): Promise<void> {
  await invoke("delete_item", {
    connectionId,
    remotePath: path,
  });
}

interface RenameItemParams {
  connectionId: string;
  oldPath: string;
  newPath: string;
}

export async function renameItem({ connectionId, oldPath, newPath }: RenameItemParams): Promise<void> {
  await invoke("rename_item", {
    connectionId,
    oldPath,
    newPath,
  });
}

interface CopyItemParams {
  connectionId: string;
  sourcePath: string;
  targetPath: string;
  isDirectory: boolean;
}

export async function copyItem({ connectionId, sourcePath, targetPath, isDirectory }: CopyItemParams): Promise<void> {
  await invoke("copy_item", {
    connectionId,
    sourcePath,
    targetPath,
    isDirectory,
  });
}

interface MoveItemParams {
  connectionId: string;
  sourcePath: string;
  targetPath: string;
}

export async function moveItem({ connectionId, sourcePath, targetPath }: MoveItemParams): Promise<void> {
  await invoke("move_item", {
    connectionId,
    sourcePath,
    targetPath,
  });
}

function normalizeDirectoryEntry(entry: DirectoryEntryResponse, index: number): FileEntry {
  if (typeof entry === "string") {
    const normalizedName = entry.replace(/\/$/, "").split("/").filter(Boolean).pop() ?? entry;
    const extension = getFileExtension(normalizedName);
    const isFolder = entry.endsWith("/") || !extension;

    return {
      extension,
      id: `${normalizedName}-${index}`,
      modifiedAt: "-",
      name: normalizedName,
      path: entry,
      type: isFolder ? "folder" : "file",
    };
  }

  const rawName = entry.name ?? entry.file_name ?? entry.path ?? `entry-${index}`;
  const name = rawName.replace(/\/$/, "").split("/").filter(Boolean).pop() ?? rawName;
  const path = entry.path ?? rawName;
  const isFolder =
    entry.type === "folder" ||
    entry.type === "directory" ||
    entry.isDirectory === true ||
    entry.is_dir === true ||
    entry.is_directory === true;
  const extension = isFolder ? undefined : entry.extension ?? getFileExtension(name);

  return {
    extension,
    id: `${path}-${index}`,
    modifiedAt: formatModifiedTime(entry.modified ?? entry.modifiedAt ?? entry.modified_at),
    name,
    path,
    permissions: entry.permissions,
    size: isFolder ? undefined : formatFileSize(entry.size),
    type: isFolder ? "folder" : "file",
  };
}

function getFileExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;
}

function formatFileSize(size: number | string | undefined) {
  if (size === undefined) {
    return undefined;
  }

  if (typeof size === "string") {
    return size;
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function formatModifiedTime(modified: number | string | undefined) {
  if (modified === undefined || modified === null || modified === "") {
    return "-";
  }

  if (typeof modified === "string") {
    return modified;
  }

  const date = new Date(modified * 1000);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    year: "numeric",
  }).format(date);
}

function sortDirectoryEntries(left: FileEntry, right: FileEntry) {
  if (left.type !== right.type) {
    return left.type === "folder" ? -1 : 1;
  }

  return left.name.localeCompare(right.name);
}
