import { useState } from "react";
import { motion } from "framer-motion";
import { SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import {
    pdaDao,
    pdaConfig,
    pdaTreasury,
    pdaVoter,
    pdaProposal,
    pdaAnalytics,
} from "../pda";
import type { ProposalTypeLabel } from "../types";
import { FileText, Shield, Zap, Info, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";

const PROPOSAL_TYPES: ProposalTypeLabel[] = [
    "General",
    "Treasury",
    "Governance",
    "Upgrade",
    "Emergency",
];

function toAnchorProposalType(t: ProposalTypeLabel) {
    const map: Record<ProposalTypeLabel, object> = {
        General: { general: {} },
        Treasury: { treasury: {} },
        Governance: { governance: {} },
        Upgrade: { upgrade: {} },
        Emergency: { emergency: {} },
    };
    return map[t];
}

interface Props {
    nextProposalId: number;
    onCreated?: () => void;
}

export function CreateProposal({ nextProposalId, onCreated }: Props) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();

    const [title, setTitle] = useState("");
    const [description, setDesc] = useState("");
    const [pType, setPType] = useState<ProposalTypeLabel>("General");
    const [treasuryAmt, setTAmt] = useState("0");
    const [quadratic, setQuadratic] = useState(false);
    const [tokenGated, setTokenGated] = useState(false);
    const [minTokens, setMinTokens] = useState("0");

    const handleSubmit = async () => {
        if (!program || !publicKey || !title.trim()) return;

        const proposalId = BigInt(nextProposalId);
        const [daoPda] = pdaDao();
        const [configPda] = pdaConfig();
        const [treasuryPda] = pdaTreasury();
        const [voterPda] = pdaVoter(publicKey);
        const [proposalPda] = pdaProposal(proposalId);
        const [analyticsPda] = pdaAnalytics(proposalPda);

        await execute(async () => {
            return (program.methods as any)
                .createProposal(
                    new BN(proposalId.toString()),
                    title.trim(),
                    description.trim(),
                    toAnchorProposalType(pType),
                    new BN(treasuryAmt || "0"),
                    quadratic,
                    tokenGated,
                    new BN(minTokens || "0"),
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

        onCreated?.();
        setTitle("");
        setDesc("");
    };

    const busy = txState.status === "pending" || txState.status === "confirming";

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Core Details */}
                <div className="space-y-8">
                    <FormSection title="Core Content" icon={FileText}>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 block">Proposal Title</label>
                                <input
                                    className="input-slate w-full"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter institutional title..."
                                    maxLength={120}
                                />
                                <p className="mt-2 text-[9px] text-slate-600 font-bold uppercase italic">Maximum 120 characters allowed for ledger optimization.</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 block">Full Description</label>
                                <textarea
                                    className="input-slate w-full min-h-[200px]"
                                    value={description}
                                    onChange={(e) => setDesc(e.target.value)}
                                    placeholder="Write the proposal specification in markdown format..."
                                />
                            </div>
                        </div>
                    </FormSection>
                </div>

                {/* Configuration */}
                <div className="space-y-8">
                    <FormSection title="Parameters" icon={Settings}>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 block">Classification</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PROPOSAL_TYPES.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setPType(t)}
                                            className={cn(
                                                "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all",
                                                pType === t 
                                                    ? "bg-slate-100 text-black border-slate-100" 
                                                    : "bg-transparent text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {pType === "Treasury" && (
                                <div className="animate-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 block">Grant Amount (SOL)</label>
                                    <input
                                        className="input-slate w-full"
                                        type="number"
                                        value={treasuryAmt}
                                        onChange={(e) => setTAmt(e.target.value)}
                                        min="0"
                                    />
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-800/50 space-y-6">
                                <Toggle 
                                    label="Quadratic Governance" 
                                    sub="Enable Cost = Votes² math"
                                    icon={Zap}
                                    checked={quadratic} 
                                    onChange={setQuadratic} 
                                />
                                <Toggle 
                                    label="Token-Gated Entry" 
                                    sub="Enforce minimum stake requirement"
                                    icon={Shield}
                                    checked={tokenGated} 
                                    onChange={setTokenGated} 
                                />
                                {tokenGated && (
                                    <div className="pl-10 animate-in slide-in-from-top-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Threshold Units</label>
                                        <input
                                            className="input-slate w-full"
                                            type="number"
                                            value={minTokens}
                                            onChange={(e) => setMinTokens(e.target.value)}
                                            min="0"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </FormSection>

                    {/* Meta Info */}
                    <div className="p-6 bg-slate-950/30 border border-slate-800 rounded-2xl">
                        <div className="flex gap-4 items-start">
                            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase tracking-widest">
                                By publishing this proposal, you agree to the Votara network governance protocol. All submissions are immutable on the Solana ledger.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 border-t border-slate-800 pt-10">
                <button className="premium-btn btn-ghost px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-black">Discard</button>
                <button 
                    onClick={handleSubmit}
                    disabled={busy || !title.trim()}
                    className="premium-btn btn-slate px-12 py-4 uppercase tracking-[0.25em] text-[10px] font-black"
                >
                    {busy ? "Broadcasting to Stream..." : "Publish Proposal"}
                    {!busy && <ChevronRight className="w-4 h-4" />}
                </button>
            </div>

            {txState.error && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                    ⚠️ {txState.error}
                </div>
            )}
        </div>
    );
}

function FormSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">{title}</h3>
            </div>
            {children}
        </div>
    );
}

import { Settings } from "lucide-react";

function Toggle({ label, sub, icon: Icon, checked, onChange }: { label: string; sub: string; icon: any; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-start justify-between group">
            <div className="flex gap-4">
                <div className={cn("p-2 rounded-lg border transition-colors", checked ? "bg-slate-100 text-black border-slate-100" : "bg-slate-900 border-slate-800 text-slate-600")}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                    <p className={cn("text-xs font-bold transition-colors", checked ? "text-slate-100" : "text-slate-500")}>{label}</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{sub}</p>
                </div>
            </div>
            <button 
                onClick={() => onChange(!checked)}
                className={cn(
                    "w-10 h-5 rounded-full relative transition-colors duration-300",
                    checked ? "bg-slate-100" : "bg-slate-800"
                )}
            >
                <motion.div 
                    animate={{ x: checked ? 22 : 2 }}
                    className={cn("absolute top-1 w-3 h-3 rounded-full", checked ? "bg-black" : "bg-slate-600")}
                />
            </button>
        </div>
    );
}
