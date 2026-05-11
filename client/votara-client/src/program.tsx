import { type ReactNode, useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idlJson from "./idl/votara.json";
export type Votara = any;
import { COMMITMENT } from "../src/constants/constant";
import { useConnection, useWallet } from "./wallet";
import { createContext, useContext } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProgramCtxValue {
    program: Program<Votara> | null;
    provider: AnchorProvider | null;
}

const ProgramCtx = createContext<ProgramCtxValue>({
    program: null,
    provider: null,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProgramProvider({ children }: { children: ReactNode }) {
    const { connection } = useConnection();
    const { publicKey, signTransaction, signAllTransactions } = useWallet();

    const { program, provider } = useMemo(() => {
        if (!publicKey || !signTransaction || !signAllTransactions) {
            return { program: null, provider: null };
        }

        const anchorWallet = {
            publicKey,
            signTransaction,
            signAllTransactions,
        };

        const prov = new AnchorProvider(connection, anchorWallet as any, {
            commitment: COMMITMENT,
            preflightCommitment: COMMITMENT,
            skipPreflight: false,
        });

        const prog = new Program<Votara>(
            idlJson as any,
            prov,
        );

        return { program: prog, provider: prov };
    }, [connection, publicKey, signTransaction, signAllTransactions]);

    return (
        <ProgramCtx.Provider value={{ program, provider }}>
            {children}
        </ProgramCtx.Provider>
    );
}

export function useProgram(): ProgramCtxValue {
    return useContext(ProgramCtx);
}
