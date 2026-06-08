import { useState } from "react";
import { Badge, Box, Flex, IconButton, Progress, Text } from "@radix-ui/themes";
import { ChevronDownIcon, ChevronUpIcon, Cross2Icon } from "@radix-ui/react-icons";
import type { UploadTask } from "../../../types/file-manager";

interface UploadProgressPanelProps {
  tasks: UploadTask[];
  onDismissTask: (taskId: string) => void;
}

export function UploadProgressPanel({ tasks, onDismissTask }: UploadProgressPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (tasks.length === 0) {
    return null;
  }

  const uploadingCount = tasks.filter((task) => task.status === "uploading").length;

  return (
    <Box className="fixed bottom-4 right-4 z-50 w-[360px] overflow-hidden rounded-lg border border-[color:var(--gray-a6)] bg-[var(--gray-2)] shadow-[0_18px_60px_rgba(0,0,0,0.42)]">
      <Flex className="border-b border-[color:var(--gray-a5)] px-3 py-2" align="center" justify="between">
        <Flex align="center" gap="2">
          <Text size="2" weight="bold">
            Uploads
          </Text>
          <Badge color={uploadingCount > 0 ? "blue" : "gray"} size="1" variant="soft">
            {uploadingCount > 0 ? `${uploadingCount} active` : `${tasks.length} total`}
          </Badge>
        </Flex>
        <IconButton aria-label={isExpanded ? "Collapse uploads" : "Expand uploads"} onClick={() => setIsExpanded((value) => !value)} size="1" variant="ghost">
          {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </IconButton>
      </Flex>

      {isExpanded ? (
        <Flex className="max-h-[320px] overflow-auto p-3" direction="column" gap="3">
          {tasks.map((task) => (
            <Box key={task.id}>
              <Flex align="center" justify="between" mb="2">
                <Box className="min-w-0">
                  <Text className="block truncate" size="2" weight="bold">
                    {task.fileName}
                  </Text>
                  <Text className="block truncate" color="gray" size="1">
                    {task.remotePath}
                  </Text>
                </Box>
                {task.status !== "uploading" ? (
                  <IconButton aria-label="Dismiss upload" onClick={() => onDismissTask(task.id)} size="1" variant="ghost">
                    <Cross2Icon />
                  </IconButton>
                ) : null}
              </Flex>
              <Progress color={getProgressColor(task.status)} value={task.progress} />
              <Flex mt="1" justify="between">
                <Text color="gray" size="1">
                  {getStatusLabel(task.status)}
                </Text>
                <Text color="gray" size="1">
                  {task.progress}%
                </Text>
              </Flex>
            </Box>
          ))}
        </Flex>
      ) : null}
    </Box>
  );
}

function getProgressColor(status: UploadTask["status"]) {
  if (status === "success") {
    return "green";
  }

  if (status === "error") {
    return "red";
  }

  return "blue";
}

function getStatusLabel(status: UploadTask["status"]) {
  if (status === "success") {
    return "Uploaded";
  }

  if (status === "error") {
    return "Failed";
  }

  return "Uploading";
}
