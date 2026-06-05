import { useMemo, useState } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { FileManager } from "./components/file-manager/FileManager";
import { SessionBox } from "./components/session/SessionBox";
import { initialSessions } from "./data/sessions";
import type { Session, SessionFormData } from "./types/session";

function App() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessions[0]?.id ?? "");

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId),
    [selectedSessionId, sessions],
  );

  const handleCreateSession = (session: SessionFormData) => {
    const createdSession: Session = {
      ...session,
      id: crypto.randomUUID(),
      status: "disconnected",
    };

    setSessions((currentSessions) => [createdSession, ...currentSessions]);
    setSelectedSessionId(createdSession.id);
  };

  const handleUpdateSession = (sessionId: string, formData: SessionFormData) => {
    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              ...formData,
            }
          : session,
      ),
    );
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((currentSessions) => {
      const nextSessions = currentSessions.filter((session) => session.id !== sessionId);

      setSelectedSessionId((currentId) => {
        if (currentId !== sessionId) {
          return currentId;
        }

        return nextSessions[0]?.id ?? "";
      });

      return nextSessions;
    });
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

        setSessions((currentSessions) =>
          currentSessions.map((currentSession) =>
            currentSession.id === sessionId
              ? {
                  ...currentSession,
                  connectionId: undefined,
                  status: "disconnected",
                }
              : currentSession,
          ),
        );
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

      setSessions((currentSessions) =>
        currentSessions.map((currentSession) =>
          currentSession.id === sessionId
            ? {
                ...currentSession,
                connectionId,
                status: "connected",
              }
            : currentSession,
        ),
      );
    } catch (error) {
      window.alert(`Connection failed: ${String(error)}`);
    }
  };

  return (
    <main className="h-screen box-border border-t border-[color:var(--gray-a5)] w-full overflow-hidden bg-[var(--color-background)] text-[var(--gray-12)]">
      <Flex className="h-full w-full">
        <Box className="h-full w-[360px] shrink-0 border-r border-[color:var(--gray-a5)] bg-[var(--gray-a2)]">
          <SessionBox
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onSelectSession={setSelectedSessionId}
            onToggleConnection={handleToggleConnection}
            onUpdateSession={handleUpdateSession}
          />
        </Box>

        <Box className="min-w-0 flex-1">
          {selectedSession ? (
            <FileManager key={selectedSession.id} session={selectedSession} />
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
