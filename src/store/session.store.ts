import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { initialSessions } from "../data/sessions";
import type { Session, SessionFormData } from "../types/session";

interface SessionStore {
  sessions: Session[];
  selectedSessionId: string;
  createSession: (session: SessionFormData) => Session;
  deleteSession: (sessionId: string) => void;
  disconnectAllSessions: () => void;
  markConnectionDead: (connectionId: string) => void;
  selectSession: (sessionId: string) => void;
  setConnectionState: (sessionId: string, status: Session["status"], connectionId?: string) => void;
  updateSession: (sessionId: string, session: SessionFormData) => void;
}

const useSessionStore = create<SessionStore>()(
  devtools(
    persist(
      (set, get) => ({
        sessions: initialSessions,
        selectedSessionId: initialSessions[0]?.id ?? "",

        createSession: (session) => {
          const createdSession: Session = {
            ...session,
            id: crypto.randomUUID(),
            status: "disconnected",
          };

          set((state) => ({
            selectedSessionId: createdSession.id,
            sessions: [createdSession, ...state.sessions],
          }));

          return createdSession;
        },

        deleteSession: (sessionId) => {
          const nextSessions = get().sessions.filter((session) => session.id !== sessionId);
          const selectedSessionId =
            get().selectedSessionId === sessionId ? nextSessions[0]?.id ?? "" : get().selectedSessionId;

          set({
            selectedSessionId,
            sessions: nextSessions,
          });
        },

        disconnectAllSessions: () => {
          set((state) => ({
            sessions: normalizeSessions(state.sessions),
          }));
        },

        markConnectionDead: (connectionId) => {
          set((state) => ({
            sessions: state.sessions.map((session) =>
              session.connectionId === connectionId
                ? {
                    ...session,
                    connectionId: undefined,
                    status: "disconnected",
                  }
                : session,
            ),
          }));
        },

        selectSession: (sessionId) => {
          set({ selectedSessionId: sessionId });
        },

        setConnectionState: (sessionId, status, connectionId) => {
          set((state) => ({
            sessions: state.sessions.map((session) =>
              session.id === sessionId
                ? {
                    ...session,
                    connectionId: status === "connected" ? connectionId : undefined,
                    status,
                  }
                : session,
            ),
          }));
        },

        updateSession: (sessionId, formData) => {
          set((state) => ({
            sessions: state.sessions.map((session) =>
              session.id === sessionId
                ? {
                    ...session,
                    ...formData,
                  }
                : session,
            ),
          }));
        },
      }),
      {
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<SessionStore> | undefined;

          return {
            ...currentState,
            ...persisted,
            sessions: persisted?.sessions ?? currentState.sessions,
          };
        },
        name: "sftp-sessions",
        partialize: (state) => ({
          selectedSessionId: state.selectedSessionId,
          sessions: normalizeSessions(state.sessions),
        }),
      },
    ),
    {
      name: "session-store",
    },
  ),
);

export default useSessionStore;

function normalizeSessions(sessions: Session[]) {
  return sessions.map((session) =>
    ({
      ...session,
      connectionId: undefined,
      status: "disconnected" as const,
    }),
  );
}
