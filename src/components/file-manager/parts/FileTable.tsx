import { Box, ContextMenu, Flex, Table, Text } from "@radix-ui/themes";
import fileDefaultIcon from "@/assets/icons/file-default.png";
import filePdfIcon from "@/assets/icons/file-pdf.png";
import fileTxtIcon from "@/assets/icons/file-txt.png";
import fileZipIcon from "@/assets/icons/file-zip.png";
import folderBlueIcon from "@/assets/icons/folder-blue.png";
import type { FileDensity, FileEntry } from "@/types/file-manager";

interface FileTableProps {
  density: FileDensity;
  entries: FileEntry[];
  isDisabled: boolean;
  selectedFileId?: string;
  onOpenFolder: (entry: FileEntry) => void;
  onDeleteEntry: (entry: FileEntry) => void;
  onDownloadEntry: (entry: FileEntry) => void;
  onRenameEntry: (entry: FileEntry) => void;
  onSelectFile: (entry: FileEntry) => void;
}

export function FileTable({
  density,
  entries,
  isDisabled,
  selectedFileId,
  onDeleteEntry,
  onDownloadEntry,
  onOpenFolder,
  onRenameEntry,
  onSelectFile,
}: FileTableProps) {
  return (
    <Table.Root className="m-2 w-[calc(100%-1rem)] table-fixed overflow-hidden" variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell className="w-auto">File Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="w-[140px] text-right">Size</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="w-[210px] text-right">Last Modified</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {entries.map((entry) => (
          <FileRow
            density={density}
            entry={entry}
            isDisabled={isDisabled}
            isSelected={entry.id === selectedFileId}
            key={entry.id}
            onDeleteEntry={onDeleteEntry}
            onDownloadEntry={onDownloadEntry}
            onOpenFolder={onOpenFolder}
            onRenameEntry={onRenameEntry}
            onSelectFile={onSelectFile}
          />
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function FileRow({
  density,
  entry,
  isDisabled,
  isSelected,
  onOpenFolder,
  onDeleteEntry,
  onDownloadEntry,
  onRenameEntry,
  onSelectFile,
}: {
  density: FileDensity;
  entry: FileEntry;
  isDisabled: boolean;
  isSelected: boolean;
  onDeleteEntry: (entry: FileEntry) => void;
  onDownloadEntry: (entry: FileEntry) => void;
  onOpenFolder: (entry: FileEntry) => void;
  onRenameEntry: (entry: FileEntry) => void;
  onSelectFile: (entry: FileEntry) => void;
}) {
  const isFolder = entry.type === "folder";

  return (
    <Table.Row
      className={[
        density === "comfortable" ? "h-[76px]" : "h-[58px]",
        "cursor-pointer transition-colors",
        isSelected ? "bg-[var(--accent-a3)]" : "",
        isDisabled ? "opacity-45" : "hover:bg-[var(--gray-a3)]",
      ].join(" ")}
      onClick={() => {
        if (isDisabled) {
          return;
        }

        onSelectFile(entry);
      }}
      onDoubleClick={() => {
        if (!isDisabled && isFolder) {
          onOpenFolder(entry);
        }
      }}
    >
      <Table.Cell>
        <ContextMenu.Root>
          <ContextMenu.Trigger className="block">
            <Flex className="min-w-0" align="center" gap="3">
              <Flex
                className="h-10 w-10 shrink-0 rounded-md border border-[color:var(--gray-a5)] bg-[var(--gray-a3)]"
                align="center"
                justify="center"
              >
                <img alt="" className="h-7 w-7 object-contain" draggable={false} src={getFileIcon(entry)} />
              </Flex>
              <Box className="min-w-0">
                <Text className="block truncate" size="3" weight="bold">
                  {entry.name}
                </Text>
                <Text className="block truncate" color="gray" size="2">
                  {isFolder ? "Folder" : entry.extension}
                </Text>
              </Box>
            </Flex>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Item disabled={isDisabled} onClick={() => onRenameEntry(entry)}>
              Rename
            </ContextMenu.Item>
            <ContextMenu.Item disabled={isDisabled || isFolder} onClick={() => onDownloadEntry(entry)}>
              Download
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item color="red" disabled={isDisabled} onClick={() => onDeleteEntry(entry)}>
              Delete
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>
      </Table.Cell>
      <Table.Cell className="text-right">
        <Text color="gray" size="2">
          {entry.size ?? "-"}
        </Text>
      </Table.Cell>
      <Table.Cell className="text-right">
        <Text color="gray" size="2">
          {entry.modifiedAt}
        </Text>
      </Table.Cell>
    </Table.Row>
  );
}

function getFileIcon(entry: FileEntry) {
  if (entry.type === "folder") {
    return folderBlueIcon;
  }

  switch (entry.extension) {
    case "pdf":
      return filePdfIcon;
    case "txt":
      return fileTxtIcon;
    case "zip":
      return fileZipIcon;
    default:
      return fileDefaultIcon;
  }
}
