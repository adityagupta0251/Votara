import { useDao } from "../hooks/useDao";
import { Users, FileText, Zap, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import { PremiumCard, StatItem } from "./layout/Common";

export function DaoStats() {
    const { dao, loading, error } = useDao();

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="premium-card p-6 h-32 animate-pulse" />
            ))}
        </div>
    );

    if (error) return (
        <PremiumCard className="p-6 border-red-900/20 text-red-400 text-xs font-bold">
            {error}
        </PremiumCard>
    );

    if (!dao) return null;

    const stats = [
        { 
            label: "Total Participation", 
            value: dao.totalVoters.toNumber(), 
            trend: "+4.2%",
            icon: Users,
            chartColor: "bg-slate-400"
        },
        { 
            label: "Governance Proposals", 
            value: dao.totalProposals.toNumber(), 
            trend: "8 Active",
            icon: FileText,
            chartColor: "bg-slate-500"
        },
        { 
            label: "Network Utilization", 
            value: dao.totalVotes.toNumber(), 
            trend: "High",
            icon: Zap,
            chartColor: "bg-slate-600"
        },
        { 
            label: "Treasury Reserves", 
            value: "1,254.8", 
            trend: "SOL",
            icon: DollarSign,
            chartColor: "bg-slate-700"
        },
    ];

    return (
        <div className="space-y-10">
            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <StatItem key={s.label} {...s} delay={i * 0.1} />
                ))}
            </div>

            {/* Advanced Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Governance Activity Timeline */}
                <PremiumCard className="lg:col-span-8 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-1">Proposal Success Ratio</h3>
                            <p className="text-xs text-slate-500 font-medium">Monthly governance snapshot across all categories.</p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-100" /> Passed</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-600" /> Rejected</div>
                        </div>
                    </div>
                    <div className="h-48 flex items-end justify-between gap-2 border-b border-slate-800/50 pb-2">
                        {[40, 60, 30, 80, 45, 90, 55, 70, 35, 85, 50, 65].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="w-full bg-slate-800/40 border border-slate-700/50 rounded-t-lg group-hover:bg-slate-700 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100/5 to-transparent" />
                                </motion.div>
                                <span className="text-[8px] font-black text-slate-700">M{i+1}</span>
                            </div>
                        ))}
                    </div>
                </PremiumCard>

                {/* Treasury Distribution */}
                <PremiumCard className="lg:col-span-4 p-8 flex flex-col">
                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-6">Treasury Flow</h3>
                    <div className="flex-1 flex items-center justify-center py-4">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-800" />
                                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400" strokeDasharray="70, 100" strokeLinecap="round" />
                                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600" strokeDasharray="30, 100" strokeDashoffset="-70" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-black text-white leading-none">1.2K</span>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">SOL Total</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 mt-6">
                        <DistributionItem label="Ecosystem Grants" value="65%" color="bg-slate-400" />
                        <DistributionItem label="Operations" value="25%" color="bg-slate-600" />
                        <DistributionItem label="Security" value="10%" color="bg-slate-800" />
                    </div>
                </PremiumCard>
            </div>
        </div>
    );
}

function DistributionItem({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="flex items-center justify-between text-[10px] font-bold">
            <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", color)} />
                <span className="text-slate-500">{label}</span>
            </div>
            <span className="text-slate-300">{value}</span>
        </div>
    );
}
