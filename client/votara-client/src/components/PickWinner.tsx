import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { pdaDao, pdaConfig, pdaTreasury, pdaAnalytics } from "../pda";

interface Props {
    proposalPda: any; // The public key of the proposal
}

export function PickWinner({ proposalPda }: Props) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();

    const handleFinalize = async () => {
        if (!program || !publicKey) return;

        const [daoPda] = pdaDao();
        const [configPda] = pdaConfig();
        const [treasuryPda] = pdaTreasury();
        const [analyticsPda] = pdaAnalytics(proposalPda);

        await execute(async () => {
            // Using finalizeProposal as the logic to 'pick winner' or end voting
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (program.methods as any)
                .finalizeProposal()
                .accounts({
                    authority: publicKey,
                    dao: daoPda,
                    config: configPda,
                    treasury: treasuryPda,
                    proposal: proposalPda,
                    analytics: analyticsPda,
                })
                .rpc();
        });
    };

    const busy = txState.status === "pending" || txState.status === "confirming";

    return (
        <div className="glass-card p-4">
            <h4 className="text-sm font-semibold mb-3">Finalize Voting</h4>
            <p className="text-xs text-gray-400 mb-4">
                Calculate results and distribute funds if the proposal passed.
            </p>
            <button
                onClick={handleFinalize}
                disabled={busy}
                className="w-full py-2 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
                {busy ? "Finalizing…" : "Finalize & Pick Winner"}
            </button>
            {txState.error && (
                <p className="mt-2 text-xs text-red-400">⚠️ {txState.error}</p>
            )}
        </div>
    );
}
