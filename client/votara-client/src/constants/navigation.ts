export type Tab = "dashboard" | "proposals" | "create" | "voting" | "treasury" | "profile" | "admin";

export interface NavItem {
    id: Tab;
    label: string;
    icon: any;
    group: "GOVERNANCE" | "FINANCE" | "USER" | "SYSTEM";
}

import {
    LayoutDashboard,
    FileText,
    Wallet,
    User,
    Plus
} from "lucide-react";

export const NAVIGATION_ITEMS: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "GOVERNANCE" },
    { id: "proposals", label: "All Proposals", icon: FileText, group: "GOVERNANCE" },
    { id: "create", label: "Create Proposal", icon: Plus, group: "GOVERNANCE" },
    { id: "treasury", label: "Treasury", icon: Wallet, group: "FINANCE" },
    { id: "profile", label: "Voter Profile", icon: User, group: "USER" },
];
