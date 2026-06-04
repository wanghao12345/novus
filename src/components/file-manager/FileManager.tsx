import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Box, Flex, IconButton, Popover, ScrollArea, Text, Tooltip } from "@radix-ui/themes";
import { BellIcon, GearIcon } from "@radix-ui/react-icons";
import { fileEntries } from "../../data/files";
import type { Session } from "../../types/session";
import type { FileDensity, FileEntry, FileTab } from "../../types/file-manager";
import { ConnectionStatus } from "./parts/ConnectionStatus";
import { FileBreadcrumbs } from "./parts/FileBreadcrumbs";
import { FileStatusBar } from "./parts/FileStatusBar";
import { FileTable } from "./parts/FileTable";
import { FileTabs } from "./parts/FileTabs";
import { FileToolbar } from "./parts/FileToolbar";

interface FileManagerProps {
  session: Session;
}

export function FileManager({ session }: FileManagerProps) {
  const isConnected = session.status === "connected";
  const homePath = `/home/${session.username}/`;
  const [activeTabId, setActiveTabId] = useState("home");
  const [density, setDensity] = useState<FileDensity>("comfortable");
  const [entries, setEntries] = useState<FileEntry[]>(fileEntries);
  const [pathHistory, setPathHistory] = useState([homePath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedFileId, setSelectedFileId] = useState<string>();
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [tabs, setTabs] = useState<FileTab[]>([
    { id: "home", label: `${session.sessionName} Home`, path: homePath },
    { id: "new-folder", label: `new-folder - ${session.sessionName}`, path: `${homePath}new-folder/` },
  ]);

  const activePath = isConnected ? pathHistory[historyIndex] ?? homePath : "Connect session to browse files";
  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0], [activeTabId, tabs]);
  const selectedFile = entries.find((entry) => entry.id === selectedFileId);

  useEffect(() => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) => {
        const nextPath = tab.id === "home" ? homePath : tab.path.replace(/^\/home\/[^/]+\//, homePath);

        return {
          ...tab,
          label: tab.id === "home" ? `${session.sessionName} Home` : `${getFolderName(nextPath)} - ${session.sessionName}`,
          path: nextPath,
        };
      }),
    );
    setPathHistory((currentHistory) => currentHistory.map((path) => path.replace(/^\/home\/[^/]+\//, homePath)));
  }, [homePath, session.sessionName]);

  const updatePath = (path: string) => {
    setPathHistory((currentHistory) => [...currentHistory.slice(0, historyIndex + 1), path]);
    setHistoryIndex((currentIndex) => currentIndex + 1);
    setSelectedFileId(undefined);
  };

  const handleOpenFolder = (entry: FileEntry) => {
    const nextPath = `${homePath}${entry.name}/`;
    const tabId = `folder-${entry.id}`;

    setTabs((currentTabs) => {
      if (currentTabs.some((tab) => tab.id === tabId)) {
        return currentTabs;
      }

      return [...currentTabs, { id: tabId, label: `${entry.name} - ${session.sessionName}`, path: nextPath }];
    });
    setActiveTabId(tabId);
    updatePath(nextPath);
    setStatusMessage(`Opened ${entry.name}`);
  };

  const handleSelectTab = (tabId: string) => {
    const nextTab = tabs.find((tab) => tab.id === tabId);

    if (!nextTab) {
      return;
    }

    setActiveTabId(tabId);
    updatePath(nextTab.path);
    setStatusMessage(`Switched to ${nextTab.label}`);
  };

  const handleCloseTab = (tabId: string) => {
    setTabs((currentTabs) => {
      const nextTabs = currentTabs.filter((tab) => tab.id !== tabId);
      const nextActiveTab = nextTabs[0];

      if (activeTabId === tabId && nextActiveTab) {
        setActiveTabId(nextActiveTab.id);
        updatePath(nextActiveTab.path);
      }

      return nextTabs.length > 0 ? nextTabs : currentTabs;
    });
    setStatusMessage("Tab closed");
  };

  const handleCreateFolder = () => {
    const folderNumber = entries.filter((entry) => entry.type === "folder").length + 1;
    const folderName = `new-folder-${folderNumber}`;

    setEntries((currentEntries) => [
      { id: `folder-${Date.now()}`, name: folderName, type: "folder", modifiedAt: "Just now" },
      ...currentEntries,
    ]);
    setStatusMessage(`Created ${folderName}`);
  };

  return (
    <Flex className="h-full min-w-0 bg-[var(--gray-1)]" direction="column">
      <Flex className="h-[76px] shrink-0 border-b border-[color:var(--gray-a5)] px-4" align="center" justify="between">
        <FileTabs activeTabId={activeTabId} onCloseTab={handleCloseTab} onSelectTab={handleSelectTab} tabs={tabs} />

        <Flex align="center" gap="2">
          <ConnectionStatus isConnected={isConnected} />
          <HeaderPopover icon={<BellIcon />} label="Notifications">
            <Text color="gray" size="2">
              No new transfer notifications.
            </Text>
          </HeaderPopover>
          <HeaderPopover icon={<GearIcon />} label="Settings">
            <Text color="gray" size="2">
              File manager preferences will be available here.
            </Text>
          </HeaderPopover>
        </Flex>
      </Flex>

      <FileToolbar
        canGoBack={isConnected && historyIndex > 0}
        canGoForward={isConnected && historyIndex < pathHistory.length - 1}
        canUseFiles={isConnected}
        onClearSelection={() => {
          setSelectedFileId(undefined);
          setStatusMessage("Selection cleared");
        }}
        onCreateFolder={handleCreateFolder}
        onDownload={() => setStatusMessage(selectedFile ? `Queued download for ${selectedFile.name}` : "Select a file first")}
        onGoBack={() => {
          setHistoryIndex((currentIndex) => Math.max(0, currentIndex - 1));
          setSelectedFileId(undefined);
          setStatusMessage("Moved back");
        }}
        onGoForward={() => {
          setHistoryIndex((currentIndex) => Math.min(pathHistory.length - 1, currentIndex + 1));
          setSelectedFileId(undefined);
          setStatusMessage("Moved forward");
        }}
        onRefresh={() => setStatusMessage("Folder refreshed")}
        onUpload={() => setStatusMessage("Upload action is ready to connect to the backend")}
        path={activePath}
        selectedCount={selectedFile ? 1 : 0}
      />

      <FileBreadcrumbs activeTab={activeTab} sessionName={session.sessionName} />

      <ScrollArea className="min-h-0 flex-1">
        <FileTable
          density={density}
          entries={entries}
          isDisabled={!isConnected}
          onOpenFolder={handleOpenFolder}
          onSelectFile={(entry) => {
            setSelectedFileId(entry.id);
            setStatusMessage("Ready");
          }}
          selectedFileId={selectedFileId}
        />
      </ScrollArea>

      <FileStatusBar
        density={density}
        entriesCount={entries.length}
        isConnected={isConnected}
        onToggleDensity={() => setDensity((currentDensity) => (currentDensity === "comfortable" ? "compact" : "comfortable"))}
        selectedFile={selectedFile}
        sessionName={session.sessionName}
        statusMessage={statusMessage}
      />
    </Flex>
  );
}

function HeaderPopover({ children, icon, label }: { children: ReactNode; icon: ReactNode; label: string }) {
  return (
    <Popover.Root>
      <Tooltip content={label}>
        <Popover.Trigger>
          <IconButton aria-label={label} size="2" variant="surface">
            {icon}
          </IconButton>
        </Popover.Trigger>
      </Tooltip>
      <Popover.Content maxWidth="260px">
        <Box>
          <Text as="div" size="2" weight="bold" mb="2">
            {label}
          </Text>
          {children}
        </Box>
      </Popover.Content>
    </Popover.Root>
  );
}

function getFolderName(path: string) {
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "Home";
}
