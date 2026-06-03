import { Button, Dialog, Flex, TextField, Text } from "@radix-ui/themes";
import { ReactNode } from "react";

interface SessionCreateProps {
    children: ReactNode;
}

export function SessionCreate({ children }: SessionCreateProps) {
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                {children}
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Create Session</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    Create a new session.
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Session Name
                        </Text>
                        <TextField.Root
                            defaultValue="Session Name 1"
                            placeholder="Enter session name"
                        />
                    </label>
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Host
                        </Text>
                        <TextField.Root
                            placeholder="192.168.1.100"
                        />
                    </label>
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Username
                        </Text>
                        <TextField.Root
                            defaultValue="root"
                            placeholder="root"
                        />
                    </label>
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Password
                        </Text>
                        <TextField.Root
                            placeholder="Enter password"
                        />
                    </label>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button>Save</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>

    );
}