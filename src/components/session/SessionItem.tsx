import { Badge, Box, Button, Card, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { DesktopIcon, DotFilledIcon, TrashIcon } from "@radix-ui/react-icons";
import type { Session } from "../../App";

interface SessionItemProps {
  isSelected: boolean;
  session: Session;
  onDelete: () => void;
  onSelect: () => void;
  onToggleConnection: () => void;
}

export function SessionItem({
  isSelected,
  session,
  onDelete,
  onSelect,
  onToggleConnection,
}: SessionItemProps) {
  const isConnected = session.status === "connected";

  return (
    <Card
      asChild
      className={[
        "cursor-pointer border transition-colors",
        isSelected ? "border-[color:var(--accent-a7)] bg-[var(--accent-a3)]" : "border-[color:var(--gray-a4)]",
      ].join(" ")}
      variant="surface"
    >
      <article onClick={onSelect}>
        <Flex align="start" gap="3">
          <Flex
            className="h-11 w-11 shrink-0 rounded-md border border-[color:var(--gray-a5)] bg-[var(--gray-a3)]"
            align="center"
            justify="center"
          >
            <DesktopIcon className="h-5 w-5 text-[var(--gray-11)]" />
          </Flex>

          <Box className="min-w-0 flex-1">
            <Flex align="center" gap="2">
              <Text className="truncate" size="3" weight="bold">
                {session.sessionName}
              </Text>
              <Badge color={isConnected ? "green" : "gray"} size="1" variant="soft">
                <DotFilledIcon />
                {isConnected ? "Online" : "Offline"}
              </Badge>
            </Flex>
            <Text className="block truncate" color="gray" size="2">
              {session.username}@{session.host}:{session.port}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap="2" mt="4">
          <Button
            className="flex-1"
            color={isConnected ? "gray" : "green"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleConnection();
            }}
            size="2"
            variant="surface"
          >
            {isConnected ? "Disconnect" : "Connect"}
          </Button>

          <Button
            onClick={(event) => {
              event.stopPropagation();
            }}
            size="2"
            variant="surface"
          >
            Edit
          </Button>

          <Tooltip content="Delete session">
            <IconButton
              aria-label="Delete session"
              color="red"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              size="2"
              variant="surface"
            >
              <TrashIcon />
            </IconButton>
          </Tooltip>
        </Flex>
      </article>
    </Card>
  );
}
