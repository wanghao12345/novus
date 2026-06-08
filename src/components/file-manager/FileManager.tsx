import { useCallback, useEffect, useState } from "react";
import { Flex, ScrollArea } from "@radix-ui/themes";
import { fileEntries } from "../../data/files";
import { createDirectory, deleteDirectory, listDirectory } from "../../services/sftpDirectory";
import type { Session } from "../../types/session";
import type { FileDensity, FileEntry } from "../../types/file-manager";
import { FileStatusBar } from "./parts/FileStatusBar";
import { FileTable } from "./parts/FileTable";
import { FileToolbar } from "./parts/FileToolbar";

interface FileManagerProps {
  session: Session;
}

export function FileManager({ session }: FileManagerProps) {
  const isConnected = session.status === "connected";
  const rootPath = "/";
  const [density, setDensity] = useState<FileDensity>("comfortable");
  const [entries, setEntries] = useState<FileEntry[]>(fileEntries);
  const [pathHistory, setPathHistory] = useState([rootPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedFileId, setSelectedFileId] = useState<string>();
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [isLoading, setIsLoading] = useState(false);

  const activePath = isConnected ? pathHistory[historyIndex] ?? rootPath : "Connect session to browse files";
  const selectedFile = entries.find((entry) => entry.id === selectedFileId);

  const loadDirectory = useCallback(
    async (path: string) => {
      if (!isConnected || !session.connectionId) {
        setEntries(fileEntries);
        setStatusMessage(isConnected ? "No active SFTP connection id" : "Connect session to browse files");
        return;
      }

      if (!isTauriRuntime()) {
        setEntries(fileEntries);
        setStatusMessage("Preview data loaded");
        return;
      }

      setIsLoading(true);
      setStatusMessage("Loading directory...");

      try {
        const nextEntries = await listDirectory({
          connectionId: session.connectionId,
          path,
        });

        setEntries(nextEntries);
        setStatusMessage(nextEntries.length > 0 ? "Directory loaded" : "Directory is empty");
      } catch (error) {
        setEntries([]);
        setStatusMessage(`Failed to load directory: ${String(error)}`);
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, session.connectionId],
  );

  useEffect(() => {
    setPathHistory([rootPath]);
    setHistoryIndex(0);
    setSelectedFileId(undefined);
    setStatusMessage("Ready");
    void loadDirectory(rootPath);
  }, [rootPath, session.id, loadDirectory]);

  const updatePath = (path: string) => {
    setPathHistory((currentHistory) => [...currentHistory.slice(0, historyIndex + 1), path]);
    setHistoryIndex((currentIndex) => currentIndex + 1);
    setSelectedFileId(undefined);
    void loadDirectory(path);
  };

  const handleOpenFolder = (entry: FileEntry) => {
    const currentPath = pathHistory[historyIndex] ?? rootPath;
    const nextPath = ensureDirectoryPath(entry.path || joinRemotePath(currentPath, entry.name));

    updatePath(nextPath);
    setStatusMessage(`Opened ${entry.name}`);
  };

  const handleCreateFolder = async (folderName: string) => {
    const currentPath = pathHistory[historyIndex] ?? rootPath;
    const folderPath = joinRemotePath(currentPath, folderName);

    if (isTauriRuntime() && session.connectionId) {
      await createDirectory({
        connectionId: session.connectionId,
        path: folderPath,
      });
      await loadDirectory(currentPath);
    } else {
      setEntries((currentEntries) => [
        { id: `folder-${Date.now()}`, name: folderName, path: folderPath, type: "folder", modifiedAt: "Just now" },
        ...currentEntries,
      ]);
    }

    setStatusMessage(`Created ${folderName}`);
  };

  const handleDeleteEntry = async (entry: FileEntry) => {
    if (entry.type === "folder" && isTauriRuntime() && session.connectionId) {
      await deleteDirectory({
        connectionId: session.connectionId,
        path: entry.path,
      });
      await loadDirectory(pathHistory[historyIndex] ?? rootPath);
      setStatusMessage(`Deleted ${entry.name}`);
      return;
    }

    if (entry.type === "folder") {
      setEntries((currentEntries) => currentEntries.filter((currentEntry) => currentEntry.id !== entry.id));
      setStatusMessage(`Deleted ${entry.name}`);
      return;
    }

    setStatusMessage("File delete will be enabled after delete_item is registered");
  };

  const handleDownloadEntry = (entry: FileEntry) => {
    setStatusMessage(`Download requested for ${entry.name}`);
  };

  const handleRenameEntry = (entry: FileEntry) => {
    setStatusMessage(`Rename requested for ${entry.name}`);
  };

  return (
    <Flex className="h-full min-w-0 bg-[var(--gray-1)]" direction="column">
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
          const nextIndex = Math.max(0, historyIndex - 1);
          setHistoryIndex(nextIndex);
          setSelectedFileId(undefined);
          void loadDirectory(pathHistory[nextIndex] ?? rootPath);
          setStatusMessage("Moved back");
        }}
        onGoForward={() => {
          const nextIndex = Math.min(pathHistory.length - 1, historyIndex + 1);
          setHistoryIndex(nextIndex);
          setSelectedFileId(undefined);
          void loadDirectory(pathHistory[nextIndex] ?? rootPath);
          setStatusMessage("Moved forward");
        }}
        onRefresh={() => {
          void loadDirectory(activePath);
        }}
        onUpload={() => setStatusMessage("Upload action is ready to connect to the backend")}
        path={activePath}
        selectedCount={selectedFile ? 1 : 0}
      />

      <ScrollArea className="min-h-0 flex-1">
        <FileTable
          density={density}
          entries={entries}
          isDisabled={!isConnected || isLoading}
          onDeleteEntry={(entry) => {
            void handleDeleteEntry(entry);
          }}
          onDownloadEntry={handleDownloadEntry}
          onOpenFolder={handleOpenFolder}
          onRenameEntry={handleRenameEntry}
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

function isTauriRuntime() {
  return "__TAURI_INTERNALS__" in window;
}

function joinRemotePath(basePath: string, name: string) {
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return `${normalizedBase}${name}/`;
}

function ensureDirectoryPath(path: string) {
  return path.endsWith("/") ? path : `${path}/`;
}
