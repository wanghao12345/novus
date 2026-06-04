import type { ReactNode } from "react";
import { Badge, Box, Button, Flex, IconButton, ScrollArea, Table, Text, TextField, Tooltip } from "@radix-ui/themes";
import {
  ArchiveIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
  DownloadIcon,
  DotsHorizontalIcon,
  FileIcon,
  GearIcon,
  HomeIcon,
  ReloadIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import type { Session } from "../../App";

interface FileManagerProps {
  session: Session;
}

interface FileEntry {
  id: string;
  name: string;
  type: "folder" | "file";
  extension?: string;
  size?: string;
  modifiedAt: string;
}

const fileEntries: FileEntry[] = [
  { id: "more-folder", name: "More-folder", type: "folder", modifiedAt: "08/11/2025, 23:16:51" },
  { id: "new-folder", name: "new-folder", type: "folder", modifiedAt: "08/11/2025, 23:08:04" },
  { id: "app-release", name: "app-release", type: "file", extension: "aab", size: "2.85 MB", modifiedAt: "08/05/2025, 00:09:53" },
  {
    id: "chrome",
    name: "google-chrome-stable_current",
    type: "file",
    extension: "deb",
    size: "2.85 MB",
    modifiedAt: "08/05/2025, 00:23:48",
  },
  { id: "inter-font", name: "Inter-font", type: "file", extension: "zip", size: "19.51 MB", modifiedAt: "08/04/2025, 22:36:29" },
  { id: "originui", name: "originui-main", type: "file", extension: "zip", size: "4.16 MB", modifiedAt: "08/05/2025, 00:00:04" },
  { id: "quotation", name: "Quotation", type: "file", extension: "pdf", size: "6.32 MB", modifiedAt: "08/05/2025, 00:25:00" },
  { id: "some", name: "Some", type: "file", extension: "pdf", size: "192.00 KB", modifiedAt: "08/05/2025, 00:14:22" },
  { id: "webview", name: "webview", type: "file", extension: "dmg", size: "1.70 MB", modifiedAt: "08/05/2025, 00:09:52" },
];

export function FileManager({ session }: FileManagerProps) {
  const isConnected = session.status === "connected";

  return (
    <Flex className="h-full min-w-0" direction="column">
      <Flex
        className="h-[76px] shrink-0 border-b border-[color:var(--gray-a5)] px-4"
        align="center"
        justify="between"
      >
        <Flex align="center" gap="2">
          <TabLabel icon={<HomeIcon />} label={`${session.sessionName} Home`} />
          <TabLabel icon={<ArchiveIcon />} label={`new-folder - ${session.sessionName}`} />
          <Tooltip content="Close tab">
            <IconButton aria-label="Close tab" size="2" variant="ghost">
              <Cross2Icon />
            </IconButton>
          </Tooltip>
        </Flex>

        <Flex align="center" gap="2">
          <StatusDot isConnected={isConnected} />
          <Tooltip content="Notifications">
            <IconButton aria-label="Notifications" size="2" variant="surface">
              <BellIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content="Settings">
            <IconButton aria-label="Settings" size="2" variant="surface">
              <GearIcon />
            </IconButton>
          </Tooltip>
        </Flex>
      </Flex>

      <Flex
        className="shrink-0 border-b border-[color:var(--gray-a5)] p-3"
        align="center"
        gap="2"
      >
        <ButtonGroup>
          <Tooltip content="Back">
            <IconButton aria-label="Back" size="3" variant="surface">
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content="Forward">
            <IconButton aria-label="Forward" size="3" variant="surface">
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Tooltip content="Refresh">
          <IconButton aria-label="Refresh" size="3" variant="surface">
            <ReloadIcon />
          </IconButton>
        </Tooltip>

        <TextField.Root
          className="min-w-0 flex-1"
          readOnly
          value={isConnected ? `/home/${session.username}/` : "Connect session to browse files"}
        />

        <Tooltip content="Download selected">
          <IconButton aria-label="Download selected" disabled={!isConnected} size="3" variant="surface">
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Button disabled={!isConnected} size="3" variant="surface">
          <UploadIcon />
          Upload
        </Button>
        <Tooltip content="More actions">
          <IconButton aria-label="More actions" size="3" variant="surface">
            <DotsHorizontalIcon />
          </IconButton>
        </Tooltip>
      </Flex>

      <Flex className="shrink-0 border-b border-[color:var(--gray-a5)] px-3 py-2" align="center" gap="2">
        <BreadcrumbPill icon={<HomeIcon />} label={`Home - ${session.sessionName}`} />
        <BreadcrumbPill icon={<ArchiveIcon />} label={`new-folder - ${session.sessionName}`} />
      </Flex>

      <ScrollArea className="min-h-0 flex-1">
        <Table.Root className="w-full table-fixed" variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell className="w-auto">File Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="w-[140px] text-right">Size</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="w-[210px] text-right">Last Modified</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fileEntries.map((entry) => (
              <FileRow entry={entry} isDisabled={!isConnected} key={entry.id} />
            ))}
          </Table.Body>
        </Table.Root>
      </ScrollArea>

      <Flex
        className="h-[56px] shrink-0 border-t border-[color:var(--gray-a5)] px-4"
        align="center"
        justify="between"
      >
        <Flex align="center" gap="3">
          <Badge color={isConnected ? "green" : "gray"} size="2" variant="surface">
            {session.sessionName}
          </Badge>
          <Text color="gray" size="2">
            Total Files: {fileEntries.length}
          </Text>
        </Flex>

        <Button size="2" variant="surface">
          Comfortable
        </Button>
      </Flex>
    </Flex>
  );
}

function FileRow({ entry, isDisabled }: { entry: FileEntry; isDisabled: boolean }) {
  const isFolder = entry.type === "folder";

  return (
    <Table.Row className={["h-[76px] transition-colors", isDisabled ? "opacity-45" : "hover:bg-[var(--gray-a3)]"].join(" ")}>
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

function TabLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Flex
      className="h-10 max-w-[260px] rounded-md border border-[color:var(--gray-a5)] bg-[var(--gray-a3)] px-3"
      align="center"
      gap="2"
    >
      {icon}
      <Text className="truncate" color="gray" size="2" weight="bold">
        {label}
      </Text>
    </Flex>
  );
}

function BreadcrumbPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Flex
      className="h-9 max-w-[260px] rounded-md border border-[color:var(--gray-a5)] bg-[var(--gray-a2)] px-3"
      align="center"
      gap="2"
    >
      {icon}
      <Text className="truncate" color="gray" size="2" weight="bold">
        {label}
      </Text>
    </Flex>
  );
}

function ButtonGroup({ children }: { children: ReactNode }) {
  return <Flex className="overflow-hidden rounded-md border border-[color:var(--gray-a5)]">{children}</Flex>;
}

function StatusDot({ isConnected }: { isConnected: boolean }) {
  return (
    <Flex align="center" gap="2">
      <span
        aria-hidden
        className={[
          "h-2 w-2 rounded-full",
          isConnected ? "bg-[var(--green-9)]" : "bg-[var(--gray-8)]",
        ].join(" ")}
      />
      <Text color="gray" size="2">
        {isConnected ? "Connected" : "Offline"}
      </Text>
    </Flex>
  );
}
