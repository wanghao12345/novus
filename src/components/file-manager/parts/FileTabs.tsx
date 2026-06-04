import { type ReactNode } from "react";
import { Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { ArchiveIcon, Cross2Icon, HomeIcon } from "@radix-ui/react-icons";
import type { FileTab } from "../../../types/file-manager";

interface FileTabsProps {
  activeTabId: string;
  tabs: FileTab[];
  onCloseTab: (tabId: string) => void;
  onSelectTab: (tabId: string) => void;
}

export function FileTabs({ activeTabId, tabs, onCloseTab, onSelectTab }: FileTabsProps) {
  return (
    <Flex className="min-w-0" align="center" gap="2">
      {tabs.map((tab) => (
        <button
          className={[
            "flex h-10 max-w-[260px] cursor-pointer items-center gap-2 rounded-md border px-3 text-left transition-colors",
            tab.id === activeTabId
              ? "border-[color:var(--accent-a7)] bg-[var(--accent-a3)] text-[var(--gray-12)]"
              : "border-[color:var(--gray-a5)] bg-[var(--gray-a3)] text-[var(--gray-11)] hover:bg-[var(--gray-a4)]",
          ].join(" ")}
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          type="button"
        >
          <TabIcon path={tab.path} />
          <Text className="truncate" size="2" weight="bold">
            {tab.label}
          </Text>
        </button>
      ))}

      {tabs.length > 1 ? (
        <Tooltip content="Close current tab">
          <IconButton aria-label="Close current tab" onClick={() => onCloseTab(activeTabId)} size="2" variant="ghost">
            <Cross2Icon />
          </IconButton>
        </Tooltip>
      ) : null}
    </Flex>
  );
}

function TabIcon({ path }: { path: string }) {
  const icon: ReactNode = path.includes("new-folder") ? <ArchiveIcon /> : <HomeIcon />;
  return icon;
}
