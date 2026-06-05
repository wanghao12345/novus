import { Badge, Box, Button, Card, Flex, IconButton, Text } from "@radix-ui/themes";
import { DesktopIcon, DotFilledIcon, Pencil2Icon } from "@radix-ui/react-icons";
import type { Session, SessionFormData } from "../../types/session";
import { SessionDialog } from "./SessionDialog";
import { DeleteSessionDialog } from "./parts/DeleteSessionDialog";

interface SessionItemProps {
  isSelected: boolean;
  session: Session;
  onDelete: () => void;
  onSelect: () => void;
  onToggleConnection: () => void;
  onUpdate: (session: SessionFormData) => void;
}

export function SessionItem({
  isSelected,
  session,
  onDelete,
  onSelect,
  onToggleConnection,
  onUpdate,
}: SessionItemProps) {
  const isConnected = session.status === "connected";

  return (
    <Card
      className={[
        "border transition-colors",
        isSelected
          ? "border-[#A144AF] bg-[var(--gray-a1)]"
          : "border-[color:var(--gray-a2)] bg-[var(--gray-a1)]",
      ].join(" ")}
      variant="surface"
    >
      <Box asChild>
        <button
          className="w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-left text-inherit"
          onClick={onSelect}
          type="button"
        >
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
        </button>
      </Box>

      <Flex align="center" gap="2" mt="4">
        <Button
          className="flex-1"
          color={isConnected ? "gray" : "green"}
          onClick={onToggleConnection}
          size="2"
          variant="surface"
        >
          {isConnected ? "Disconnect" : "Connect"}
        </Button>

        <SessionDialog
          initialValues={{
            host: session.host,
            password: session.password,
            port: session.port,
            sessionName: session.sessionName,
            username: session.username,
          }}
          mode="edit"
          onSubmit={onUpdate}
        >
          <IconButton aria-label="Edit session" size="2" variant="surface">
            <Pencil2Icon />
          </IconButton>
        </SessionDialog>

        <DeleteSessionDialog sessionName={session.sessionName} onDelete={onDelete} />
      </Flex>
    </Card>
  );
}
