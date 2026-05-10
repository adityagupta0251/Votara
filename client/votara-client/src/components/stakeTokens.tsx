import { useState } from "react";
import { type PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { pdaDao, pdaTreasury, pdaVoter, pdaGovMint, pdaVault } from "../pda";

interface Props {
    userTokenAccount: PublicKey;
    onStaked?: () => void;
}

export function StakeTokens({ userTokenAccount, onStaked }: Props) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();
    const [amount, setAmount] = useState("10");

    const handleStake = async () => {
        if (!program || !publicKey) return;

        const [daoPda] = pdaDao();
        const [voterPda] = pdaVoter(publicKey);
        const [treasuryPda] = pdaTreasury();
        const [mintPda] = pdaGovMint();
        const [vaultPda] = pdaVault();

        await execute(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (program.methods as any)
                .stakeTokens(new BN(amount))
                .accounts({
                    voterAuthority: publicKey,
                    dao: daoPda,
                    voter: voterPda,
                    treasury: treasuryPda,
                    governanceTokenMint: mintPda,
                    userTokenAccount,
                    vault: vaultPda,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();
        });

        onStaked?.();
    };

    const busy =
        txState.status === "pending" || txState.status === "confirming";

    return (
        <div className="stake-tokens">
            <h3>Stake Tokens</h3>
            <label>
                Amount
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                />
            </label>
            <button onClick={handleStake} disabled={busy}>
                {busy ? "Staking…" : "Stake"}
            </button>
            {txState.error && <p className="error">{txState.error}</p>}
        </div>
    );
}
