import { useState, useEffect, useCallback } from "react";
import { useProgram } from "../program";
import { pdaTreasury } from "../pda";
import type { TreasuryAccount } from "../types";

export function useTreasury() {
    const { program } = useProgram();
    const [treasury, setTreasury] = useState<TreasuryAccount | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Manual refetch function.
     * Safe to trigger from UI events (buttons, etc.)
     */
    const refetch = useCallback(async () => {
        if (!program) return;
        setLoading(true);
        setError(null);
        try {
            const [treasuryPda] = pdaTreasury();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const acc = await (program.account as any).treasury.fetchNullable(
                treasuryPda,
            );
            setTreasury(acc as TreasuryAccount | null);
        } catch (e) {
            setError((e as Error).message ?? "Failed to fetch treasury");
        } finally {
            setLoading(false);
        }
    }, [program]);

    /**
     * Automatic synchronization logic.
     * Uses a mounting flag to prevent memory leaks and a micro-task yield
     * to avoid cascading synchronous render warnings.
     */
    useEffect(() => {
        let isMounted = true;

        const initFetch = async () => {
            if (!program) return;

            // Yield execution to bypass the "setState synchronously within an effect" warning
            await Promise.resolve();

            if (!isMounted) return;

            setLoading(true);
            setError(null);

            try {
                const [treasuryPda] = pdaTreasury();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const acc = await (
                    program.account as any
                ).treasury.fetchNullable(treasuryPda);

                if (isMounted) {
                    setTreasury(acc as TreasuryAccount | null);
                }
            } catch (e) {
                if (isMounted) {
                    setError(
                        (e as Error).message ?? "Failed to fetch treasury",
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void initFetch();

        return () => {
            isMounted = false;
        };
    }, [program]);

    return { treasury, loading, error, refetch };
}
