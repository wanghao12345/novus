import { Button, DropdownMenu, Flex, IconButton, TextField, Tooltip } from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  DotsHorizontalIcon,
  ReloadIcon,
  UploadIcon,
} from "@radix-ui/react-icons";

interface FileToolbarProps {
  canGoBack: boolean;
  canGoForward: boolean;
  canUseFiles: boolean;
  path: string;
  selectedCount: number;
  onGoBack: () => void;
  onGoForward: () => void;
  onRefresh: () => void;
  onUpload: () => void;
  onDownload: () => void;
  onClearSelection: () => void;
  onCreateFolder: () => void;
}

export function FileToolbar({
  canGoBack,
  canGoForward,
  canUseFiles,
  path,
  selectedCount,
  onGoBack,
  onGoForward,
  onRefresh,
  onUpload,
  onDownload,
  onClearSelection,
  onCreateFolder,
}: FileToolbarProps) {
  return (
    <Flex className="shrink-0 border-b border-[color:var(--gray-a5)] p-3" align="center" gap="2">
      <Flex className="overflow-hidden rounded-md">
        <Tooltip content="Back">
          <IconButton aria-label="Back" disabled={!canGoBack} onClick={onGoBack} size="3" variant="surface">
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
        <Tooltip content="Forward">
          <IconButton aria-label="Forward" disabled={!canGoForward} onClick={onGoForward} size="3" variant="surface">
            <ChevronRightIcon />
          </IconButton>
        </Tooltip>
      </Flex>

      <Tooltip content="Refresh">
        <IconButton aria-label="Refresh" disabled={!canUseFiles} onClick={onRefresh} size="3" variant="surface">
          <ReloadIcon />
        </IconButton>
      </Tooltip>

      <TextField.Root className="min-w-0 flex-1" readOnly value={path} size="3" />

      <Tooltip content={selectedCount > 0 ? "Download selected" : "Select a file first"}>
        <IconButton
          aria-label="Download selected"
          disabled={!canUseFiles || selectedCount === 0}
          onClick={onDownload}
          size="3"
          variant="surface"
        >
          <DownloadIcon />
        </IconButton>
      </Tooltip>

      <Button disabled={!canUseFiles} onClick={onUpload} size="3" variant="surface">
        <UploadIcon />
        Upload
      </Button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton aria-label="More actions" disabled={!canUseFiles} size="3" variant="surface">
            <DotsHorizontalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onClick={onCreateFolder}>New Folder</DropdownMenu.Item>
          <DropdownMenu.Item disabled={selectedCount === 0} onClick={onDownload}>
            Download Selection
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item disabled={selectedCount === 0} onClick={onClearSelection}>
            Clear Selection
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Flex>
  );
}
