import { Box, Button, Card, Flex } from "@radix-ui/themes";
import { DesktopIcon, LinkNone1Icon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons'

export function SessionItem() {
  return (
    <Box>
      <Card className="w-full h-full">
        <div className="w-full flex items-center gap-3">
          <DesktopIcon className="w-6 h-6" color="gray" />
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-xs font-medium">Session 1</span>
            <span className="text-xs text-slate-500">8.128.128.128</span>
          </div>
        </div>
        <Flex align="center" gap="3" className="w-full mt-4">
          <Button size="1" variant="outline">
            Connect
          </Button>
          <Button size="1" variant="outline">
            Edit
          </Button>
          <Button size="1" variant="outline">
            Delete
          </Button>
        </Flex>
      </Card>
    </Box>

  );
}