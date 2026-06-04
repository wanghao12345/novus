export interface Session {
  id: string;
  sessionName: string;
  host: string;
  port: number;
  username: string;
  status: "connected" | "disconnected";
}

export interface SessionFormData {
  sessionName: string;
  host: string;
  port: number;
  username: string;
}
