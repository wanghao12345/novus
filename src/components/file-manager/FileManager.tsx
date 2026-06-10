import { useCallback, useEffect, useState } from "react";
import { Flex, ScrollArea } from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-dialog";
import { useNotifications } from "reapop";
import { fileEntries } from "../../data/files";
import { copyItem, createDirectory, deleteItem, listDirectory, moveItem, renameItem } from "../../services/sftpDirectory";
import { uploadFile } from "../../services/sftpTransfer";
import type { Session } from "../../types/session";
import type { FileDensity, FileEntry, UploadTask } from "../../types/file-manager";
import { FileStatusBar } from "./parts/FileStatusBar";
import { FileTable } from "./parts/FileTable";
import { FileToolbar } from "./parts/FileToolbar";
import { RenameDialog } from "./parts/RenameDialog";
import { UploadProgressPanel } from "./parts/UploadProgressPanel";

interface FileManagerProps {
  session: Session;
}

export function FileManager({ session }: FileManagerProps) {
  const { notify } = useNotifications();
  const isConnected = session.status === "connected";
  const rootPath = "/";
  const [density, setDensity] = useState<FileDensity>("comfortable");
  const [entries, setEntries] = useState<FileEntry[]>(fileEntries);
  const [pathHistory, setPathHistory] = useState([rootPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedFileId, setSelectedFileId] = useState<string>();
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [renameEntry, setRenameEntry] = useState<FileEntry | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [clipboardItem, setClipboardItem] = useState<{ entry: FileEntry; operation: "copy" | "move" } | null>(null);

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
      const notificationId = `directory-${session.id}`;
      notify({
        dismissible: false,
        id: notificationId,
        message: `Loading ${path}...`,
        status: "loading",
      });

      try {
        const nextEntries = await listDirectory({
          connectionId: session.connectionId,
          path,
        });

        setEntries(nextEntries);
        setStatusMessage(nextEntries.length > 0 ? "Directory loaded" : "Directory is empty");
        notify({
          dismissAfter: 2500,
          dismissible: true,
          id: notificationId,
          message: nextEntries.length > 0 ? "Directory loaded." : "Directory is empty.",
          status: "success",
        });
      } catch (error) {
        const message = `Failed to load directory: ${String(error)}`;
        setEntries([]);
        setStatusMessage(message);
        notify({
          dismissAfter: 7000,
          dismissible: true,
          id: notificationId,
          message,
          status: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, notify, session.connectionId, session.id],
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

    const notificationId = `create-folder-${session.id}-${folderPath}`;
    notify({
      dismissible: false,
      id: notificationId,
      message: `Creating ${folderName}...`,
      status: "loading",
    });

    try {
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
      notify({
        dismissAfter: 3500,
        dismissible: true,
        id: notificationId,
        message: `Created ${folderName}.`,
        status: "success",
      });
    } catch (error) {
      const message = `Failed to create folder: ${String(error)}`;
      setStatusMessage(message);
      notify({
        dismissAfter: 7000,
        dismissible: true,
        id: notificationId,
        message,
        status: "error",
      });
      throw error;
    }
  };

  const handleDeleteEntry = async (entry: FileEntry) => {
    const notificationId = `delete-entry-${session.id}-${entry.path}`;
    notify({
      dismissible: false,
      id: notificationId,
      message: `Deleting ${entry.name}...`,
      status: "loading",
    });

    try {
      if (isTauriRuntime() && session.connectionId) {
        await deleteItem({
          connectionId: session.connectionId,
          path: entry.path,
        });
        await loadDirectory(pathHistory[historyIndex] ?? rootPath);
        setStatusMessage(`Deleted ${entry.name}`);
        notify({
          dismissAfter: 3500,
          dismissible: true,
          id: notificationId,
          message: `Deleted ${entry.name}.`,
          status: "success",
        });
        return;
      }

      if (!isTauriRuntime()) {
        setEntries((currentEntries) => currentEntries.filter((currentEntry) => currentEntry.id !== entry.id));
        setStatusMessage(`Deleted ${entry.name}`);
        notify({
          dismissAfter: 3500,
          dismissible: true,
          id: notificationId,
          message: `Deleted ${entry.name}.`,
          status: "success",
        });
        return;
      }
    } catch (error) {
      const message = `Failed to delete ${entry.name}: ${String(error)}`;
      setStatusMessage(message);
      notify({
        dismissAfter: 7000,
        dismissible: true,
        id: notificationId,
        message,
        status: "error",
      });
    }
  };

  const handleDownloadEntry = (entry: FileEntry) => {
    setStatusMessage(`Download requested for ${entry.name}`);
    notify({
      id: `download-entry-${session.id}-${entry.path}`,
      message: `Download requested for ${entry.name}.`,
      status: "info",
    });
  };

  const handleRenameEntry = (entry: FileEntry) => {
    setRenameEntry(entry);
    setIsRenameDialogOpen(true);
  };

  const handleRename = async (entry: FileEntry, newName: string) => {
    const notificationId = `rename-entry-${session.id}-${entry.path}`;
    notify({
      dismissible: false,
      id: notificationId,
      message: `Renaming ${entry.name} to ${newName}...`,
      status: "loading",
    });

    try {
      if (isTauriRuntime() && session.connectionId) {
        const currentPath = pathHistory[historyIndex] ?? rootPath;
        const oldPath = entry.path || joinRemoteFilePath(currentPath, entry.name);
        const newPath = joinRemoteFilePath(currentPath, newName);

        await renameItem({
          connectionId: session.connectionId,
          oldPath,
          newPath,
        });
        await loadDirectory(currentPath);
      } else {
        setEntries((currentEntries) =>
          currentEntries.map((currentEntry) =>
            currentEntry.id === entry.id ? { ...currentEntry, name: newName } : currentEntry
          )
        );
      }

      setStatusMessage(`Renamed ${entry.name} to ${newName}`);
      notify({
        dismissAfter: 3500,
        dismissible: true,
        id: notificationId,
        message: `Renamed ${entry.name} to ${newName}.`,
        status: "success",
      });
    } catch (error) {
      const message = `Failed to rename ${entry.name}: ${String(error)}`;
      setStatusMessage(message);
      notify({
        dismissAfter: 7000,
        dismissible: true,
        id: notificationId,
        message,
        status: "error",
      });
      throw error;
    }
  };

  const handleCopyEntry = (entry: FileEntry) => {
    setClipboardItem({ entry, operation: "copy" });
    setStatusMessage(`Copied ${entry.name} to clipboard`);
    notify({
      id: `copy-entry-${session.id}-${entry.path}`,
      message: `Copied ${entry.name} to clipboard.`,
      status: "success",
    });
  };

  const handleCutEntry = (entry: FileEntry) => {
    setClipboardItem({ entry, operation: "move" });
    setStatusMessage(`Cut ${entry.name} to clipboard`);
    notify({
      id: `cut-entry-${session.id}-${entry.path}`,
      message: `Cut ${entry.name} to clipboard.`,
      status: "success",
    });
  };

  const handlePaste = async () => {
    if (!clipboardItem || !session.connectionId) {
      return;
    }

    const { entry, operation } = clipboardItem;
    const currentPath = pathHistory[historyIndex] ?? rootPath;
    const targetPath = joinRemoteFilePath(currentPath, entry.name);
    const sourcePath = entry.path || joinRemoteFilePath(currentPath, entry.name);

    const notificationId = `${operation}-entry-${session.id}-${entry.path}`;
    notify({
      dismissible: false,
      id: notificationId,
      message: `${operation === "copy" ? "Copying" : "Moving"} ${entry.name}...`,
      status: "loading",
    });

    try {
      if (isTauriRuntime()) {
        if (operation === "copy") {
          await copyItem({
            connectionId: session.connectionId,
            sourcePath,
            targetPath,
            isDirectory: entry.type === "folder",
          });
        } else {
          await moveItem({
            connectionId: session.connectionId,
            sourcePath,
            targetPath,
          });
        }
        await loadDirectory(currentPath);
      } else {
        setEntries((currentEntries) => {
          const newEntry = { ...entry, id: `${entry.name}-${Date.now()}`, path: targetPath };
          if (operation === "move") {
            return currentEntries.filter((currentEntry) => currentEntry.id !== entry.id);
          }
          return [...currentEntries, newEntry];
        });
      }

      setStatusMessage(`${operation === "copy" ? "Copied" : "Moved"} ${entry.name}`);
      notify({
        dismissAfter: 3500,
        dismissible: true,
        id: notificationId,
        message: `${operation === "copy" ? "Copied" : "Moved"} ${entry.name}.`,
        status: "success",
      });
      setClipboardItem(null);
    } catch (error) {
      const message = `Failed to ${operation} ${entry.name}: ${String(error)}`;
      setStatusMessage(message);
      notify({
        dismissAfter: 7000,
        dismissible: true,
        id: notificationId,
        message,
        status: "error",
      });
    }
  };

  const handleUploadClick = async () => {
    if (!isTauriRuntime()) {
      notify({
        id: `upload-dialog-${session.id}`,
        message: "File upload requires the Tauri desktop app.",
        status: "warning",
      });
      return;
    }

    let selectedPaths: string | string[] | null;

    try {
      selectedPaths = await open({
        directory: false,
        multiple: true,
      });
    } catch (error) {
      notify({
        dismissAfter: 6000,
        dismissible: true,
        id: `upload-dialog-${session.id}`,
        message: `Unable to open file picker: ${String(error)}`,
        status: "error",
      });
      return;
    }

    if (!selectedPaths) {
      return;
    }

    const localPaths = Array.isArray(selectedPaths) ? selectedPaths : [selectedPaths];

    for (const localPath of localPaths) {
      void uploadSelectedFile(localPath);
    }
  };

  const uploadSelectedFile = async (localPath: string) => {
    const fileName = getFileNameFromPath(localPath);
    const currentPath = pathHistory[historyIndex] ?? rootPath;
    const remotePath = joinRemoteFilePath(currentPath, fileName);
    const taskId = `upload-${Date.now()}-${fileName}`;

    setUploadTasks((currentTasks) => [
      {
        fileName,
        id: taskId,
        progress: 8,
        remotePath,
        status: "uploading",
      },
      ...currentTasks,
    ]);
    setStatusMessage(`Uploading ${fileName}`);
    notify({
      id: taskId,
      message: `Uploading ${fileName}...`,
      status: "loading",
    });

    const timer = window.setInterval(() => {
      setUploadTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId && task.status === "uploading"
            ? {
                ...task,
                progress: Math.min(task.progress + 12, 88),
              }
            : task,
        ),
      );
    }, 500);

    try {
      if (isTauriRuntime() && session.connectionId) {
        await uploadFile({
          connectionId: session.connectionId,
          localPath,
          remotePath,
        });
        await loadDirectory(currentPath);
      }

      window.clearInterval(timer);
      setUploadTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                progress: 100,
                status: "success",
              }
            : task,
        ),
      );
      setStatusMessage(`Uploaded ${fileName}`);
      notify({
        dismissAfter: 4000,
        dismissible: true,
        id: taskId,
        message: `Uploaded ${fileName}.`,
        status: "success",
      });
    } catch (error) {
      window.clearInterval(timer);
      const message = `Failed to upload ${fileName}: ${String(error)}`;
      setStatusMessage(message);
      setUploadTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: "error",
              }
            : task,
        ),
      );
      notify({
        dismissAfter: 7000,
        dismissible: true,
        id: taskId,
        message,
        status: "error",
      });
    }
  };

  return (
    <Flex className="h-full min-w-0 bg-[var(--gray-1)]" direction="column">
      <FileToolbar
        canGoBack={isConnected && historyIndex > 0}
        canGoForward={isConnected && historyIndex < pathHistory.length - 1}
        canUseFiles={isConnected}
        hasClipboardItem={clipboardItem !== null}
        onClearSelection={() => {
          setSelectedFileId(undefined);
          setStatusMessage("Selection cleared");
        }}
        onCreateFolder={handleCreateFolder}
        onDownload={() => {
          const message = selectedFile ? `Queued download for ${selectedFile.name}` : "Select a file first";
          setStatusMessage(message);
          notify({
            id: selectedFile ? `download-selection-${session.id}-${selectedFile.path}` : `download-selection-${session.id}`,
            message,
            status: selectedFile ? "info" : "warning",
          });
        }}
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
        onPaste={handlePaste}
        onRefresh={() => {
          void loadDirectory(activePath);
        }}
        onUpload={handleUploadClick}
        path={activePath}
        selectedCount={selectedFile ? 1 : 0}
      />

      <ScrollArea className="min-h-0 flex-1">
        <FileTable
          density={density}
          entries={entries}
          isDisabled={!isConnected || isLoading}
          onCopyEntry={handleCopyEntry}
          onCutEntry={handleCutEntry}
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

      <UploadProgressPanel
        onDismissTask={(taskId) => {
          setUploadTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
        }}
        tasks={uploadTasks}
      />

      <RenameDialog
        entry={renameEntry}
        isOpen={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        onRename={handleRename}
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

function joinRemoteFilePath(basePath: string, fileName: string) {
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return `${normalizedBase}${fileName}`;
}

function ensureDirectoryPath(path: string) {
  return path.endsWith("/") ? path : `${path}/`;
}

function getFileNameFromPath(path: string) {
  return path.split(/[\\/]/).pop() ?? path;
}
