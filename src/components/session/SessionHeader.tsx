import { Avatar, Button } from "@radix-ui/themes";
import { PlusIcon } from '@radix-ui/react-icons'
import { SessionCreate } from "./SessionCreate";

export function SessionHeader() {
  return (
    <div className="w-full mb-4 flex items-center justify-between">
      <Avatar fallback="N" size="2" variant="solid" color="crimson"  />
      <SessionCreate>
        <PlusIcon className="w-4 h-4 cursor-pointer" />
      </SessionCreate>
    </div>
  );
}