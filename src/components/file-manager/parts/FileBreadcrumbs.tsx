import { type ReactNode } from "react";
import { Flex, Text } from "@radix-ui/themes";
import { ArchiveIcon, HomeIcon } from "@radix-ui/react-icons";
import type { FileTab } from "../../../types/file-manager";

interface FileBreadcrumbsProps {
  activeTab: FileTab;
  sessionName: string;
}

export function FileBreadcrumbs({ activeTab, sessionName }: FileBreadcrumbsProps) {
  return (
    <Flex className="shrink-0 border-b border-[color:var(--gray-a5)] px-3 py-2" align="center" gap="2">
      <BreadcrumbPill icon={<HomeIcon />} label={`Home - ${sessionName}`} />
      {activeTab.path.includes("new-folder") ? (
        <BreadcrumbPill icon={<ArchiveIcon />} label={`new-folder - ${sessionName}`} />
      ) : null}
    </Flex>
  );
}

function BreadcrumbPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Flex
      className="h-9 max-w-[260px] rounded-md border border-[color:var(--gray-a5)] bg-[var(--gray-a2)] px-3"
      align="center"
      gap="2"
    >
      {icon}
      <Text className="truncate" color="gray" size="2" weight="bold">
        {label}
      </Text>
    </Flex>
  );
}
