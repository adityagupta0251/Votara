import { Search, Bell } from "lucide-react";
import { WalletButton } from "../wallet/WalletButtons";

export function Header() {
    return (
        <header className="h-24 sticky top-0 bg-bg-deep/50 backdrop-blur-md px-10 flex items-center justify-between border-b border-white/[0.03] z-40">
            <div className="flex items-center gap-6 flex-1">
                <div className="relative max-w-md w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-slate-400 transition-colors" />
                    <input
                        placeholder="Search proposals, members, tx hashes..."
                        className="w-full bg-slate-950/50 border border-slate-900 rounded-full pl-11 pr-4 py-2.5 text-xs focus:outline-none focus:border-slate-700 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 border-r border-white/[0.05] pr-6">
                    <button className="relative p-2 text-slate-500 hover:text-slate-100 transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-slate-400 rounded-full border-2 border-bg-deep" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Network</p>
                            <p className="text-xs font-bold text-slate-300 leading-none">
                                {import.meta.env.VITE_CLUSTER === "localnet" || !import.meta.env.VITE_CLUSTER ? "Localhost" : "Devnet-Beta"}
                            </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse shadow-[0_0_10px_rgba(148,163,184,0.5)]" />
                    </div>
                </div>
                <WalletButton />
            </div>
        </header>
    );
}
