import { BN } from "@coral-xyz/anchor";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Transaction, SystemProgram } from "@solana/web3.js";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { useVoter } from "../hooks/useVoter";
import { pdaDao, pdaVoter, pdaTreasury, pdaVault } from "../pda";

export function RegisterVoter() {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();
    const { exists, refetch } = useVoter();

    const handleRegister = async () => {
        if (!program || !publicKey) return;

        const [daoPda] = pdaDao();
        const [voterPda] = pdaVoter(publicKey);
        const [treasuryPda] = pdaTreasury();
        const [vaultPda] = pdaVault();

        await execute(async () => {
            const tx = new Transaction();
            const connection = program.provider.connection;

            // 1. Fetch the treasury – this will fail if treasury not initialized
            let treasury;
            try {
                treasury = await (program.account as any).treasury.fetch(treasuryPda);
            } catch (err) {
                throw new Error(
                    "Treasury not initialized. Please run 'Initialize Treasury' first."
                );
            }
            const realMint = treasury.governanceTokenMint;

            // 2. Derive the correct associated token address for this user and real mint
            const ata = await getAssociatedTokenAddress(
                realMint,
                publicKey,
                false,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );

            // 3. Check if ATA exists, create if missing
            const accountInfo = await connection.getAccountInfo(ata);
            if (!accountInfo) {
                tx.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey,   // payer
                        ata,         // ATA address
                        publicKey,   // owner
                        realMint,    // real mint
                        TOKEN_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    )
                );
            }

            // 4. Stake instruction (zero stake to initialize voter PDA)
            const stakeIx = await (program.methods as any)
                .stakeTokens(new BN(0))
                .accounts({
                    voterAuthority: publicKey,
                    dao: daoPda,
                    voter: voterPda,
                    treasury: treasuryPda,
                    governanceTokenMint: realMint,
                    userTokenAccount: ata,   // derived ATA
                    vault: vaultPda,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .instruction();

            tx.add(stakeIx);

            return (program.provider as any).sendAndConfirm(tx);
        });

        await refetch();
    };

    if (exists) return null;

    const busy = txState.status === "sending" || txState.status === "confirming";

    return (
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-slate-400">
                    <span className="text-xl font-black">🆔</span>
                </div>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-2">
                    Institutional Onboarding
                </h3>
                <p className="text-[10px] text-slate-500 mb-6 max-w-[200px] font-bold leading-relaxed">
                    Initialize your voter profile to participate in quadratic governance and treasury allocations.
                </p>
                <button
                    onClick={handleRegister}
                    disabled={busy}
                    className="premium-btn btn-slate w-full py-3 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    {busy ? "Syncing..." : "Register Voter"}
                </button>
                {txState.error && (
                    <div className="mt-4 p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-[9px] text-red-400 font-bold">
                        {txState.error}
                    </div>
                )}
            </div>
        </div>
    );
}