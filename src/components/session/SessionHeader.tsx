import { Avatar, Button } from "@radix-ui/themes";
import { PlusIcon } from '@radix-ui/react-icons'

export function SessionHeader() {
  return (
    <div className="w-full mb-2 flex items-center justify-between">
      <Avatar fallback="N" size="2" variant="solid" color="crimson"  />
      
      <PlusIcon className="w-4 h-4 cursor-pointer" />
    </div>
  );
}