import { useEffect, useState } from "react";

export function TimeLockCountdown({ endTime }: { endTime: number }) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeLeft("Voting Ended");
                clearInterval(interval);
                return;
            }

            const days = Math.floor(diff / 86400);
            const hours = Math.floor((diff % 86400) / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;

            setTimeLeft(`${days > 0 ? days + "d " : ""}${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
            <span className="text-orange-400 text-xs">⏳</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{timeLeft}</span>
        </div>
    );
}
