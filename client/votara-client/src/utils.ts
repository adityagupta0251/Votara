import { type Connection, type TransactionSignature } from "@solana/web3.js";
import { COMMITMENT, EXPLORER_BASE } from "./constants/constant";

/** Wait for a tx to be confirmed, return the signature. */
export async function confirmTx(
    connection: Connection,
    sig: TransactionSignature,
): Promise<TransactionSignature> {
    const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
    await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        COMMITMENT,
    );
    return sig;
}

/** Format a BN / bigint as a token amount string (divides by 10^decimals). */
export function formatTokens(raw: bigint | number, decimals = 6): string {
    const n = Number(raw) / 10 ** decimals;
    return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

/** Format lamports → SOL string. */
export function formatSol(lamports: bigint | number): string {
    return (
        (Number(lamports) / 1e9).toLocaleString("en-US", {
            maximumFractionDigits: 4,
        }) + " SOL"
    );
}

/** Shorten a public key for display. */
export function shortenKey(pk: { toString(): string }, chars = 4): string {
    const s = pk.toString();
    return `${s.slice(0, chars)}…${s.slice(-chars)}`;
}

/** Build Solana Explorer link for a signature. */
export function explorerTx(sig: string): string {
    return `${EXPLORER_BASE}/tx/${sig}`;
}

/** Build Solana Explorer link for an account. */
export function explorerAccount(pk: string): string {
    return `${EXPLORER_BASE}/account/${pk}`;
}

/** Extract a human-readable message from an Anchor/Solana error. */
export function extractError(err: unknown): string {
    if (!err) return "Unknown error";
    if (typeof err === "string") return err;
    const e = err as { message?: string; logs?: string[] };
    const logs = e.logs?.join("\n") ?? "";
    // Parse custom program error from logs
    const match = logs.match(/Error Message: (.+)/);
    if (match) return match[1];
    return e.message ?? "Transaction failed";
}
