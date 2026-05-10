import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { pdaDao } from "../pda";

interface Props {
    proposalPda: any;
}

export function CloseProposals({ proposalPda }: Props) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();

    const handleCancel = async () => {
        if (!program || !publicKey) return;

        const [daoPda] = pdaDao();

        await execute(async () => {
            // Using cancelProposal to close/cancel a proposal
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (program.methods as any)
                .cancelProposal()
                .accounts({
                    authority: publicKey,
                    dao: daoPda,
                    proposal: proposalPda,
                })
                .rpc();
        });
    };

    const busy = txState.status === "pending" || txState.status === "confirming";

    return (
        <div className="glass-card p-4 border-red-500/20">
            <h4 className="text-sm font-semibold text-red-400 mb-2">Cancel Proposal</h4>
            <p className="text-xs text-gray-400 mb-4">
                Permanently cancel this proposal. Only the creator or admin can do this.
            </p>
            <button
                onClick={handleCancel}
                disabled={busy}
                className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-medium transition-all"
            >
                {busy ? "Cancelling…" : "Cancel Proposal"}
            </button>
            {txState.error && (
                <p className="mt-2 text-xs text-red-400">⚠️ {txState.error}</p>
            )}
        </div>
    );
}
