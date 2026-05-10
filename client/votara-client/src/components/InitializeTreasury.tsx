import { SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { pdaDao, pdaTreasury, pdaGovMint, pdaVault } from "../pda";

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
            <h3>Initialize DAO Treasury</h3>
            <p className="hint">
                This will create the DAO Treasury and Vault for governance
                tokens.
            </p>
            <button onClick={init} disabled={busy} className="btn">
                {busy ? "Initializing…" : "Initialize Treasury"}
            </button>
            {txState.error && <p className="error">{txState.error}</p>}
            {txState.status === "success" && (
                <p className="success">Treasury initialized!</p>
            )}
        </div>
    );
}
