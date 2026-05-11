import { useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { pdaDao, pdaProposal, pdaAnalytics, pdaTreasury, pdaVoter, pdaConfig } from "../pda";
import { SystemProgram } from "@solana/web3.js";
import { type ProposalTypeLabel } from "../types";

const PROPOSAL_TYPES: ProposalTypeLabel[] = ["General", "Treasury", "Governance", "Upgrade", "Emergency"];

function toAnchorProposalType(t: ProposalTypeLabel) {
    const key = t.toLowerCase();
    return { [key]: {} };
}

export function CreateProposal({ nextProposalId }: { nextProposalId: number }) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [type, setType] = useState<ProposalTypeLabel>("General");
    const [treasuryAmount, setTreasuryAmount] = useState("0");
    const [minTokens, setMinimumTokens] = useState("0");
    const [quadraticEnabled, setQuadraticEnabled] = useState(false);
    const [tokenGated, setTokenGated] = useState(false);

    const create = async () => {
        if (!program || !publicKey) return;

        const proposalId = new BN(nextProposalId);
        const [daoPda] = pdaDao();
        const [configPda] = pdaConfig();
        const [treasuryPda] = pdaTreasury();
        const [voterPda] = pdaVoter(publicKey);
        const [proposalPda] = pdaProposal(proposalId);
        const [analyticsPda] = pdaAnalytics(proposalPda);

        await execute(async () => {
            return (program.methods as any)
                .createProposal(
                    proposalId,
                    title,
                    desc,
                    toAnchorProposalType(type),
                    new BN(treasuryAmount),
                    quadraticEnabled,
                    tokenGated,
                    new BN(minTokens)
                )
                .accounts({
                    creator: publicKey,
                    dao: daoPda,
                    config: configPda,
                    treasury: treasuryPda,
                    voter: voterPda,
                    proposal: proposalPda,
                    analytics: analyticsPda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
        });
    };

    const busy = txState.status === "sending" || txState.status === "confirming";

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Proposal Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Implement Quadratic Funding for Ecosystem"
                            className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-700 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Categorization</label>
                        <div className="flex flex-wrap gap-2">
                            {PROPOSAL_TYPES.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setType(t)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                                        type === t
                                            ? "bg-white text-black border-white"
                                            : "bg-slate-950 text-slate-500 border-slate-900 hover:border-slate-700"
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Treasury Amount (if applicable)</label>
                            <input
                                type="number"
                                value={treasuryAmount}
                                onChange={(e) => setTreasuryAmount(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-700 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Min Tokens Required</label>
                            <input
                                type="number"
                                value={minTokens}
                                onChange={(e) => setMinimumTokens(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-700 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={quadraticEnabled}
                                onChange={e => setQuadraticEnabled(e.target.checked)}
                                className="hidden"
                            />
                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${quadraticEnabled ? "bg-white border-white" : "border-slate-700 group-hover:border-slate-500"}`}>
                                {quadraticEnabled && <div className="w-2 h-2 bg-black rounded-sm" />}
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quadratic</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={tokenGated}
                                onChange={e => setTokenGated(e.target.checked)}
                                className="hidden"
                            />
                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${tokenGated ? "bg-white border-white" : "border-slate-700 group-hover:border-slate-500"}`}>
                                {tokenGated && <div className="w-2 h-2 bg-black rounded-sm" />}
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Token Gated</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Executive Summary</label>
                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Provide a detailed description of the proposed changes..."
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-700 transition-all resize-none"
                />
            </div>

            <button 
                onClick={create}
                disabled={busy || !title || !desc}
                className="w-full premium-btn btn-slate py-4 font-black uppercase tracking-widest text-[10px]"
            >
                {busy ? "Submitting to Ledger..." : "Broadcast Proposal"}
            </button>

            {txState.error && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-xs text-red-400 font-bold">
                    {txState.error}
                </div>
            )}
        </div>
    );
}
