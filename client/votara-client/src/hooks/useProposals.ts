import { useState, useEffect, useCallback } from "react";
import { useProgram } from "../program";
import type { ProposalAccount, ProposalWithPubkey } from "../types";

export function useProposals() {
    const { program } = useProgram();
    const [proposals, setProposals] = useState<ProposalWithPubkey[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Manual refetch function for UI buttons.
     */
    const fetchProposals = useCallback(async () => {
        if (!program) return;
        setLoading(true);
        setError(null);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const accounts = await (program.account as any).proposal.all();
            setProposals(
                accounts.map((acc: any) => ({
                    pubkey: acc.publicKey,
                    account: acc.account as ProposalAccount,
                })),
            );
        } catch (e) {
            setError((e as Error).message ?? "Failed to fetch proposals");
        } finally {
            setLoading(false);
        }
    }, [program]);

    /**
     * Automatic synchronization on mount.
     */
    useEffect(() => {
        let isMounted = true;

        const initLoad = async () => {
            if (!program) return;

            // FIX: Yield to the next microtask to prevent synchronous
            // setState warnings during the initial render phase.
            await Promise.resolve();

            if (!isMounted) return;

            setLoading(true);
            setError(null);

            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const accounts = await (program.account as any).proposal.all();

                if (isMounted) {
                    setProposals(
                        accounts.map((acc: any) => ({
                            pubkey: acc.publicKey,
                            account: acc.account as ProposalAccount,
                        })),
                    );
                }
            } catch (e) {
                if (isMounted) {
                    setError(
                        (e as Error).message ?? "Failed to fetch proposals",
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void initLoad();

        return () => {
            isMounted = false;
        };
    }, [program]);

    return { proposals, loading, error, refetch: fetchProposals };
}
