import { type FormEvent, type ReactNode, useState } from "react";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";

interface CreateFolderDialogProps {
  children: ReactNode;
  isDisabled: boolean;
  onCreateFolder: (folderName: string) => Promise<void> | void;
}

export function CreateFolderDialog({ children, isDisabled, onCreateFolder }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = folderName.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedName) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateFolder(trimmedName);
      setFolderName("");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger disabled={isDisabled}>{children}</Dialog.Trigger>

      <Dialog.Content maxWidth="420px">
        <form onSubmit={handleSubmit}>
          <Dialog.Title>Create Folder</Dialog.Title>
          <Dialog.Description color="gray" size="2" mb="4">
            Enter a folder name for the current remote directory.
          </Dialog.Description>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Folder Name
            </Text>
            <TextField.Root
              autoFocus
              onChange={(event) => setFolderName(event.target.value)}
              placeholder="new-folder"
              value={folderName}
            />
          </label>

          <Flex gap="3" mt="5" justify="end">
            <Dialog.Close>
              <Button color="gray" disabled={isSubmitting} variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button disabled={!trimmedName || isSubmitting} type="submit">
              Create
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
