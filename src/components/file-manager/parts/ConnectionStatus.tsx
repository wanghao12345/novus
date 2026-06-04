import { Flex, Text } from "@radix-ui/themes";

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <Flex align="center" gap="2">
      <span
        aria-hidden
        className={["h-2 w-2 rounded-full", isConnected ? "bg-[var(--green-9)]" : "bg-[var(--gray-8)]"].join(" ")}
      />
      <Text color="gray" size="2">
        {isConnected ? "Connected" : "Offline"}
      </Text>
    </Flex>
  );
}
