import { useState } from "react";
import { SystemProgram, type PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { pdaDao, pdaVoter, pdaAnalytics, pdaVoteRecord } from "../pda";
import type { VoteTypeLabel } from "../types";

interface Props {
    proposalPubkey: PublicKey;
    quadraticEnabled: boolean;
    onVoted?: () => void;
}

const VOTE_TYPES: VoteTypeLabel[] = ["Yes", "No", "Abstain"];

function toAnchorVoteType(v: VoteTypeLabel) {
    return v === "Yes"
        ? { yes: {} }
        : v === "No"
          ? { no: {} }
          : { abstain: {} };
}

export function Vote({
    proposalPubkey,
    quadraticEnabled,
    onVoted,
}: Props) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();

    const [selected, setSelected] = useState<VoteTypeLabel>("Yes");
    const [voteAmount, setVoteAmt] = useState("1");

    const castVote = async (quadratic = false) => {
        if (!program || !publicKey) return;

        const [daoPda] = pdaDao();
        const [voterPda] = pdaVoter(publicKey);
        const [analyticsPda] = pdaAnalytics(proposalPubkey);
        const [voteRecordPda] = pdaVoteRecord(proposalPubkey, voterPda);

        await execute(async () => {
            const baseAccounts = {
                authority: publicKey,
                dao: daoPda,
                proposal: proposalPubkey,
                analytics: analyticsPda,
                voter: voterPda,
                voteRecord: voteRecordPda,
                systemProgram: SystemProgram.programId,
            };

            if (quadratic) {
                return (program.methods as any)
                    .castQuadraticVote(
                        toAnchorVoteType(selected),
                        new BN(voteAmount),
                    )
                    .accounts(baseAccounts)
                    .rpc();
            }
            return (program.methods as any)
                .castVote(toAnchorVoteType(selected))
                .accounts(baseAccounts)
                .rpc();
        });

        onVoted?.();
    };

    const retractVote = async () => {
        if (!program || !publicKey) return;

        const [daoPda] = pdaDao();
        const [voterPda] = pdaVoter(publicKey);
        const [analyticsPda] = pdaAnalytics(proposalPubkey);
        const [voteRecordPda] = pdaVoteRecord(proposalPubkey, voterPda);

        await execute(async () => {
            return (program.methods as any)
                .retractVote()
                .accounts({
                    authority: publicKey,
                    dao: daoPda,
                    proposal: proposalPubkey,
                    analytics: analyticsPda,
                    voter: voterPda,
                    voteRecord: voteRecordPda,
                })
                .rpc();
        });

        onVoted?.();
    };

    const busy = txState.status === "sending" || txState.status === "confirming";
    const quadCost = Math.pow(Number(voteAmount), 2);

    return (
        <div className="glass-card p-8 border-[#aa3bff]/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-[#aa3bff]">⚡</span> Cast Your Vote
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-8">
                {VOTE_TYPES.map((v) => (
                    <button
                        key={v}
                        className={`py-4 rounded-2xl border-2 transition-all font-bold ${
                            selected === v
                                ? v === "Yes" ? "bg-green-500/20 border-green-500 text-green-400" :
                                  v === "No" ? "bg-red-500/20 border-red-500 text-red-400" :
                                  "bg-gray-500/20 border-gray-500 text-gray-300"
                                : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"
                        }`}
                        onClick={() => setSelected(v)}
                    >
                        {v}
                    </button>
                ))}
            </div>

            {quadraticEnabled && (
                <div className="mb-8 space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Weight (n)</label>
                        <span className="text-xs text-[#aa3bff] font-mono">Cost: {quadCost} units</span>
                    </div>
                    <input
                        type="number"
                        value={voteAmount}
                        onChange={(e) => setVoteAmt(e.target.value)}
                        min="1"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#aa3bff] transition-colors"
                    />
                    <p className="text-[10px] text-gray-600 italic">
                        Quadratic voting: Your voting power is √Cost. Staking more tokens increases your influence exponentially.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                <button 
                    onClick={() => castVote(quadraticEnabled)} 
                    disabled={busy}
                    className="w-full py-4 bg-gradient-to-r from-[#aa3bff] to-[#6020ff] hover:from-[#b555ff] hover:to-[#7030ff] text-white font-bold rounded-2xl shadow-lg shadow-[#aa3bff]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {busy ? "Broadcasting to LaserStream…" : `Confirm ${selected} Vote`}
                </button>
                
                <button
                    onClick={retractVote}
                    disabled={busy}
                    className="w-full py-3 text-gray-500 hover:text-red-400 text-sm font-bold transition-colors"
                >
                    Retract Existing Vote
                </button>
            </div>

            {txState.error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center">
                    {txState.error}
                </div>
            )}
            
            {txState.status === "success" && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 text-center animate-in zoom-in-95">
                    ✓ Vote confirmed in sub-100ms. 
                    {txState.explorerUrl && (
                        <a href={txState.explorerUrl} target="_blank" rel="noreferrer" className="underline ml-2">Explorer</a>
                    )}
                </div>
            )}
        </div>
    );
}
