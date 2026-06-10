import { Box, Button, Flex, Heading, ScrollArea, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import type { Session, SessionFormData } from "@/types/session";
import { SessionDialog } from "./SessionDialog";
import { SessionItem } from "./SessionItem";

interface SessionBoxProps {
  sessions: Session[];
  selectedSessionId: string;
  onCreateSession: (session: SessionFormData) => void;
  onDeleteSession: (sessionId: string) => void;
  onSelectSession: (sessionId: string) => void;
  onToggleConnection: (sessionId: string) => void;
  onUpdateSession: (sessionId: string, session: SessionFormData) => void;
}

export function SessionBox({
  sessions,
  selectedSessionId,
  onCreateSession,
  onDeleteSession,
  onSelectSession,
  onToggleConnection,
  onUpdateSession,
}: SessionBoxProps) {
  return (
    <Flex className="h-full" direction="column">
      <Flex
        className="h-[76px] shrink-0 border-b border-[color:var(--gray-a5)] px-4"
        align="center"
        justify="between"
      >
        <Box>
          <Heading size="4" weight="bold">
            Novus
          </Heading>
          <Text color="gray" size="1">
            SFTP workspace
          </Text>
        </Box>

        <SessionDialog mode="create" onSubmit={onCreateSession}>
          <Button size="2" variant="surface">
            <PlusIcon />
            New Session
          </Button>
        </SessionDialog>
      </Flex>

      <ScrollArea className="min-h-0 flex-1">
        {sessions.length > 0 ? (
          <Flex className="p-3" direction="column" gap="3">
            {sessions.map((session) => (
              <SessionItem
                isSelected={session.id === selectedSessionId}
                key={session.id}
                session={session}
                onDelete={() => onDeleteSession(session.id)}
                onSelect={() => onSelectSession(session.id)}
                onToggleConnection={() => onToggleConnection(session.id)}
                onUpdate={(formData) => onUpdateSession(session.id, formData)}
              />
            ))}
          </Flex>
        ) : (
          <Flex className="h-full p-5 text-center" align="center" direction="column" justify="center">
            <Text color="gray" size="2">
              No sessions yet.
            </Text>
            <SessionDialog mode="create" onSubmit={onCreateSession}>
              <Button mt="3" size="2" variant="surface">
                <PlusIcon />
                Create Session
              </Button>
            </SessionDialog>
          </Flex>
        )}
      </ScrollArea>
    </Flex>
  );
}
