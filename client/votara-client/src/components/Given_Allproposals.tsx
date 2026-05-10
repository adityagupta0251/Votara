import { useProposals } from "../hooks/useProposals";
import {
    resolveProposalStatus,
    resolveProposalType,
    type ProposalWithPubkey,
} from "../types";
import { shortenKey } from "../utils";
import { TimeLockCountdown } from "./TimeLockCountdown";
import { motion } from "framer-motion";
import { FileText, User, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Activity } from "lucide-react";
import { cn } from "../utils/cn";

function ProposalCard({ item, onSelect }: { item: ProposalWithPubkey; onSelect: (item: ProposalWithPubkey) => void }) {
    const { account: p } = item;
    const status = resolveProposalStatus(p.status);
    const type = resolveProposalType(p.proposalType);

    const total =
        p.yesVotes.toNumber() +
        p.noVotes.toNumber() +
        p.abstainVotes.toNumber();
    const yesPct =
        total > 0 ? Math.round((p.yesVotes.toNumber() / total) * 100) : 0;
    const noPct =
        total > 0 ? Math.round((p.noVotes.toNumber() / total) * 100) : 0;

    const statusConfig = {
        Active: { color: "text-slate-100 bg-slate-100/5", icon: Clock },
        Draft: { color: "text-slate-500 bg-slate-500/5", icon: FileText },
        Finalized: { color: "text-slate-400 bg-slate-400/5", icon: CheckCircle2 },
        Cancelled: { color: "text-red-400/60 bg-red-400/5", icon: XCircle },
        Passed: { color: "text-emerald-400/60 bg-emerald-400/5", icon: CheckCircle2 },
        Failed: { color: "text-orange-400/60 bg-orange-400/5", icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Draft;

    return (
        <motion.div
            layout
            onClick={() => onSelect(item)}
            className="premium-card p-0 overflow-hidden cursor-pointer group"
        >
            <div className="p-8 border-b border-white/[0.03]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", config.color)}>
                            <config.icon className="w-3 h-3" />
                            {status}
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest border border-slate-800/50 px-2 py-0.5 rounded-full">
                            {type}
                        </span>
                    </div>
                    {status === "Active" && <TimeLockCountdown endTime={p.endTime.toNumber()} />}
                </div>

                <div className="space-y-3 mb-8">
                    <h3 className="text-2xl font-bold text-slate-100 tracking-tight leading-[1.1] group-hover:text-white transition-colors">
                        {p.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium">
                        {p.description}
                    </p>
                </div>

                <div className="flex items-center gap-6 text-[10px] font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <User className="w-2 h-2" />
                        </div>
                        <span>BY {shortenKey(p.creator, 4)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" />
                        <span>{p.uniqueVoters.toString()} PARTICIPANTS</span>
                    </div>
                    {p.quadraticEnabled && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <Zap className="w-3 h-3" />
                            <span>QUADRATIC</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8 bg-slate-950/20">
                <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Governance Outcome</span>
                        <span className="text-slate-100">{yesPct}% Support</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                        <div className="h-full bg-slate-400 transition-all duration-1000" style={{ width: `${yesPct}%` }} />
                        <div className="h-full bg-slate-700 transition-all duration-1000" style={{ width: `${noPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                        <span>Yes {p.yesVotes.toString()}</span>
                        <span>No {p.noVotes.toString()}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

import { Zap } from "lucide-react";

export function AllProposals({ onSelect }: { onSelect: (item: ProposalWithPubkey) => void }) {
    const { proposals, loading, error, refetch } = useProposals();

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="premium-card h-96 animate-pulse" />
            ))}
        </div>
    );

    if (error) return (
        <div className="premium-card p-12 border-red-900/20 text-center">
            <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-6">{error}</p>
            <button onClick={refetch} className="premium-btn btn-slate mx-auto">Re-establish Stream</button>
        </div>
    );

    if (!proposals.length) return (
        <div className="premium-card p-24 text-center border-dashed border-slate-800 bg-transparent">
            <p className="text-slate-600 font-bold uppercase tracking-widest">No active governance proposals detected.</p>
        </div>
    );

    const sorted = [...proposals].sort(
        (a, b) =>
            b.account.createdAt.toNumber() - a.account.createdAt.toNumber(),
    );

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-slate-100 rounded-full" />
                    <h2 className="text-xl font-bold text-slate-100 tracking-tight">Governance Stream</h2>
                    <span className="text-xs font-bold text-slate-600 ml-2">({proposals.length} Total)</span>
                </div>
                <button onClick={refetch} className="p-2 text-slate-600 hover:text-slate-300 transition-colors">
                    <Activity className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sorted.map((item) => (
                    <ProposalCard
                        key={item.pubkey.toString()}
                        item={item}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    );
}
