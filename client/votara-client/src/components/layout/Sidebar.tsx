import { motion } from "framer-motion";
import {
    ChevronLeft,
    Menu,
    Shield
} from "lucide-react";
import { cn } from "../../utils/cn";
import { NAVIGATION_ITEMS, type Tab, type NavItem } from "../../constants/navigation";

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
    setSelectedProposal: (proposal: any) => void;
    isAdmin: boolean;
    hasDao: boolean;
}

export function Sidebar({
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setSelectedProposal,
    isAdmin,
    hasDao
}: SidebarProps) {
    const navigation: NavItem[] = [...NAVIGATION_ITEMS];

    if (isAdmin || !hasDao) {
        navigation.push({ id: "admin", label: "Protocol Admin", icon: Shield, group: "SYSTEM" });
    }

    return (
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
    );
}
