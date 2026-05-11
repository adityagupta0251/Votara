import { useState, useEffect, useCallback } from "react";
import { useProgram } from "../program";
import { pdaDao } from "../pda";
import type { DaoAccount } from "../types";

export function useDao() {
    const { program } = useProgram();
    const [dao, setDao] = useState<DaoAccount | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Manual refetch function (Safe to call synchronously from button clicks)
    const refetch = useCallback(async () => {
        if (!program) return;
        setLoading(true);
        setError(null);
        try {
            const [daoPda] = pdaDao();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const acc = await (program.account as any).dao.fetchNullable(daoPda);
            console.log("[useDao] Manual fetch result:", acc ? "Account found" : "Account null");
            setDao(acc as DaoAccount | null);
        } catch (e) {
            console.error("[useDao] Manual fetch error:", e);
            setError((e as Error).message ?? "Failed to fetch DAO");
        } finally {
            setLoading(false);
        }
    }, [program]);

    // 2. Automatic fetch on mount or when `program` changes
    useEffect(() => {
        let isMounted = true; // Prevents state updates if the component unmounts

        const loadDao = async () => {
            if (!program) return;

            // FIX: Yield execution to the next microtask.
            // This allows the useEffect body to finish executing before any state changes occur,
            // completely bypassing the "synchronous setState" cascading render warning.
            await Promise.resolve();

            if (!isMounted) return;

            setLoading(true);
            setError(null);

            try {
                const [daoPda] = pdaDao();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const acc = await (program.account as any).dao.fetchNullable(daoPda);
                console.log("[useDao] Auto fetch result:", acc ? "Account found" : "Account null");
                if (isMounted) setDao(acc as DaoAccount | null);
            } catch (e) {
                console.error("[useDao] Auto fetch error:", e);
                if (isMounted)
                    setError((e as Error).message ?? "Failed to fetch DAO");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void loadDao();

        return () => {
            isMounted = false; // Cleanup function
        };
    }, [program]);

    return { dao, loading, error, refetch };
}
