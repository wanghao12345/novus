import { Badge, Button, Flex, Text } from "@radix-ui/themes";
import type { FileDensity, FileEntry } from "../../../types/file-manager";

interface FileStatusBarProps {
  density: FileDensity;
  entriesCount: number;
  isConnected: boolean;
  selectedFile?: FileEntry;
  sessionName: string;
  statusMessage: string;
  onToggleDensity: () => void;
}

export function FileStatusBar({
  density,
  entriesCount,
  isConnected,
  selectedFile,
  sessionName,
  statusMessage,
  onToggleDensity,
}: FileStatusBarProps) {
  return (
    <Flex className="h-[56px] shrink-0 border-t border-[color:var(--gray-a5)] px-4" align="center" justify="between">
      <Flex className="min-w-0" align="center" gap="3">
        <Badge color={isConnected ? "green" : "gray"} size="2" variant="surface">
          {sessionName}
        </Badge>
        <Text color="gray" size="2">
          Total Files: {entriesCount}
        </Text>
        {selectedFile ? (
          <Text className="truncate" color="gray" size="2">
            Selected: {selectedFile.name}
          </Text>
        ) : null}
        <Text className="truncate" color="gray" size="2">
          {statusMessage}
        </Text>
      </Flex>

      <Button onClick={onToggleDensity} size="2" variant="surface">
        {density === "comfortable" ? "Comfortable" : "Compact"}
      </Button>
    </Flex>
  );
}
