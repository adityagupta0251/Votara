/**
 * Builds and memoizes a @coral-xyz/anchor Program<Votara> instance.
 * Re-creates only when the wallet public key or connection changes.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idlJson from "./idl/votara.json";
export type Votara = any;
import { COMMITMENT } from "../src/constants/constant";
import { useConnection } from "./connection";
import { useWallet } from "./wallet";
import type { Transaction, VersionedTransaction } from "@solana/web3.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProgramCtxValue {
    program: Program<Votara> | null;
    provider: AnchorProvider | null;
}

const ProgramCtx = createContext<ProgramCtxValue>({
    program: null,
    provider: null,
});

// ─── Adapter shim: bridge our minimal wallet → Anchor's wallet interface ──────

function makeAnchorWallet(wallet: {
    publicKey: import("@solana/web3.js").PublicKey | null;
    signTransaction: <T extends Transaction | VersionedTransaction>(
        tx: T,
    ) => Promise<T>;
    signAllTransactions: <T extends Transaction | VersionedTransaction>(
        txs: T[],
    ) => Promise<T[]>;
}) {
    if (!wallet.publicKey) return null;
    return {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
    };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProgramProvider({ children }: { children: ReactNode }) {
    const connection = useConnection();
    const wallet = useWallet();

    const { program, provider } = useMemo(() => {
        const anchorWallet = makeAnchorWallet(wallet);
        if (!anchorWallet) return { program: null, provider: null };

        const prov = new AnchorProvider(connection, anchorWallet, {
            commitment: COMMITMENT,
            preflightCommitment: COMMITMENT,
            skipPreflight: false,
        });

        const prog = new Program<Votara>(
            idlJson as any,
            prov,
        );

        return { program: prog, provider: prov };
    }, [connection, wallet.publicKey]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <ProgramCtx.Provider value={{ program, provider }}>
            {children}
        </ProgramCtx.Provider>
    );
}

export function useProgram(): ProgramCtxValue {
    return useContext(ProgramCtx);
}
