import { useState, useEffect } from "react";
import { useConnection } from "../connection";
import { useWallet } from "../wallet";
import { formatTokens } from "../utils";
import { TOKEN_DECIMALS } from "../constants/constant";
import type { PublicKey } from "@solana/web3.js";

interface Props {
    tokenAccount: PublicKey | null;
}

export function TokenBalance({ tokenAccount }: Props) {
    const connection = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<string>("0");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!publicKey || !tokenAccount) {
            setBalance("0");
            return;
        }

        let isMounted = true;
        const fetchBalance = async () => {
            setLoading(true);
            try {
                const info = await connection.getTokenAccountBalance(tokenAccount);
                if (isMounted) {
                    setBalance(formatTokens(Number(info.value.amount), TOKEN_DECIMALS));
                }
            } catch (e) {
                console.error("Failed to fetch token balance:", e);
                if (isMounted) setBalance("0");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchBalance();
        return () => { isMounted = false; };
    }, [connection, publicKey, tokenAccount]);

    if (!publicKey) return null;

    return (
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 mt-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Balance</span>
            <span className="text-xs font-black text-white">
                {loading ? "..." : balance} $VOTARA
            </span>
        </div>
    );
}
