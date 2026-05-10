import { useWalletConnection, useBalance } from "@solana/react-hooks";
import { type Address } from "@solana/kit";
import { shortenKey } from "../../utils";
import { LogOut, Wallet, ChevronDown, Activity, Globe, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "../../utils/cn";

export function WalletButton() {
    const { connectors, connect, disconnect, wallet, status } = useWalletConnection();
    const balance = useBalance(wallet?.account.address as Address);
    const [isOpen, setIsOpen] = useState(false);
    const [showConnectors, setShowConnectors] = useState(false);

    const connecting = status === "connecting";
    const connected = status === "connected";
    const publicKey = wallet?.account.address;
    const walletName = wallet?.account.label || "Unknown";

    const formatLamports = (lamports?: bigint) => {
        if (lamports === undefined) return "0.00";
        return (Number(lamports) / 1_000_000_000).toFixed(2);
    };

    if (connecting)
        return (
            <button className="premium-btn btn-slate animate-pulse" disabled>
                Syncing...
            </button>
        );

    if (connected && publicKey) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "premium-btn btn-slate pl-4 pr-3 py-2 group",
                        isOpen && "bg-slate-700 border-slate-600"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-slate-100 transition-colors">
                            <Wallet className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-0.5">{walletName}</p>
                            <p className="text-xs font-bold text-slate-100 leading-none">{shortenKey(publicKey)}</p>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform duration-300", isOpen && "rotate-180")} />
                    </div>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-72 premium-card p-6 border-slate-800 z-[100]"
                        >
                            <div className="space-y-6">
                                {/* Balance Card */}
                                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Portfolio Balance</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-bold text-white tracking-tighter">
                                            {balance.lamports !== undefined ? formatLamports(balance.lamports) : "---"}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500 mb-1.5">SOL</span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-[10px] font-bold">
                                        <span className="text-slate-500">Consensus Units</span>
                                        <span className="text-slate-300">0.00 VTR</span>
                                    </div>
                                </div>

                                {/* Network Stats */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="text-[10px] font-bold text-slate-400">Status</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-widest">
                                            Operational <div className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="text-[10px] font-bold text-slate-400">Latency</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-100">42ms</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-800">
                                    <button
                                        onClick={() => {
                                            disconnect();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 text-xs font-bold transition-all uppercase tracking-widest"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        Terminate Session
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowConnectors(!showConnectors)}
                className="premium-btn btn-slate px-8 py-2.5 font-black uppercase tracking-widest text-[10px]"
            >
                <Plus className="w-3.5 h-3.5" />
                Establish Connection
            </button>

            <AnimatePresence>
                {showConnectors && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-64 premium-card p-4 border-slate-800 z-[100] space-y-2"
                    >
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 px-2">Select Connector</p>
                        {connectors.map((connector) => (
                            <button
                                key={connector.id}
                                onClick={() => {
                                    connect(connector.id);
                                    setShowConnectors(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800 transition-all text-left group"
                            >
                                <span className="text-xs font-bold text-slate-300 group-hover:text-white">{connector.name}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-slate-400 transition-colors" />
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
