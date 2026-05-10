import { useMemo } from "react";
import {
    resolveProposalStatus,
    resolveProposalType,
    type ProposalAccount,
} from "../types";
import { shortenKey } from "../utils";
import type { PublicKey } from "@solana/web3.js";
import { PickWinner } from "./PickWinner";
import { CloseProposals } from "./CloseProposals";
import { TimeLockCountdown } from "./TimeLockCountdown";
import { Vote } from "./Vote";
import { motion } from "framer-motion";
import { 
    Clock, 
    User, 
    TrendingUp, 
    CheckCircle2, 
    XCircle, 
    Shield, 
    BarChart3, 
    Database, 
    FileText,
    History
} from "lucide-react";
import { cn } from "../utils/cn";

interface Props {
    pubkey: PublicKey;
    account: ProposalAccount;
    isAdmin?: boolean;
}

export function ProposalInfo({ pubkey, account: p, isAdmin }: Props) {
    const status = resolveProposalStatus(p.status);
    const type = resolveProposalType(p.proposalType);

    const totalVotes = useMemo(() => {
        return (
            p.yesVotes.toNumber() +
            p.noVotes.toNumber() +
            p.abstainVotes.toNumber()
        );
    }, [p.yesVotes, p.noVotes, p.abstainVotes]);

    const yesPct = totalVotes > 0 ? (p.yesVotes.toNumber() / totalVotes) * 100 : 0;
    const noPct = totalVotes > 0 ? (p.noVotes.toNumber() / totalVotes) * 100 : 0;
    const abstainPct = totalVotes > 0 ? (p.abstainVotes.toNumber() / totalVotes) * 100 : 0;

    const statusConfig = {
        Active: { color: "text-slate-100 bg-slate-100/5", icon: Clock },
        Passed: { color: "text-emerald-400 bg-emerald-400/5", icon: CheckCircle2 },
        Rejected: { color: "text-red-400 bg-red-400/5", icon: XCircle },
        Cancelled: { color: "text-slate-500 bg-slate-500/5", icon: History },
        Finalized: { color: "text-slate-200 bg-slate-200/5", icon: Shield },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Active;

    return (
        <div className="space-y-12 pb-24">
            {/* Editorial Header */}
            <header className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-white/5", config.color)}>
                            <config.icon className="w-3.5 h-3.5" />
                            {status}
                        </div>
                        <span className="px-4 py-1.5 bg-slate-900/50 border border-slate-800 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                            {type} Specification
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        <Database className="w-3.5 h-3.5" />
                        IDENTIFIER: #{p.id.toString()}
                    </div>
                </div>
                
                <h1 className="text-5xl font-black text-slate-100 tracking-tighter leading-none max-w-4xl">
                    {p.title}
                </h1>

                <div className="flex flex-wrap items-center gap-10 py-8 border-y border-white/[0.03]">
                    <MetaItem icon={User} label="Initiator" value={shortenKey(p.creator, 4)} />
                    <MetaItem icon={BarChart3} label="Consensus Weight" value={`${p.uniqueVoters.toString()} Participating`} />
                    <MetaItem icon={Clock} label="Protocol Timestamp" value={new Date(p.createdAt.toNumber() * 1000).toLocaleDateString()} />
                    {status === "Active" && (
                        <div className="ml-auto">
                            <TimeLockCountdown endTime={p.endTime.toNumber()} />
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Proposal Body */}
                <div className="lg:col-span-8 space-y-12">
                    <section className="prose prose-invert max-w-none">
                        <div className="flex items-center gap-3 mb-8">
                            <FileText className="w-5 h-5 text-slate-600" />
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.25em] m-0">Specification Draft</h2>
                        </div>
                        <p className="text-slate-400 text-lg leading-relaxed font-medium">
                            {p.description}
                        </p>
                    </section>

                    {/* Voting Progress Section */}
                    <section className="premium-card p-10 bg-slate-950/20">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-slate-100" />
                                <h3 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Consensus Real-time Stream</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{totalVotes} Units Cast</span>
                        </div>
                        
                        <div className="space-y-10">
                            <ResultBar label="Approval (Yes)" pct={yesPct} amount={p.yesVotes.toString()} color="bg-slate-100" />
                            <ResultBar label="Opposition (No)" pct={noPct} amount={p.noVotes.toString()} color="bg-slate-600" />
                            <ResultBar label="Abstention" pct={abstainPct} amount={p.abstainVotes.toString()} color="bg-slate-800" />
                        </div>
                    </section>
                </div>

                {/* Interaction Sidebar */}
                <aside className="lg:col-span-4 space-y-8">
                    {status === "Active" && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="sticky top-32 space-y-8"
                        >
                            <Vote 
                                proposalPubkey={pubkey} 
                                quadraticEnabled={p.quadraticEnabled} 
                            />
                            
                            {isAdmin && (
                                <div className="premium-card p-8 border-slate-800 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Protocol Execution</h4>
                                    <PickWinner proposalPda={pubkey} />
                                    <CloseProposals proposalPda={pubkey} />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {p.winnerWallet && (
                        <div className="premium-card p-8 bg-white/5 border-white/10">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-black mb-6 shadow-2xl shadow-white/10">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2">Outcome Established</h4>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Winner Recipient</p>
                                <div className="w-full py-3 px-4 bg-black/50 border border-white/5 rounded-xl font-mono text-xs text-slate-300">
                                    {shortenKey(p.winnerWallet, 8)}
                                </div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}

function MetaItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-slate-600">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-sm font-bold text-slate-100 leading-none">{value}</p>
            </div>
        </div>
    );
}

function ResultBar({ label, pct, amount, color }: { label: string; pct: number; amount: string; color: string }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-100">{pct.toFixed(1)}% <span className="text-slate-600 ml-1">({amount})</span></span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]", color)}
                />
            </div>
        </div>
    );
}
