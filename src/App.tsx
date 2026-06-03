import { Box, Card, Flex } from "@radix-ui/themes";
import "./App.css";
import { SessionBox } from "./components/session/SessionBox";
function App() {


  return (
    <main className="w-full h-full">
      <Flex gap="2" className="w-full h-screen box-border p-2" align="center" justify="start">
        <Box width="400px" height="100%">
            <SessionBox />
        </Box>
        <Box width="100%" height="100%">
          <Card className="w-full h-full">
          </Card>
        </Box>
      </Flex>
    </main>
  );
}

export default App;
