import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronLeft, 
    ExternalLink
} from "lucide-react";
import { useWallet } from "./wallet";
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
import { InitializeDao, InitializeTreasury } from "./components/Admin";
import { BuyTokens } from "./components/BuyTokens";
import type { ProposalWithPubkey } from "./types";

// Layout Components
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { PremiumCard, SectionHeader } from "./components/layout/Common";
import type { Tab } from "./constants/navigation";

function AppContent() {
    const { publicKey } = useWallet();
    const { dao } = useDao();
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("dashboard");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<ProposalWithPubkey | null>(null);
    const userTokenAccount = useTokenAccount();

    const nextId = dao ? dao.totalProposals.toNumber() : 0;
    const isAdmin = !!(dao && publicKey && dao.authority.equals(publicKey));

    if (isAppLoading) {
        return <SplashScreen onFinish={() => setIsAppLoading(false)} />;
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
                        <SectionHeader
                            title="Institutional Governance"
                            subtitle="Real-time monitoring of Votara DAO metrics, treasury utilization, and participation snapshots."
                        />
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
                        <SectionHeader
                            title="New Governance Proposal"
                            subtitle="Submit a change request to the Votara network."
                        />
                        <PremiumCard className="p-10">
                             <CreateProposal nextProposalId={nextId} />
                        </PremiumCard>
                    </div>
                );
            case "treasury":
                return (
                    <div className="max-w-4xl space-y-10">
                        <SectionHeader
                            title="Treasury Reserves"
                            subtitle="Monitor SOL and governance token allocations."
                        />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <TreasuryInfo />
                            <BuyTokens buyerTokenAccount={userTokenAccount} />
                        </div>
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
                        <SectionHeader
                            title="Protocol Settings"
                            subtitle="Authority-only administrative controls."
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {!dao && (
                                <PremiumCard className="p-10 border-slate-800/50 space-y-6">
                                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Bootstrap Network</h3>
                                    <p className="text-xs text-slate-500">Initialize the core DAO and Treasury accounts on this cluster.</p>
                                    <div className="space-y-4">
                                        <InitializeDao />
                                        <InitializeTreasury />
                                    </div>
                                </PremiumCard>
                            )}
                            <PremiumCard className="p-10 border-slate-800/50">
                                <WithdrawTokens destinationTokenAccount={userTokenAccount} />
                            </PremiumCard>
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

            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                setSelectedProposal={setSelectedProposal}
                isAdmin={isAdmin}
                hasDao={!!dao}
            />

            <div className="flex-1 flex flex-col min-h-screen relative z-10">
                <Header />

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

                <Footer />
            </div>
        </div>
    );
}

export default function App() {
    return <AppContent />;
}
