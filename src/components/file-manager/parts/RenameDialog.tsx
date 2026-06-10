import { type FormEvent, useEffect, useState } from "react";
import { Button, Dialog, Flex, TextField } from "@radix-ui/themes";
import type { FileEntry } from "@/types/file-manager";

interface RenameDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entry: FileEntry | null;
  onRename: (entry: FileEntry, newName: string) => Promise<void>;
}

export function RenameDialog({ isOpen, onOpenChange, entry, onRename }: RenameDialogProps) {
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = newName.trim();

  useEffect(() => {
    setNewName(entry?.name || "");
  }, [entry]);



  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedName || !entry) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onRename(entry, trimmedName);
      setNewName("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open && entry) {
      setNewName(entry.name);
    } else {
      setNewName("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Content maxWidth="420px">
        <form onSubmit={handleSubmit}>
          <Dialog.Title>Rename</Dialog.Title>
          <label>
            <TextField.Root
              autoFocus
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Enter new name"
              value={newName}
            />
          </label>

          <Flex gap="3" mt="5" justify="end">
            <Dialog.Close>
              <Button color="gray" disabled={isSubmitting} variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button disabled={!newName} type="submit">
              Rename
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}