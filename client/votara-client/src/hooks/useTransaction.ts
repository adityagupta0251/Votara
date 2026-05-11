import { useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useState } from "react";
import {
    type TransactionSignature,
} from "@solana/web3.js";
import { getExplorerUrl } from "../constants/constant";

export type TxState = {
    status: "idle" | "sending" | "confirming" | "success" | "error";
    error: string | null;
    signature: string | null;
    explorerUrl: string | null;
};

/**
 * Institutional-grade transaction monitor.
 * Provides real-time feedback on block inclusion and finality.
 */
export function useTransaction() {
    const { connection } = useConnection();
    const [txState, setTxState] = useState<TxState>({
        status: "idle",
        error: null,
        signature: null,
        explorerUrl: null
    });

    const execute = useCallback(async (fn: () => Promise<TransactionSignature>) => {
        setTxState({ status: "sending", error: null, signature: null, explorerUrl: null });
        try {
            const signature = await fn();
            setTxState(prev => ({ ...prev, status: "confirming", signature }));

            const latestBlockhash = await connection.getLatestBlockhash();
            const result = await connection.confirmTransaction({
                signature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            }, "confirmed");

            if (result.value.err) {
                setTxState(prev => ({
                    ...prev,
                    status: "error",
                    error: result.value.err?.toString() || "Transaction failed",
                    explorerUrl: getExplorerUrl(signature)
                }));
                return false;
            }

            setTxState(prev => ({
                ...prev,
                status: "success",
                explorerUrl: getExplorerUrl(signature)
            }));
            return true;
        } catch (e: any) {
            console.error("Transaction failed", e);
            setTxState(prev => ({
                ...prev,
                status: "error",
                error: e.message || "An unexpected error occurred",
                signature: e.signature || null,
                explorerUrl: e.signature ? getExplorerUrl(e.signature) : null
            }));
            return false;
        } finally {
            setTimeout(() => {
                setTxState(prev => prev.status === "success" || prev.status === "error"
                    ? prev
                    : { status: "idle", error: null, signature: null, explorerUrl: null });
            }, 5000);
        }
    }, [connection]);

    const confirmTransaction = useCallback(async (signature: TransactionSignature) => {
        if (!connection) return false;

        const latestBlockhash = await connection.getLatestBlockhash();

        try {
            const result = await connection.confirmTransaction({
                signature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            });

            return !result.value.err;
        } catch (e) {
            console.error("Transaction confirmation failed", e);
            return false;
        }
    }, [connection]);

    return { execute, txState, confirmTransaction };
}
