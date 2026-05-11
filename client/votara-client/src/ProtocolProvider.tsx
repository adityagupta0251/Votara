import { createContext, useContext, type ReactNode } from "react";
import { useDao } from "./hooks/useDao";
import { useVoter } from "./hooks/useVoter";
import type { DaoAccount, VoterAccount } from "./types";

interface ProtocolState {
    dao: DaoAccount | null;
    voter: VoterAccount | null;
    voterExists: boolean;
    isInitialized: boolean;
    loading: boolean;
    refresh: () => Promise<void>;
}

const ProtocolCtx = createContext<ProtocolState | null>(null);

export function ProtocolProvider({ children }: { children: ReactNode }) {
    const { dao, loading: daoLoading, refetch: refetchDao } = useDao();
    const { voter, exists, loading: voterLoading, refetch: refetchVoter } = useVoter();

    // Protocol is initialized if DAO exists and the mint has been set (not default address)
    const isInitialized = !!dao && dao.governanceTokenMint.toBase58() !== "11111111111111111111111111111111";

    const refresh = async () => {
        await Promise.all([refetchDao(), refetchVoter()]);
    };

    return (
        <ProtocolCtx.Provider value={{
            dao,
            voter,
            voterExists: exists,
            isInitialized,
            loading: daoLoading || voterLoading,
            refresh
        }}>
            {children}
        </ProtocolCtx.Provider>
    );
}

export function useProtocol() {
    const ctx = useContext(ProtocolCtx);
    if (!ctx) throw new Error("useProtocol must be used within ProtocolProvider");
    return ctx;
}
