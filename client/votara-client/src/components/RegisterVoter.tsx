import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
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

        await execute(async () => {
            // In this program version, a voter account is initialized when staking tokens.
            // We use stakeTokens with 0 amount as an 'initialization' or 'registration' step.
            // Note: This requires the user to have a token account (even with 0 balance).
            return (program.methods as any)
                .stakeTokens(new BN(0))
                .accounts({
                    voterAuthority: publicKey,
                    dao: daoPda,
                    voter: voterPda,
                    // These are additional accounts required by stake_tokens
                    treasury: (await pdaTreasury())[0],
                    governanceTokenMint: (await pdaGovMint())[0],
                    userTokenAccount: userTokenAccount,
                    vault: (await pdaVault())[0],
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();
        });

        await refetch();
    };

    if (exists) return null;

    const busy = txState.status === "pending" || txState.status === "confirming";

    return (
        <div className="p-6 bg-[#aa3bff]/5 border border-[#aa3bff]/20 rounded-2xl animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#aa3bff]/10 rounded-full flex items-center justify-center mb-4 text-2xl">
                    🆔
                </div>
                <h3 className="text-lg font-bold mb-2">Join the DAO</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-[200px]">
                    You need to register your voter account before you can cast votes or create proposals.
                </p>
                <button
                    onClick={handleRegister}
                    disabled={busy}
                    className="btn-primary w-full"
                >
                    {busy ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Registering…
                        </span>
                    ) : "Register Now"}
                </button>
                {txState.error && (
                    <p className="mt-3 text-xs text-red-400">⚠️ {txState.error}</p>
                )}
            </div>
        </div>
    );
}
