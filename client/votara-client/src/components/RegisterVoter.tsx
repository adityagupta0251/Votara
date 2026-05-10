import { BN } from "@coral-xyz/anchor";
import { 
    TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction 
} from "@solana/spl-token";
import { Transaction, SystemProgram } from "@solana/web3.js";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { useVoter } from "../hooks/useVoter";
import { useTokenAccount } from "../hooks/useTokenAccount";
import { pdaDao, pdaVoter, pdaTreasury, pdaGovMint, pdaVault } from "../pda";

export function RegisterVoter() {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();
    const { exists, refetch } = useVoter();
    const userTokenAccount = useTokenAccount();

    const handleRegister = async () => {
        if (!program || !publicKey || !userTokenAccount) return;

        const [daoPda] = pdaDao();
        const [voterPda] = pdaVoter(publicKey);
        const [mintPda] = pdaGovMint();

        await execute(async () => {
            const tx = new Transaction();
            const connection = program.provider.connection;

            // Check if the user token account exists
            const accountInfo = await connection.getAccountInfo(userTokenAccount);
            
            if (!accountInfo) {
                // If the ATA doesn't exist, add the instruction to create it
                tx.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey,
                        userTokenAccount,
                        publicKey,
                        mintPda,
                        TOKEN_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    )
                );
            }

            // Add the stakeTokens(0) instruction which initializes the Voter PDA
            const stakeIx = await (program.methods as any)
                .stakeTokens(new BN(0))
                .accounts({
                    voterAuthority: publicKey,
                    dao: daoPda,
                    voter: voterPda,
                    treasury: (await pdaTreasury())[0],
                    governanceTokenMint: mintPda,
                    userTokenAccount: userTokenAccount,
                    vault: (await pdaVault())[0],
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .instruction();
            
            tx.add(stakeIx);

            // Send the transaction with both instructions
            return (program.provider as any).sendAndConfirm(tx);
        });

        await refetch();
    };

    if (exists) return null;

    const busy = txState.status === "pending" || txState.status === "confirming";

    return (
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-slate-400">
                    <span className="text-xl font-black">🆔</span>
                </div>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-2">Institutional Onboarding</h3>
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
