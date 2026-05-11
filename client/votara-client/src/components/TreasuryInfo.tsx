import { useTreasury } from "../hooks/useTreasury";
import { formatSol, formatTokens } from "../utils";

export function TreasuryInfo() {
    const { treasury, loading, error } = useTreasury();

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-white/5 rounded-xl w-full" />
            ))}
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
        </div>
    );

    if (!treasury) return (
        <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
            <p className="text-gray-500 text-sm">Treasury not initialized.</p>
        </div>
    );

    const items = [
        { label: "Total SOL", value: formatSol(treasury.totalSol.toNumber()), highlight: true },
        { label: "Governance Tokens", value: formatTokens(treasury.totalTokens.toNumber()) },
        { label: "Locked", value: formatTokens(treasury.lockedAmount.toNumber()) },
        { label: "Reward Pool", value: formatTokens(treasury.rewardPool.toNumber()) },
        { label: "Fees Collected", value: formatSol(treasury.proposalFeesCollected.toNumber()), highlight: true },
    ];

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{item.label}</span>
                    <span className={`text-sm font-black ${item.highlight ? 'text-[#aa3bff]' : 'text-white'}`}>
                        {item.value}
                    </span>
                </div>
            ))}
            
            <div className="mt-6 p-4 bg-gradient-to-r from-[#aa3bff]/10 to-transparent rounded-2xl border border-[#aa3bff]/20">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Multisig Protection</span>
                    <span className={treasury.multisigEnabled ? 'text-[#aa3bff]' : 'text-gray-600'}>
                        {treasury.multisigEnabled ? `Active (${treasury.threshold}/${treasury.signerCount})` : 'Disabled'}
                    </span>
                </div>
            </div>
        </div>
    );
}
