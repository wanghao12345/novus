import { useMemo, useState } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import "./App.css";
import { FileManager } from "./components/file-manager/FileManager";
import { SessionBox } from "./components/session/SessionBox";

export interface Session {
  id: string;
  sessionName: string;
  host: string;
  port: number;
  username: string;
  status: "connected" | "disconnected";
}

const initialSessions: Session[] = [
  {
    id: "secret-server",
    sessionName: "Secret Server",
    host: "159.89.169.100",
    port: 22,
    username: "root",
    status: "connected",
  },
  {
    id: "staging-node",
    sessionName: "Staging Node",
    host: "10.18.24.11",
    port: 22,
    username: "deploy",
    status: "disconnected",
  },
];

function App() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessions[0]?.id ?? "");

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId),
    [selectedSessionId, sessions],
  );

  const handleCreateSession = (session: Omit<Session, "id" | "status">) => {
    const createdSession: Session = {
      ...session,
      id: crypto.randomUUID(),
      status: "disconnected",
    };

    setSessions((currentSessions) => [createdSession, ...currentSessions]);
    setSelectedSessionId(createdSession.id);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((currentSessions) => currentSessions.filter((session) => session.id !== sessionId));
    setSelectedSessionId((currentId) => {
      if (currentId !== sessionId) {
        return currentId;
      }

      const nextSession = sessions.find((session) => session.id !== sessionId);
      return nextSession?.id ?? "";
    });
  };

  const handleToggleConnection = (sessionId: string) => {
    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: session.status === "connected" ? "disconnected" : "connected",
            }
          : session,
      ),
    );
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-[var(--color-background)] text-[var(--gray-12)]">
      <Flex className="h-full w-full">
        <Box className="h-full w-[360px] shrink-0 border-r border-[color:var(--gray-a5)] bg-[var(--gray-a2)]">
          <SessionBox
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onSelectSession={setSelectedSessionId}
            onToggleConnection={handleToggleConnection}
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
