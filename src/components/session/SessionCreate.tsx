import { type ReactNode, useState } from "react";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";

interface SessionCreateProps {
  children: ReactNode;
  onCreateSession: (session: SessionCreateFormData) => void;
}

export interface SessionCreateFormData {
  sessionName: string;
  host: string;
  port: number;
  username: string;
}

const defaultValues: SessionCreateFormData = {
  sessionName: "",
  host: "",
  port: 22,
  username: "",
};

export function SessionCreate({ children, onCreateSession }: SessionCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionCreateFormData>({ defaultValues });

  const onSubmit: SubmitHandler<SessionCreateFormData> = (data) => {
    onCreateSession({
      ...data,
      port: Number(data.port),
    });
    reset(defaultValues);
    setIsOpen(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger>{children}</Dialog.Trigger>

      <Dialog.Content maxWidth="440px">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Title>Create Session</Dialog.Title>
          <Dialog.Description color="gray" size="2" mb="4">
            Save a server profile for browsing remote files.
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Session Name
              </Text>
              <Controller
                control={control}
                name="sessionName"
                rules={{ required: "Please enter a session name." }}
                render={({ field }) => <TextField.Root {...field} placeholder="Production Server" />}
              />
              {errors.sessionName ? (
                <Text color="red" size="1">
                  {errors.sessionName.message}
                </Text>
              ) : null}
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Host
              </Text>
              <Controller
                control={control}
                name="host"
                rules={{ required: "Please enter a host." }}
                render={({ field }) => <TextField.Root {...field} placeholder="192.168.1.100" />}
              />
              {errors.host ? (
                <Text color="red" size="1">
                  {errors.host.message}
                </Text>
              ) : null}
            </label>

            <Flex gap="3">
              <BoxField className="flex-1">
                <Text as="div" size="2" mb="1" weight="bold">
                  Username
                </Text>
                <Controller
                  control={control}
                  name="username"
                  rules={{ required: "Please enter a username." }}
                  render={({ field }) => <TextField.Root {...field} placeholder="root" />}
                />
                {errors.username ? (
                  <Text color="red" size="1">
                    {errors.username.message}
                  </Text>
                ) : null}
              </BoxField>

              <BoxField className="w-[112px]">
                <Text as="div" size="2" mb="1" weight="bold">
                  Port
                </Text>
                <Controller
                  control={control}
                  name="port"
                  rules={{
                    min: { value: 1, message: "Invalid port." },
                    required: "Please enter a port.",
                  }}
                  render={({ field }) => (
                    <TextField.Root
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      type="number"
                    />
                  )}
                />
                {errors.port ? (
                  <Text color="red" size="1">
                    {errors.port.message}
                  </Text>
                ) : null}
              </BoxField>
            </Flex>
          </Flex>

          <Flex gap="3" mt="5" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit">Create</Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function BoxField({ children, className }: { children: ReactNode; className: string }) {
  return <label className={className}>{children}</label>;
}
