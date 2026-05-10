import { PublicKey, Connection } from "@solana/web3.js";
import {
    PROGRAM_ID,
    SEED_DAO,
    SEED_CONFIG,
    SEED_TREASURY,
    SEED_VOTER,
    SEED_PROPOSAL,
    SEED_ANALYTICS,
    SEED_VOTE,
    SEED_VAULT,
    SEED_GOV_MINT,
} from "../src/constants/constant";

function find(seeds: Buffer[]): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID);
}

export const pdaDao = () => find([SEED_DAO]);
export const pdaConfig = () => find([SEED_CONFIG]);
export const pdaTreasury = () => find([SEED_TREASURY]);
export const pdaVault = () => find([SEED_VAULT]);
export const pdaGovMint = () => find([SEED_GOV_MINT]);

export const pdaVoter = (authority: PublicKey) =>
    find([SEED_VOTER, authority.toBuffer()]);

export const pdaProposal = (id: bigint) => {
    const idBuf = Buffer.alloc(8);
    idBuf.writeBigUInt64LE(id);
    return find([SEED_PROPOSAL, idBuf]);
};

export const pdaAnalytics = (proposal: PublicKey) =>
    find([SEED_ANALYTICS, proposal.toBuffer()]);

export const pdaVoteRecord = (proposal: PublicKey, voter: PublicKey) =>
    find([SEED_VOTE, proposal.toBuffer(), voter.toBuffer()]);
