import { AlertDialog, Button, Flex, IconButton, Tooltip } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";

interface DeleteSessionDialogProps {
  sessionName: string;
  onDelete: () => void;
}

export function DeleteSessionDialog({ sessionName, onDelete }: DeleteSessionDialogProps) {
  return (
    <AlertDialog.Root>
      <Tooltip content="Delete session">
        <AlertDialog.Trigger>
          <IconButton aria-label="Delete session" color="red" size="2" variant="surface">
            <TrashIcon />
          </IconButton>
        </AlertDialog.Trigger>
      </Tooltip>

      <AlertDialog.Content maxWidth="420px">
        <AlertDialog.Title>Delete Session</AlertDialog.Title>
        <AlertDialog.Description color="gray" size="2">
          Delete {sessionName}? This only removes the local profile from the list.
        </AlertDialog.Description>

        <Flex gap="3" mt="5" justify="end">
          <AlertDialog.Cancel>
            <Button color="gray" variant="soft">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button color="red" onClick={onDelete}>
              Delete
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
