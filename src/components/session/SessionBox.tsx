import { Card } from "@radix-ui/themes";
import { SessionItem } from "./SessionItem";
import { SessionHeader } from "./SessionHeader";


export function SessionBox() {
  return (
    <Card className="w-full h-full">
      <SessionHeader />
      <SessionItem />
    </Card>
  );
}