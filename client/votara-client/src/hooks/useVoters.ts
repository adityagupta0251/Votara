import { useState, useEffect, useCallback } from "react";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { pdaVoter } from "../pda";
import type { VoterAccount } from "../types";

export function useVoter() {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const [voter, setVoter] = useState<VoterAccount | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exists, setExists] = useState(false);

    const fetch = useCallback(async () => {
        if (!program || !publicKey) {
            setVoter(null);
            setExists(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [voterPda] = pdaVoter(publicKey);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const acc = await (program.account as any).voter.fetchNullable(
                voterPda,
            );
            if (acc) {
                setVoter(acc as VoterAccount);
                setExists(true);
            } else {
                setVoter(null);
                setExists(false);
            }
        } catch (e) {
            setError((e as Error).message ?? "Failed to fetch voter");
        } finally {
            setLoading(false);
        }
    }, [program, publicKey]);

    useEffect(() => {
        void fetch();
    }, [fetch]);

    return { voter, exists, loading, error, refetch: fetch };
}
