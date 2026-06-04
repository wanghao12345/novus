import { type ReactNode, useEffect, useState } from "react";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import type { SessionFormData } from "../../types/session";

interface SessionDialogProps {
  children: ReactNode;
  initialValues?: SessionFormData;
  mode: "create" | "edit";
  onSubmit: (session: SessionFormData) => void;
}

const defaultValues: SessionFormData = {
  sessionName: "",
  host: "",
  password: "",
  port: 22,
  username: "",
};

export function SessionDialog({ children, initialValues, mode, onSubmit }: SessionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionFormData>({ defaultValues: initialValues ?? defaultValues });

  useEffect(() => {
    reset(initialValues ?? defaultValues);
  }, [initialValues, isOpen, reset]);

  const handleFormSubmit: SubmitHandler<SessionFormData> = (data) => {
    onSubmit({
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
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Dialog.Title>{mode === "create" ? "Create Session" : "Edit Session"}</Dialog.Title>
          <Dialog.Description color="gray" size="2" mb="4">
            {mode === "create" ? "Save a server profile for browsing remote files." : "Update this server profile."}
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
              <FieldError message={errors.sessionName?.message} />
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
              <FieldError message={errors.host?.message} />
            </label>

            <Flex gap="3">
              <label className="flex-1">
                <Text as="div" size="2" mb="1" weight="bold">
                  Username
                </Text>
                <Controller
                  control={control}
                  name="username"
                  rules={{ required: "Please enter a username." }}
                  render={({ field }) => <TextField.Root {...field} placeholder="root" />}
                />
                <FieldError message={errors.username?.message} />
              </label>

              <label className="w-[112px]">
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
                <FieldError message={errors.port?.message} />
              </label>
            </Flex>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Password
              </Text>
              <Controller
                control={control}
                name="password"
                rules={{ required: "Please enter a password." }}
                render={({ field }) => <TextField.Root {...field} placeholder="Enter password" type="password" />}
              />
              <FieldError message={errors.password?.message} />
            </label>
          </Flex>

          <Flex gap="3" mt="5" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit">{mode === "create" ? "Create" : "Save"}</Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <Text color="red" size="1">
      {message}
    </Text>
  );
}
