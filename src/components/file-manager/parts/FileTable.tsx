import { Box, Flex, Table, Text } from "@radix-ui/themes";
import { ArchiveIcon, FileIcon } from "@radix-ui/react-icons";
import type { FileDensity, FileEntry } from "../../../types/file-manager";

interface FileTableProps {
  density: FileDensity;
  entries: FileEntry[];
  isDisabled: boolean;
  selectedFileId?: string;
  onOpenFolder: (entry: FileEntry) => void;
  onSelectFile: (entry: FileEntry) => void;
}

export function FileTable({
  density,
  entries,
  isDisabled,
  selectedFileId,
  onOpenFolder,
  onSelectFile,
}: FileTableProps) {
  return (
    <Table.Root className="table-fixed m-2" variant="surface">
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
            onOpenFolder={onOpenFolder}
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
  onSelectFile,
}: {
  density: FileDensity;
  entry: FileEntry;
  isDisabled: boolean;
  isSelected: boolean;
  onOpenFolder: (entry: FileEntry) => void;
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
        <Flex className="min-w-0" align="center" gap="3">
          <Flex
            className="h-10 w-10 shrink-0 rounded-md border border-[color:var(--gray-a5)] bg-[var(--gray-a3)]"
            align="center"
            justify="center"
          >
            {isFolder ? (
              <ArchiveIcon className="h-5 w-5 text-[var(--amber-10)]" />
            ) : (
              <FileIcon className="h-5 w-5 text-[var(--gray-11)]" />
            )}
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
