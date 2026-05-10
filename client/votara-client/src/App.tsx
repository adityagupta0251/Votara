import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    LayoutDashboard, 
    FileText, 
    Wallet, 
    User, 
    ChevronLeft, 
    Menu, 
    Search, 
    Bell,
    ExternalLink,
    Plus,
    Shield
} from "lucide-react";
import { useWallet } from "./wallet";
import { WalletButton } from "./components/wallet/WalletButtons";
import { DaoStats } from "./components/DaoStats";
import { VoterInfo } from "./components/VoterInfo";
import { RegisterVoter } from "./components/RegisterVoter";
import { AllProposals } from "./components/Given_Allproposals";
import { CreateProposal } from "./components/CreateProposals";
import { TreasuryInfo } from "./components/TreasuryInfo";
import { ProposalInfo } from "./components/ProposalInfo";
import { WithdrawTokens } from "./components/WithdrawTokens";
import { LaserStreamFeed } from "./components/LaserStreamFeed";
import { useDao } from "./hooks/useDao";
import { useTokenAccount } from "./hooks/useTokenAccount";
import { SplashScreen } from "./components/SplashScreen";
import { cn } from "./utils/cn";
import type { ProposalWithPubkey } from "./types";

type Tab = "dashboard" | "proposals" | "create" | "voting" | "treasury" | "profile" | "admin";

