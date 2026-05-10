import { useState, useCallback } from "react";
import { useConnection } from "../connection";
import { confirmTx, extractError, explorerTx } from "../utils";

export type TxStatus = "idle" | "pending" | "confirming" | "success" | "error";

export interface TxState {
    status: TxStatus;
    signature: string | null;
    explorerUrl: string | null;
    error: string | null;
}

const INITIAL: TxState = {
    status: "idle",
    signature: null,
    explorerUrl: null,
    error: null,
};

export function useTransaction() {
    const connection = useConnection();
    const [txState, setTx] = useState<TxState>(INITIAL);

    const execute = useCallback(
        async (fn: () => Promise<string>): Promise<string | null> => {
            setTx({ ...INITIAL, status: "pending" });
            try {
                const sig = await fn();
                setTx((prev) => ({
                    ...prev,
                    status: "confirming",
                    signature: sig,
                }));
                await confirmTx(connection, sig);
                setTx({
                    status: "success",
                    signature: sig,
                    explorerUrl: explorerTx(sig),
                    error: null,
                });
                return sig;
            } catch (err) {
                setTx({
                    status: "error",
                    signature: null,
                    explorerUrl: null,
                    error: extractError(err),
                });
                return null;
            }
        },
        [connection],
    );

    const reset = useCallback(() => setTx(INITIAL), []);

    return { execute, txState, reset };
}
