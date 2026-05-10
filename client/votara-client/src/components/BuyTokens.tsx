import { useState } from "react";
import { SystemProgram, type PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useProgram } from "../program";
import { useWallet } from "../wallet";
import { useTransaction } from "../hooks/useTransaction";
import { pdaDao, pdaTreasury, pdaVoter, pdaGovMint, pdaVault } from "../pda";

interface Props {
    buyerTokenAccount: PublicKey; // ATA of the connected wallet for governance token
}

export function BuyTokens({ buyerTokenAccount }: Props) {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const { execute, txState } = useTransaction();
    const [amount, setAmount] = useState("100");

    const handleBuy = async () => {
        if (!program || !publicKey) return;

        const [daoPda] = pdaDao();
        const [treasuryPda] = pdaTreasury();
        const [voterPda] = pdaVoter(publicKey);
        const [mintPda] = pdaGovMint();
        const [vaultPda] = pdaVault();

        await execute(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (program.methods as any)
                .buyTokens(new BN(amount))
                .accounts({
                    buyer: publicKey,
                    dao: daoPda,
                    treasury: treasuryPda,
                    voter: voterPda,
                    governanceTokenMint: mintPda,
                    vault: vaultPda,
                    buyerTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
        });
    };

    const busy =
        txState.status === "pending" || txState.status === "confirming";

    return (
        <div className="buy-tokens">
            <h3>Buy Governance Tokens</h3>
            <label>
                Amount
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                />
            </label>
            <button onClick={handleBuy} disabled={busy}>
                {busy ? "Processing…" : "Buy Tokens"}
            </button>
            {txState.error && <p className="error">{txState.error}</p>}
        </div>
    );
}