function AppContent() {
    const { publicKey } = useWallet();
    const { dao } = useDao();
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("dashboard");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<ProposalWithPubkey | null>(null);
    const userTokenAccount = useTokenAccount();

    const nextId = dao ? dao.totalProposals.toNumber() : 0;
    const isAdmin = dao && publicKey && dao.authority.equals(publicKey);

    if (isAppLoading) {
        return <SplashScreen onFinish={() => setIsAppLoading(false)} />;
    }

    const navigation = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "GOVERNANCE" },
        { id: "proposals", label: "All Proposals", icon: FileText, group: "GOVERNANCE" },
        { id: "create", label: "Create Proposal", icon: Plus, group: "GOVERNANCE" },
        { id: "treasury", label: "Treasury", icon: Wallet, group: "FINANCE" },
        { id: "profile", label: "Voter Profile", icon: User, group: "USER" },
    ];

    if (isAdmin) {
        navigation.push({ id: "admin", label: "Protocol Admin", icon: Shield, group: "SYSTEM" });
    }

    const renderContent = () => {
        if (selectedProposal) {
            return (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-4xl"
                >
                    <button 
                        onClick={() => setSelectedProposal(null)}
                        className="mb-8 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Governance Stream
                    </button>
                    <ProposalInfo 
                        pubkey={selectedProposal.pubkey} 
                        account={selectedProposal.account}
                        isAdmin={isAdmin}
                    />
                </motion.div>
            );
        }

        switch (activeTab) {
            case "dashboard":
                return (
                    <div className="space-y-12">
                        <header>
                            <h1 className="text-4xl font-bold mb-4 tracking-tighter text-slate-100">Institutional Governance</h1>
                            <p className="text-slate-500 max-w-2xl font-medium">
                                Real-time monitoring of Votara DAO metrics, treasury utilization, and participation snapshots.
                            </p>
                        </header>
                        <DaoStats />
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-8">
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Latest Activity</h2>
                                        <button className="text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            View Explorer <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <AllProposals onSelect={setSelectedProposal} />
                                </section>
                            </div>
                            <div className="lg:col-span-4 space-y-8">
                                <LaserStreamFeed />
                                <RegisterVoter />
                            </div>
                        </div>
                    </div>
                );
            case "proposals":
                return <AllProposals onSelect={setSelectedProposal} />;
            case "create":
                return (
                    <div className="max-w-4xl space-y-10">
                        <header>
                            <h1 className="text-3xl font-bold mb-2">New Governance Proposal</h1>
                            <p className="text-slate-500 text-sm">Submit a change request to the Votara network.</p>
                        </header>
                        <div className="premium-card p-10">
                             <CreateProposal nextProposalId={nextId} />
                        </div>
                    </div>
                );
            case "treasury":
                return (
                    <div className="max-w-4xl space-y-10">
                        <header>
                            <h1 className="text-3xl font-bold mb-2 text-slate-100">Treasury Reserves</h1>
                            <p className="text-slate-500 text-sm">Monitor SOL and governance token allocations.</p>
                        </header>
                        <TreasuryInfo />
                    </div>
                );
            case "profile":
                return (
                    <div className="max-w-2xl space-y-10">
                        <VoterInfo />
                        <RegisterVoter />
                    </div>
                );
            case "admin":
                return (
                    <div className="max-w-4xl space-y-10">
                         <header>
                            <h1 className="text-3xl font-bold mb-2 text-slate-100">Protocol Settings</h1>
                            <p className="text-slate-500 text-sm">Authority-only administrative controls.</p>
                        </header>
                        <div className="premium-card p-10 border-slate-800/50">
                            <WithdrawTokens destinationTokenAccount={userTokenAccount} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex bg-bg-deep text-slate-400 selection:bg-slate-700/50">
            <div className="bg-grain" />

            {/* ── Sidebar ── */}
            <aside className={cn(
                "h-screen sticky top-0 border-r border-white/[0.03] bg-slate-950/20 backdrop-blur-3xl z-50 flex flex-col transition-all duration-500 ease-in-out overflow-hidden",
                isSidebarCollapsed ? "w-20" : "w-72"
            )}>
                <div className="p-6 h-24 flex items-center border-b border-white/[0.03]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-slate-100 rounded-xl text-black font-black text-xl shadow-2xl shadow-white/5">
                            ◆
                        </div>
                        {!isSidebarCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xl font-black text-white tracking-tighter"
                            >
                                VOTARA
                            </motion.span>
                        )}
                    </div>
                </div>

                <div className="flex-1 py-8 overflow-y-auto scrollbar-premium px-4">
                    <nav className="space-y-8">
                        {["GOVERNANCE", "FINANCE", "USER", "SYSTEM"].map(group => {
                            const items = navigation.filter(n => n.group === group);
                            if (items.length === 0) return null;
                            return (
                                <div key={group} className="space-y-2">
                                    {!isSidebarCollapsed && (
                                        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] mb-4">
                                            {group}
                                        </p>
                                    )}
                                    {items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTab(item.id as Tab); setSelectedProposal(null); }}
                                            className={cn(
                                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group",
                                                activeTab === item.id ? "text-white bg-white/[0.03]" : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.01]"
                                            )}
                                        >
                                            <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-500", activeTab === item.id ? "scale-110" : "group-hover:scale-110")} />
                                            {!isSidebarCollapsed && (
                                                <span className="text-xs font-bold tracking-tight">{item.label}</span>
                                            )}
                                            {activeTab === item.id && (
                                                <motion.div 
                                                    layoutId="active-pill"
                                                    className="absolute left-0 w-1 h-6 bg-slate-100 rounded-r-full"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-white/[0.03]">
                    <button 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-white/[0.03] text-slate-600 hover:text-slate-300 transition-all"
                    >
                        {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <div className="flex-1 flex flex-col min-h-screen relative z-10">
                {/* Header */}
                <header className="h-24 sticky top-0 bg-bg-deep/50 backdrop-blur-md px-10 flex items-center justify-between border-b border-white/[0.03]">
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
                                    <p className="text-xs font-bold text-slate-300 leading-none">Devnet-Beta</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse shadow-[0_0_10px_rgba(148,163,184,0.5)]" />
                            </div>
                        </div>
                        <WalletButton />
                    </div>
                </header>

                <main className="flex-1 p-12 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedProposal ? `proposal-${selectedProposal.pubkey}` : activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>

                <footer className="px-10 py-8 border-t border-white/[0.03] text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] flex items-center justify-between">
                    <p>© 2026 Votara Institutional. All rights reserved.</p>
                    <div className="flex items-center gap-8">
                        <a href="#" className="hover:text-slate-300 transition-colors">API Docs</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">Security Audit</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">Network Health</a>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default function App() {
    return <AppContent />;
}
