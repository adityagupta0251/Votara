export function Footer() {
    return (
        <footer className="px-10 py-8 border-t border-white/[0.03] text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] flex items-center justify-between">
            <p>© 2026 Votara Institutional. All rights reserved.</p>
            <div className="flex items-center gap-8">
                <a href="#" className="hover:text-slate-300 transition-colors">API Docs</a>
                <a href="#" className="hover:text-slate-300 transition-colors">Security Audit</a>
                <a href="#" className="hover:text-slate-300 transition-colors">Network Health</a>
            </div>
        </footer>
    );
}
