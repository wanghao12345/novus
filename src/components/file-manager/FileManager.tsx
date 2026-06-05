import { useEffect, useState } from "react";
import { Flex, ScrollArea } from "@radix-ui/themes";
import { fileEntries } from "../../data/files";
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
  const homePath = `/home/${session.username}/`;
  const [density, setDensity] = useState<FileDensity>("comfortable");
  const [entries, setEntries] = useState<FileEntry[]>(fileEntries);
  const [pathHistory, setPathHistory] = useState([homePath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedFileId, setSelectedFileId] = useState<string>();
  const [statusMessage, setStatusMessage] = useState("Ready");

  const activePath = isConnected ? pathHistory[historyIndex] ?? homePath : "Connect session to browse files";
  const selectedFile = entries.find((entry) => entry.id === selectedFileId);

  useEffect(() => {
    setPathHistory([homePath]);
    setHistoryIndex(0);
    setSelectedFileId(undefined);
    setStatusMessage("Ready");
  }, [homePath, session.id]);

  const updatePath = (path: string) => {
    setPathHistory((currentHistory) => [...currentHistory.slice(0, historyIndex + 1), path]);
    setHistoryIndex((currentIndex) => currentIndex + 1);
    setSelectedFileId(undefined);
  };

  const handleOpenFolder = (entry: FileEntry) => {
    const nextPath = `${homePath}${entry.name}/`;

    updatePath(nextPath);
    setStatusMessage(`Opened ${entry.name}`);
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
