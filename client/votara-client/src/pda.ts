import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, SEED_DAO, SEED_CONFIG, SEED_TREASURY, SEED_GOV_MINT, SEED_VOTER, SEED_PROPOSAL, SEED_ANALYTICS, SEED_VOTE, SEED_VAULT } from "./constants/constant";
import { Buffer } from "buffer";
import { BN } from "@coral-xyz/anchor";

export function pdaDao(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(SEED_DAO)], PROGRAM_ID);
}

export function pdaConfig(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(SEED_CONFIG)], PROGRAM_ID);
}

export function pdaTreasury(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(SEED_TREASURY)], PROGRAM_ID);
}

export function pdaGovMint(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(SEED_GOV_MINT)], PROGRAM_ID);
}

export function pdaVault(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(SEED_VAULT)], PROGRAM_ID);
}

export function pdaVoter(authority: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_VOTER), authority.toBuffer()],
        PROGRAM_ID,
    );
}

export function pdaProposal(id: number | BN): [PublicKey, number] {
    const idBN = typeof id === "number" ? new BN(id) : id;
    const idBuffer = idBN.toArrayLike(Buffer, "le", 8);
    return PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_PROPOSAL), idBuffer],
        PROGRAM_ID,
    );
}

export function pdaAnalytics(proposal: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_ANALYTICS), proposal.toBuffer()],
        PROGRAM_ID,
    );
}

export function pdaVoteRecord(
    proposal: PublicKey,
    voterPda: PublicKey,
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_VOTE), proposal.toBuffer(), voterPda.toBuffer()],
        PROGRAM_ID,
    );
}
