import { Button, Dialog, Flex, TextField, Text } from "@radix-ui/themes";
import { SubmitHandler, useForm } from "react-hook-form";
import { ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";

interface SessionCreateProps {
    children: ReactNode;
}
interface SessionCreateFormData {
    sessionName: string;
    host: string;
    port: number;
    username: string;
    password: string;
}

export function SessionCreate({ children }: SessionCreateProps) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<SessionCreateFormData>();

    const onSubmit: SubmitHandler<SessionCreateFormData> = (data) => {
        console.log(data);
        invoke(
            "connect_sftp", 
            { 
                config: { 
                    ...data, 
                    session_name: data.sessionName, 
                    port: Number(data.port)
                } 
            }).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.log(err);
        });
        
    }
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                {children}
            </Dialog.Trigger>


            <Dialog.Content maxWidth="450px">
                <form onSubmit={handleSubmit(onSubmit)}>
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
                                {...register("sessionName", { required: true })}
                                defaultValue="Session Name 1"
                                placeholder="Enter session name"
                            />
                            {errors.sessionName && <Text className="text-red-500">Please enter a session name.</Text>}
                        </label>
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Host
                            </Text>
                            <TextField.Root
                                {...register("host", { required: true })}
                                placeholder="192.168.1.100"
                            />
                            {errors.host && <Text className="text-red-500">Please enter a host.</Text>}
                        </label>
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Port
                            </Text>
                            <TextField.Root
                                {...register("port", { required: true })}
                                defaultValue="22"
                                placeholder="22"
                                type="number"
                            />
                            {errors.port && <Text className="text-red-500">Please enter a port.</Text>}
                        </label>
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Username
                            </Text>
                            <TextField.Root
                                {...register("username", { required: true })}
                                defaultValue="root"
                                placeholder="root"
                            />
                            {errors.username && <Text className="text-red-500">Please enter a username.</Text>}
                        </label>
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Password
                            </Text>
                            <TextField.Root
                                {...register("password", { required: true })}
                                placeholder="Enter password"
                            />
                            {errors.password && <Text className="text-red-500">Please enter a password.</Text>}
                        </label>
                    </Flex>

                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray">
                                Cancel
                            </Button>
                        </Dialog.Close>
                        <Button type="submit">Save</Button>
                    </Flex>
                </form>
            </Dialog.Content>

        </Dialog.Root>

    );
}