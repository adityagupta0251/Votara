/**
 * Provides a shared @solana/web3.js Connection throughout the app.
 * Drop in any RPC endpoint — Triton, QuickNode, Alchemy, devnet, etc.
 * No vendor lock-in; just set VITE_RPC_ENDPOINT in your .env.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Connection } from "@solana/web3.js";
import {
    RPC_ENDPOINT,
    WS_ENDPOINT,
    COMMITMENT,
} from "../src/constants/constant";

interface ConnectionCtxValue {
    connection: Connection;
}

const ConnectionCtx = createContext<ConnectionCtxValue | null>(null);

export function ConnectionProvider({ children }: { children: ReactNode }) {
    const connection = useMemo(
        () =>
            new Connection(RPC_ENDPOINT, {
                commitment: COMMITMENT,
                wsEndpoint: WS_ENDPOINT,
                confirmTransactionInitialTimeout: 60_000,
                disableRetryOnRateLimit: false,
            }),
        [],
    );

    return (
        <ConnectionCtx.Provider value={{ connection }}>
            {children}
        </ConnectionCtx.Provider>
    );
}

export function useConnection(): Connection {
    const ctx = useContext(ConnectionCtx);
    if (!ctx)
        throw new Error("useConnection must be inside <ConnectionProvider>");
    return ctx.connection;
}
