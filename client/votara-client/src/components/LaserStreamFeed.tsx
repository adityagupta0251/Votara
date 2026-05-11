import { useEffect, useState } from "react";
import { useConnection } from "../wallet";
import { useProgram } from "../program";
import { shortenKey } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, Layers } from "lucide-react";

interface LiveEvent {
    id: string;
    type: "VOTE" | "PROPOSAL" | "STAKE";
    message: string;
    timestamp: number;
    signature?: string;
}

export function LaserStreamFeed() {
    const { connection } = useConnection();
    const { program } = useProgram();
    const [events, setEvents] = useState<LiveEvent[]>([]);

    useEffect(() => {
        if (!program) return;

        const subId = connection.onLogs(
            program.programId,
            (logs) => {
                if (logs.err) return;

                const newEvent: LiveEvent = {
                    id: Math.random().toString(36).substring(7),
                    type: "VOTE",
                    message: "PROTOCOL SIGNAL DETECTED",
                    timestamp: Date.now(),
                    signature: logs.signature,
                };

                if (logs.logs.some(l => l.includes("Instruction: CastVote"))) {
                    newEvent.type = "VOTE";
                    newEvent.message = "CONSENSUS VOTE RECORDED";
                } else if (logs.logs.some(l => l.includes("Instruction: CreateProposal"))) {
                    newEvent.type = "PROPOSAL";
                    newEvent.message = "NEW GOVERNANCE EMITTED";
                } else {
                    return;
                }

                setEvents((prev) => [newEvent, ...prev].slice(0, 4));
            },
            "confirmed"
        );

        return () => {
            connection.removeOnLogsListener(subId);
        };
    }, [connection, program]);

    return (
        <div className="premium-card p-6 bg-slate-950/40 border-slate-800/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-100"></span>
                    </div>
                    <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-[0.25em]">Chainstack Real-time</h3>
                </div>
                <div className="p-1 bg-slate-900 rounded border border-slate-800">
                    <Activity className="w-3 h-3 text-slate-500" />
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence initial={false}>
                    {events.length === 0 ? (
                        <div className="text-[9px] font-bold text-slate-700 py-4 text-center uppercase tracking-widest italic">
                            Awaiting Ledger Activity...
                        </div>
                    ) : (
                        events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-start justify-between group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1 bg-slate-900 border border-slate-800 rounded group-hover:border-slate-600 transition-colors">
                                        {event.type === "VOTE" ? <Zap className="w-2.5 h-2.5 text-slate-400" /> : <Layers className="w-2.5 h-2.5 text-slate-200" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-slate-300 leading-none tracking-tight">{event.message}</p>
                                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                                            {event.signature ? shortenKey(event.signature, 4) : "VERIFYING"}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[8px] font-black text-slate-700 uppercase tracking-tighter">NOW</span>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Latency Engine</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">Global Elastic Node</span>
                </div>
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map(i => (
                        <motion.div
                            key={i}
                            animate={{ height: [8, 16, 8] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1 bg-slate-700 rounded-full"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
