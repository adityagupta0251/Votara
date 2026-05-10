import { useState } from "react";
import { SystemProgram, type PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { pdaDao, pdaTreasury, pdaVoter, pdaGovMint, pdaVault } from "../pda";

import { Coins, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";

interface Props {
    buyerTokenAccount: PublicKey | null;
}

export function BuyTokens({ buyerTokenAccount }: Props) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();
    const [amount, setAmount] = useState("1000");

    const handleBuy = async () => {
        if (!program || !publicKey || !buyerTokenAccount) return;

        const [daoPda] = pdaDao();
        const [treasuryPda] = pdaTreasury();
        const [voterPda] = pdaVoter(publicKey);
        const [mintPda] = pdaGovMint();
        const [vaultPda] = pdaVault();

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
                    buyerTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
        });
    };

    const busy = txState.status === "pending" || txState.status === "confirming";

    return (
        <div className="premium-card p-8 border-slate-800/50 bg-slate-900/20 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-black">
                    <Coins className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">Acquire Governance Power</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Reserve participation tokens from vault</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 block">Purchase Quantity</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-slate w-full pl-10 py-3 text-lg font-black"
                            min="1"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-black text-xs">#</span>
                    </div>
                </div>

                <button 
                    onClick={handleBuy} 
                    disabled={busy || !buyerTokenAccount} 
                    className="premium-btn btn-slate w-full py-4 uppercase tracking-[0.2em] text-[10px] font-black group"
                >
                    {busy ? "Broadcasting..." : "Execute Purchase"}
                    {!busy && <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>

                {!buyerTokenAccount && (
                    <p className="text-[9px] text-amber-500/80 font-black uppercase text-center tracking-widest">
                        ⚠️ Please register as a voter first to create your token account
                    </p>
                )}

                {txState.error && (
                    <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-[9px] text-red-400 font-bold uppercase tracking-widest text-center">
                        {txState.error}
                    </div>
                )}
            </div>
        </div>
    );
}
