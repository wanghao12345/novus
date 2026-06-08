import { useEffect, useMemo } from "react";
import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useNotifications } from "reapop";
import "./App.css";
import { FileManager } from "./components/file-manager/FileManager";
import { SessionBox } from "./components/session/SessionBox";
import useSessionStore from "./store/session.store";
import type { SessionFormData } from "./types/session";

function App() {
  const { notify } = useNotifications();
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

  useEffect(() => {
    if (!isTauriRuntime()) {
      return;
    }

    const connectedSessions = useSessionStore.getState().sessions.filter((session) => session.status === "connected");

    for (const session of connectedSessions) {
      if (!session.connectionId) {
        useSessionStore.getState().setConnectionState(session.id, "disconnected");
        continue;
      }

      void invoke("check_connection", { connectionId: session.connectionId }).catch(() => {
        useSessionStore.getState().setConnectionState(session.id, "disconnected");
        notify({
          id: `connection-check-${session.id}`,
          message: `${session.sessionName} connection is no longer active.`,
          status: "warning",
        });
      });
    }

    const unlistenPromise = listen<string>("connection_dead", (event) => {
      useSessionStore.getState().markConnectionDead(event.payload);
      notify({
        id: `connection-dead-${event.payload}`,
        message: "A server connection was lost.",
        status: "warning",
      });
    });

    const handleBeforeUnload = () => {
      useSessionStore.getState().disconnectAllSessions();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      void unlistenPromise.then((unlisten) => unlisten());
    };
  }, [notify]);

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
        notify({
          id: `disconnect-${session.id}`,
          message: `${session.sessionName} disconnected.`,
          status: "success",
        });
        return;
      }

      if (!session.password) {
        notify({
          id: `missing-password-${session.id}`,
          message: "Please edit this session and enter a password before connecting.",
          status: "warning",
        });
        return;
      }

      const notificationId = `connect-${session.id}`;
      notify({
        dismissAfter: 2500,
        dismissible: false,
        id: notificationId,
        message: `Connecting to ${session.sessionName}...`,
        status: "loading",
      });
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
      setConnectionState(sessionId, "connected", connectionId);
      notify({
        dismissAfter: 4500,
        dismissible: true,
        id: notificationId,
        message: `${session.sessionName} connected successfully.`,
        status: "success",
      });
    } catch (error) {
      notify({
        dismissAfter: 8000,
        dismissible: true,
        id: `connect-${session.id}`,
        message: formatCommandError(error, "Connection failed"),
        status: "error",
      });
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
          {selectedSession && selectedSession.status === "connected" ? (
            <FileManager session={selectedSession} />
          ) : selectedSession ? (
            <DisconnectedPanel sessionName={selectedSession.sessionName} onConnect={() => void handleToggleConnection(selectedSession.id)} />
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

function formatCommandError(error: unknown, fallback: string) {
  if (typeof error === "string" && error.trim()) {
    return `${fallback}: ${error}`;
  }

  if (error instanceof Error && error.message) {
    return `${fallback}: ${error.message}`;
  }

  try {
    return `${fallback}: ${JSON.stringify(error)}`;
  } catch {
    return fallback;
  }
}

function DisconnectedPanel({ onConnect, sessionName }: { onConnect: () => void; sessionName: string }) {
  return (
    <Flex className="h-full px-6 text-center" align="center" direction="column" justify="center">
      <Heading size="4" mb="2">
        {sessionName} is disconnected
      </Heading>
      <Text color="gray" size="2" mb="4">
        Connect this server from the session list before browsing remote files.
      </Text>
      <Button onClick={onConnect} size="2" variant="surface">
        Connect
      </Button>
    </Flex>
  );
}
