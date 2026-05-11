import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    animate?: boolean;
    delay?: number;
}

export function PremiumCard({ children, className, animate = true, delay = 0 }: CardProps) {
    if (!animate) {
        return (
            <div className={cn("premium-card", className)}>
                {children}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn("premium-card", className)}
        >
            {children}
        </motion.div>
    );
}

interface StatItemProps {
    label: string;
    value: string | number;
    trend?: string;
    icon: any;
    chartColor?: string;
    delay?: number;
}

export function StatItem({ label, value, trend, icon: Icon, chartColor = "bg-slate-400", delay = 0 }: StatItemProps) {
    return (
        <PremiumCard className="p-6 relative group overflow-hidden" delay={delay}>
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-2 bg-slate-950/50 rounded-lg text-slate-400 group-hover:text-slate-100 transition-colors border border-slate-800">
                    <Icon className="w-4 h-4" />
                </div>
                {trend && <span className="text-[10px] font-black text-slate-500 tracking-widest">{trend}</span>}
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-bold text-white tracking-tighter">{value}</p>
            </div>

            {/* Simulated Micro-Chart */}
            <div className="absolute bottom-0 left-0 right-0 h-1 flex items-end px-6 gap-0.5 opacity-20">
                {[...Array(20)].map((_, j) => (
                    <div
                        key={j}
                        className={cn("flex-1 rounded-t-sm", chartColor)}
                        style={{ height: `${20 + Math.random() * 80}%` }}
                    />
                ))}
            </div>
        </PremiumCard>
    );
}

export function SectionHeader({ title, subtitle, className }: { title: string; subtitle?: string; className?: string }) {
    return (
        <header className={cn("mb-8", className)}>
            <h1 className="text-3xl font-bold mb-2 text-slate-100">{title}</h1>
            {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
        </header>
    );
}
