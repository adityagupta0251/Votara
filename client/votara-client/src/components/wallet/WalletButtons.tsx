import { useState } from "react";
import { useWallet, useConnection } from "../../wallet";
import { shortenKey } from "../../utils";
import { LogOut, Wallet, ChevronDown, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "../../constants/constant";

export function WalletButton() {
    const { publicKey, wallet, disconnect, connected, connecting } = useWallet();
    const { connection } = useConnection();
    const { setVisible } = useWalletModal();
    const [balance, setBalance] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const walletName = wallet?.adapter.name || "Unknown";

    const fetchBalance = useCallback(async () => {
        if (publicKey && connection) {
            try {
                const bal = await connection.getBalance(publicKey);
                setBalance(Number(bal) / LAMPORTS_PER_SOL);
            } catch (e) {
                console.error("Failed to fetch balance", e);
            }
        }
    }, [publicKey, connection]);

    useEffect(() => {
        fetchBalance();
        const id = setInterval(fetchBalance, 30000);
        return () => clearInterval(id);
    }, [fetchBalance]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (connecting)
        return (
            <button className="premium-btn btn-slate animate-pulse" disabled>
                Syncing...
            </button>
        );

    if (connected && publicKey) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "premium-btn btn-slate pl-4 pr-3 py-2 group transition-all duration-300",
                        isOpen && "bg-white/[0.05] border-white/20"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter leading-none mb-1">{walletName}</p>
                            <p className="text-xs font-bold text-white leading-none">{shortenKey(publicKey.toBase58())}</p>
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
                            className="absolute right-0 mt-3 w-80 premium-card p-6 border-white/10 bg-slate-950/90 backdrop-blur-2xl z-[100] shadow-2xl"
                        >
                            <div className="space-y-6">
                                <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Capital Reserves</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-white tracking-tighter">
                                            {balance !== null ? balance.toFixed(4) : "---"}
                                        </span>
                                        <span className="text-sm font-bold text-slate-500">SOL</span>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={() => {
                                            disconnect();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-black transition-all uppercase tracking-[0.2em] group"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Disconnect
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
        <button
            onClick={() => setVisible(true)}
            className="premium-btn px-8 py-3 font-black uppercase tracking-[0.2em] text-[10px] bg-white text-black hover:bg-slate-200 transition-all"
        >
            <Plus className="w-4 h-4 mr-2" />
            Connect Wallet
        </button>
    );
}
