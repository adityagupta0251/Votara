import { useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { useVoter } from "../hooks/useVoter";
import { useTreasury } from "../hooks/useTresury";
import { pdaDao, pdaTreasury, pdaVault, pdaGovMint, pdaVoter } from "../pda";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";

export function BuyTokens({ buyerTokenAccount }: { buyerTokenAccount: PublicKey | null }) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();
    const { exists: voterExists } = useVoter();
    const { treasury } = useTreasury();

    const [amount, setAmount] = useState("1");

    const buy = async () => {
        if (!program || !publicKey || !buyerTokenAccount) return;

        if (!treasury) {
            throw new Error("DAO Treasury is not initialized.");
        }

        if (!voterExists) {
            throw new Error("You must register as a voter before purchasing tokens.");
        }

        const [daoPda] = pdaDao();
        const [treasuryPda] = pdaTreasury();
        const [vaultPda] = pdaVault();
        const [mintPda] = pdaGovMint();
        const [voterPda] = pdaVoter(publicKey);

        await execute(async () => {
            return (program.methods as any)
                .buyTokens(new BN(amount))
                .accounts({
                    buyer: publicKey,
                    dao: daoPda,
                    treasury: treasuryPda,
                    voter: voterPda,
                    governanceTokenMint: mintPda,
                    vault: vaultPda,
                    buyerTokenAccount: buyerTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
        });
    };

    const busy = txState.status === "sending" || txState.status === "confirming";

    return (
        <div className="premium-card p-10 border-slate-800/50 space-y-6">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Aquire Governance Units</h3>
            <p className="text-xs text-slate-500">Purchase VTR tokens directly from the DAO treasury using SOL.</p>

            <div className="space-y-4">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-700 transition-all"
                    placeholder="Amount of SOL"
                />

                <button 
                    onClick={buy}
                    disabled={busy || !buyerTokenAccount || !treasury || !voterExists}
                    className="w-full premium-btn btn-slate py-4 font-black uppercase tracking-widest text-[10px]"
                >
                    {busy ? "Broadcasting..." : !treasury ? "Treasury Locked" : !voterExists ? "Register to Buy" : "Swap SOL for VTR"}
                </button>
            </div>

            {txState.error && (
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px] text-red-400 font-bold">
                    {txState.error}
                </div>
            )}
        </div>
    );
}
