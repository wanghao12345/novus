
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'


import ISession from '../models/session.model'

interface SessionStore {
    session: ISession[];
    selectedSessionId?: string;
}

const useSessionStore = create<SessionStore>()(
    devtools(persist(immer((set, get) => ({
        session: [],
        selectedSessionId: undefined,
    })),
        {
            name: 'sftp-sessions',
            partialize: (state) => ({
                session: state.session,
                selectedSessionId: state.selectedSessionId,
            }),
        }), {
        name: 'session-store',
    })
);

export default useSessionStore;