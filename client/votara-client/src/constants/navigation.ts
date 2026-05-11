import {
    LayoutDashboard,
    FileText,
    Wallet,
    User,
    Plus
} from "lucide-react";

export type Tab = "dashboard" | "proposals" | "create" | "treasury" | "profile" | "admin";

export interface NavItem {
    id: Tab;
    label: string;
    path: string;
    icon: any;
    group: "GOVERNANCE" | "FINANCE" | "USER" | "SYSTEM";
}

export const NAVIGATION_ITEMS: NavItem[] = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, group: "GOVERNANCE" },
    { id: "proposals", label: "All Proposals", path: "/proposals", icon: FileText, group: "GOVERNANCE" },
    { id: "create", label: "Create Proposal", path: "/create", icon: Plus, group: "GOVERNANCE" },
    { id: "treasury", label: "Treasury", path: "/treasury", icon: Wallet, group: "FINANCE" },
    { id: "profile", label: "Voter Profile", path: "/profile", icon: User, group: "USER" },
];
