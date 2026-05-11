import { useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { pdaDao, pdaTreasury, pdaVault } from "../pda";

interface Props {
    destinationTokenAccount: any; // ATA where tokens will be sent
}

export function WithdrawTokens({ destinationTokenAccount }: Props) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();
    const [amount, setAmount] = useState("");

    const handleWithdraw = async () => {
        if (!program || !publicKey || !amount || !destinationTokenAccount) return;

        const [daoPda] = pdaDao();
        const [treasuryPda] = pdaTreasury();
        const [vaultPda] = pdaVault();

        await execute(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (program.methods as any)
                .withdrawTokens(new BN(amount))
                .accounts({
                    authority: publicKey,
                    dao: daoPda,
                    treasury: treasuryPda,
                    vault: vaultPda,
                    destinationTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();
        });
    };

    const busy = txState.status === "sending" || txState.status === "confirming";

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                💰 Withdraw Tokens
            </h3>
            <p className="text-sm text-gray-400 mb-6">
                Admin: Withdraw governance tokens from the DAO vault.
            </p>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Amount (Raw)</label>
                    <input
                        type="number"
                        placeholder="e.g. 1000000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#aa3bff]/50 transition-all"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleWithdraw}
                    disabled={busy || !destinationTokenAccount}
                    className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-semibold transition-all disabled:opacity-50"
                >
                    {busy ? "Processing…" : "Withdraw Tokens"}
                </button>
            </div>
            {txState.error && (
                <p className="mt-4 text-xs text-red-400">⚠️ {txState.error}</p>
            )}
        </div>
    );
}
