import { useMemo } from "react";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useWallet } from "../wallet";
import { pdaGovMint } from "../pda";

export function useTokenAccount() {
    const { publicKey } = useWallet();
    const [mint] = pdaGovMint();

    return useMemo(() => {
        if (!publicKey) return null;
        try {
            return getAssociatedTokenAddressSync(mint, publicKey);
        } catch (e) {
            console.error("Failed to derive ATA:", e);
            return null;
        }
    }, [publicKey, mint]);
}
