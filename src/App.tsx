import { useMemo } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { FileManager } from "./components/file-manager/FileManager";
import { SessionBox } from "./components/session/SessionBox";
import useSessionStore from "./store/session.store";
import type { SessionFormData } from "./types/session";

function App() {
  const sessions = useSessionStore((state) => state.sessions);
  const selectedSessionId = useSessionStore((state) => state.selectedSessionId);
  const createSession = useSessionStore((state) => state.createSession);
  const deleteSession = useSessionStore((state) => state.deleteSession);
  const selectSession = useSessionStore((state) => state.selectSession);
  const setConnectionState = useSessionStore((state) => state.setConnectionState);
  const updateSession = useSessionStore((state) => state.updateSession);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId),
    [selectedSessionId, sessions],
  );

  const handleCreateSession = (session: SessionFormData) => {
    createSession(session);
  };

  const handleUpdateSession = (sessionId: string, formData: SessionFormData) => {
    updateSession(sessionId, formData);
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
  };

  const handleToggleConnection = async (sessionId: string) => {
    const session = sessions.find((currentSession) => currentSession.id === sessionId);

    if (!session) {
      return;
    }

    try {
      if (session.status === "connected") {
        if (isTauriRuntime() && session.connectionId) {
          await invoke("disconnect_sftp", { connectionId: session.connectionId });
        }

        setConnectionState(sessionId, "disconnected");
        return;
      }

      if (!session.password) {
        window.alert("Please edit this session and enter a password before connecting.");
        return;
      }

      const connectionId = isTauriRuntime()
        ? await invoke<string>("connect_sftp", {
            config: {
              host: session.host,
              password: session.password,
              port: session.port,
              session_name: session.sessionName,
              username: session.username,
            },
          })
        : `preview-${session.id}`;
      console.log(`Connected to ${session.host} as ${session.username}, connectionId: ${connectionId}`);
      setConnectionState(sessionId, "connected", connectionId);
    } catch (error) {
      window.alert(`Connection failed: ${String(error)}`);
    }
  };

  return (
    <main className="h-screen box-border border-t border-[color:var(--gray-a5)] w-full overflow-hidden bg-[var(--color-background)] text-[var(--gray-12)]">
      <Flex className="h-full w-full">
        <Box className="h-full w-[360px] shrink-0 border-r border-[color:var(--gray-a5)]">
          <SessionBox
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onSelectSession={selectSession}
            onToggleConnection={handleToggleConnection}
            onUpdateSession={handleUpdateSession}
          />
        </Box>

        <Box className="min-w-0 flex-1">
          {selectedSession ? (
            <FileManager session={selectedSession} />
          ) : (
            <Flex className="h-full" align="center" justify="center">
              <Text color="gray" size="3">
                Create or select a session to browse files.
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </main>
  );
}

export default App;

function isTauriRuntime() {
  return "__TAURI_INTERNALS__" in window;
}
