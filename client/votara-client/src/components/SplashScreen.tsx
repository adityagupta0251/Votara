import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const timer1 = setTimeout(() => setPhase(1), 800);
        const timer2 = setTimeout(() => setPhase(2), 2400);
        const timer3 = setTimeout(() => onFinish(), 3500);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onFinish]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient Background Gradient */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-black to-slate-800/10"
            />
            
            {/* Glow Lines Animation */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: "100%", opacity: [0, 1, 0] }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            delay: i * 0.8,
                            ease: "easeInOut" 
                        }}
                        className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-400 to-transparent absolute"
                        style={{ top: `${30 + i * 20}%` }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-24 h-24 mb-10 relative"
                >
                    <div className="absolute inset-0 bg-slate-500/20 blur-3xl rounded-full animate-pulse" />
                    <div className="w-full h-full border-4 border-slate-700 flex items-center justify-center rounded-[2rem] bg-slate-900 shadow-2xl relative overflow-hidden group">
                         <div className="text-4xl text-slate-100 font-black">◆</div>
                         <motion.div 
                            animate={{ y: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"
                         />
                    </div>
                </motion.div>

                {/* Brand & Tagline */}
                <div className="text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-4xl font-black tracking-tighter text-slate-100 mb-3"
                    >
                        VOTARA
                    </motion.h1>
                    <AnimatePresence mode="wait">
                        {phase >= 1 && (
                            <motion.p
                                key="tagline"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-slate-500 font-medium tracking-[0.2em] uppercase text-[10px]"
                            >
                                Governance for the Next Era
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Loading Indicator */}
                <div className="mt-16 h-1 w-48 bg-slate-900 rounded-full overflow-hidden relative">
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: phase >= 2 ? "100%" : "0%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="h-full w-full bg-gradient-to-r from-transparent via-slate-500 to-transparent"
                    />
                </div>
            </div>

            {/* Grain Texture */}
            <div className="bg-grain opacity-5" />
        </div>
    );
}
