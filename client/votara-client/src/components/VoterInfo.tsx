import { useVoter } from "../hooks/useVoter";
import { useTokenAccount } from "../hooks/useTokenAccount";
import { formatTokens, shortenKey } from "../utils";
import { TokenBalance } from "./TokenBalance";
import { CloseVoter } from "./CloseVoter";

export function VoterInfo() {
    const { voter, loading, error } = useVoter();
    const tokenAccount = useTokenAccount();

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-white/5 rounded-xl" />
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
        </div>
    );

    if (!voter) return null;

    const stats = [
        { label: "Power", value: formatTokens(voter.votingPower.toNumber()), icon: "💪" },
        { label: "Score", value: voter.reputationScore.toNumber(), icon: "🏆" },
        { label: "Staked", value: formatTokens(voter.tokensStaked.toNumber()), icon: "💎" },
        { label: "Votes", value: voter.totalVotesCast.toNumber(), icon: "🗳️" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-gradient-to-br from-[#aa3bff]/10 to-transparent border border-[#aa3bff]/20 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#aa3bff] rounded-full flex items-center justify-center text-xl shadow-lg shadow-[#aa3bff]/20">
                        {voter.isVerified ? "✓" : "👤"}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white leading-none mb-1">Voter Active</h4>
                        <TokenBalance tokenAccount={tokenAccount} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <div className="text-lg mb-2">{s.icon}</div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{s.label}</p>
                        <p className="text-sm font-black text-white">{s.value}</p>
                    </div>
                ))}
            </div>

            {voter.delegatedTo && (
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                    <span className="text-gray-500 uppercase font-bold">Delegated To</span>
                    <span className="text-[#aa3bff] font-mono">{shortenKey(voter.delegatedTo)}</span>
                </div>
            )}

            <div className="pt-4 border-t border-white/5">
                <CloseVoter />
            </div>
        </div>
    );
}
