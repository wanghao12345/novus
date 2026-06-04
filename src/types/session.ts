export interface Session {
  connectionId?: string;
  id: string;
  sessionName: string;
  host: string;
  password: string;
  port: number;
  username: string;
  status: "connected" | "disconnected";
}

export interface SessionFormData {
  sessionName: string;
  host: string;
  password: string;
  port: number;
  username: string;
}
