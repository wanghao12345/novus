import type { Session } from "../types/session";

export const initialSessions: Session[] = [
  {
    id: "secret-server",
    sessionName: "Secret Server",
    host: "159.89.169.100",
    password: "",
    port: 22,
    username: "root",
    status: "disconnected",
  },
  {
    id: "staging-node",
    sessionName: "Staging Node",
    host: "10.18.24.11",
    password: "",
    port: 22,
    username: "deploy",
    status: "disconnected",
  },
];
