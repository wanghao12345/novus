import { Box, Button, Flex, Heading, ScrollArea, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import type { Session } from "../../App";
import { SessionCreate, type SessionCreateFormData } from "./SessionCreate";
import { SessionItem } from "./SessionItem";

interface SessionBoxProps {
  sessions: Session[];
  selectedSessionId: string;
  onCreateSession: (session: SessionCreateFormData) => void;
  onDeleteSession: (sessionId: string) => void;
  onSelectSession: (sessionId: string) => void;
  onToggleConnection: (sessionId: string) => void;
}

export function SessionBox({
  sessions,
  selectedSessionId,
  onCreateSession,
  onDeleteSession,
  onSelectSession,
  onToggleConnection,
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

        <SessionCreate onCreateSession={onCreateSession}>
          <Button size="2" variant="surface">
            <PlusIcon />
            New Session
          </Button>
        </SessionCreate>
      </Flex>

      <ScrollArea className="min-h-0 flex-1">
        <Flex className="p-3" direction="column" gap="3">
          {sessions.map((session) => (
            <SessionItem
              isSelected={session.id === selectedSessionId}
              key={session.id}
              session={session}
              onDelete={() => onDeleteSession(session.id)}
              onSelect={() => onSelectSession(session.id)}
              onToggleConnection={() => onToggleConnection(session.id)}
            />
          ))}
        </Flex>
      </ScrollArea>
    </Flex>
  );
}
