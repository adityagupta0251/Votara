import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { pdaDao, pdaVoter } from "../pda";

export function CloseVoter() {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();

    const handleClose = async () => {
        if (!program || !publicKey) return;

        const [daoPda] = pdaDao();
        const [voterPda] = pdaVoter(publicKey);

        await execute(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (program.methods as any)
                .closeVoter()
                .accounts({
                    authority: publicKey,
                    dao: daoPda,
                    voter: voterPda,
                })
                .rpc();
        });
    };

    const busy = txState.status === "sending" || txState.status === "confirming";

    return (
        <div className="glass-card p-6 border-red-500/20">
            <h3 className="text-lg font-bold text-red-400 mb-2">Close Voter Account</h3>
            <p className="text-sm text-gray-400 mb-6">
                This will deactivate your voter status and reclaim the rent SOL. 
                You will no longer be able to vote until you re-register.
            </p>
            <button
                onClick={handleClose}
                disabled={busy}
                className="w-full py-3 px-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-2xl font-semibold transition-all"
            >
                {busy ? "Closing…" : "Deactivate & Reclaim Rent"}
            </button>
            {txState.error && (
                <p className="mt-4 text-xs text-red-400">⚠️ {txState.error}</p>
            )}
        </div>
    );
}
