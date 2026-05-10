import { SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import {
    pdaDao,
    pdaConfig,
    pdaTreasury,
    pdaGovMint,
    pdaVault,
    pdaAnalytics,
} from "../pda";
import type { PublicKey } from "@solana/web3.js";

// ─── InitializeDao ────────────────────────────────────────────────────────────

export function InitializeDao() {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();

    const init = async () => {
        if (!program || !publicKey) return;
        const [daoPda] = pdaDao();
        const [configPda] = pdaConfig();

        await execute(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (program.methods as any)
                .initializeDao()
                .accounts({
                    authority: publicKey,
                    dao: daoPda,
                    config: configPda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
        });
    };

    const busy =
        txState.status === "pending" || txState.status === "confirming";
    return (
        <div className="admin-action">
            <h4>Initialize DAO</h4>
            <button onClick={init} disabled={busy}>
                {busy ? "Working…" : "Initialize DAO"}
            </button>
            {txState.error && <p className="error">{txState.error}</p>}
        </div>
    );
}

// ─── InitializeTreasury ───────────────────────────────────────────────────────

export function InitializeTreasury() {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();

    const init = async () => {
        if (!program || !publicKey) return;
        const [daoPda] = pdaDao();
        const [treasuryPda] = pdaTreasury();
        const [mintPda] = pdaGovMint();
        const [vaultPda] = pdaVault();

        await execute(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (program.methods as any)
                .initializeTreasury()
                .accounts({
                    authority: publicKey,
                    dao: daoPda,
                    treasury: treasuryPda,
                    governanceTokenMint: mintPda,
                    vault: vaultPda,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                })
                .rpc();
        });
    };

    const busy =
        txState.status === "pending" || txState.status === "confirming";
    return (
        <div className="admin-action">
            <h4>Initialize Treasury</h4>
            <button onClick={init} disabled={busy}>
                {busy ? "Working…" : "Initialize Treasury"}
            </button>
            {txState.error && <p className="error">{txState.error}</p>}
        </div>
    );
}

// ─── FinalizeProposal ─────────────────────────────────────────────────────────

interface FinalizeProposalProps {
    proposalPubkey: PublicKey;
    onFinalized?: () => void;
}

export function FinalizeProposal({
    proposalPubkey,
    onFinalized,
}: FinalizeProposalProps) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();
    const finalize = async () => {
        if (!program || !publicKey) return;
        const [daoPda] = pdaDao();
        const [configPda] = pdaConfig();
        const [treasuryPda] = pdaTreasury();
        const [analyticsPda] = pdaAnalytics(proposalPubkey);

        await execute(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (program.methods as any)
                .finalizeProposal()
                .accounts({
                    authority: publicKey,
                    dao: daoPda,
                    config: configPda,
                    treasury: treasuryPda,
                    proposal: proposalPubkey,
                    analytics: analyticsPda,
                })
                .rpc();
        });

        onFinalized?.();
    };

    const busy =
        txState.status === "pending" || txState.status === "confirming";
    return (
        <div className="admin-action">
            <button onClick={finalize} disabled={busy}>
                {busy ? "Finalizing…" : "Finalize Proposal"}
            </button>
            {txState.error && <p className="error">{txState.error}</p>}
        </div>
    );
}

// ─── CancelProposal ───────────────────────────────────────────────────────────

interface CancelProposalProps {
    proposalPubkey: PublicKey;
    onCancelled?: () => void;
}

export function CancelProposal({
    proposalPubkey,
    onCancelled,
}: CancelProposalProps) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();

    const cancel = async () => {
        if (!program || !publicKey) return;
        const [daoPda] = pdaDao();

        await execute(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (program.methods as any)
                .cancelProposal()
                .accounts({
                    authority: publicKey,
                    dao: daoPda,
                    proposal: proposalPubkey,
                })
                .rpc();
        });

        onCancelled?.();
    };

    const busy =
        txState.status === "pending" || txState.status === "confirming";
    return (
        <div className="admin-action">
            <button onClick={cancel} disabled={busy} className="danger">
                {busy ? "Cancelling…" : "Cancel Proposal"}
            </button>
            {txState.error && <p className="error">{txState.error}</p>}
        </div>
    );
}

// ─── EmergencyPause ───────────────────────────────────────────────────────────

export function EmergencyPause({ paused }: { paused: boolean }) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();

    const toggle = async () => {
        if (!program || !publicKey) return;
        const [daoPda] = pdaDao();
        const [configPda] = pdaConfig();

        await execute(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (program.methods as any)
                .emergencyPause(!paused)
                .accounts({
                    authority: publicKey,
                    dao: daoPda,
                    config: configPda,
                })
                .rpc();
        });
    };

    const busy =
        txState.status === "pending" || txState.status === "confirming";
    return (
        <div className="admin-action">
            <button
                onClick={toggle}
                disabled={busy}
                className={paused ? "" : "danger"}
            >
                {busy
                    ? "Working…"
                    : paused
                      ? "▶ Resume DAO"
                      : "⏸ Emergency Pause"}
            </button>
            {txState.error && <p className="error">{txState.error}</p>}
        </div>
    );
}
