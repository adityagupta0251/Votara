import { PublicKey } from "@solana/web3.js";
import type BN from "bn.js";

// ─── Enums ───────────────────────────────────────────────────────────────────

export type VoteType =
    | { yes: Record<string, never> }
    | { no: Record<string, never> }
    | { abstain: Record<string, never> };

export type ProposalStatus =
    | { draft: Record<string, never> }
    | { active: Record<string, never> }
    | { passed: Record<string, never> }
    | { rejected: Record<string, never> }
    | { executed: Record<string, never> }
    | { cancelled: Record<string, never> }
    | { expired: Record<string, never> };

export type ProposalType =
    | { general: Record<string, never> }
    | { treasury: Record<string, never> }
    | { governance: Record<string, never> }
    | { upgrade: Record<string, never> }
    | { emergency: Record<string, never> };

// ─── On-chain account shapes ─────────────────────────────────────────────────

export interface DaoAccount {
    authority: PublicKey;
    treasury: PublicKey;
    totalVoters: BN;
    totalProposals: BN;
    totalVotes: BN;
    governanceTokenMint: PublicKey;
    proposalFee: BN;
    minimumTokensToPropose: BN;
    quadraticVotingEnabled: boolean;
    emergencyPaused: boolean;
    createdAt: BN;
    bump: number;
}

export interface ConfigAccount {
    dao: PublicKey;
    votingPeriod: BN;
    timelockPeriod: BN;
    quorumPercentage: number;
    approvalThreshold: number;
    maxTitleLength: number;
    maxDescriptionLength: number;
    laserstreamEnabled: boolean;
    treasuryFeeBps: number;
    updatedAt: BN;
    bump: number;
}

export interface TreasuryAccount {
    authority: PublicKey;
    totalSol: BN;
    totalTokens: BN;
    lockedAmount: BN;
    proposalFeesCollected: BN;
    rewardPool: BN;
    multisigEnabled: boolean;
    signerCount: number;
    threshold: number;
    createdAt: BN;
    bump: number;
}

export interface ProposalAccount {
    id: BN;
    creator: PublicKey;
    title: string;
    description: string;
    proposalType: ProposalType;
    yesVotes: BN;
    noVotes: BN;
    abstainVotes: BN;
    uniqueVoters: BN;
    quorumReached: boolean;
    status: ProposalStatus;
    startTime: BN;
    endTime: BN;
    executionTime: BN;
    treasuryAmount: BN;
    quadraticEnabled: boolean;
    tokenGated: boolean;
    minimumTokensRequired: BN;
    winnerWallet: PublicKey | null;
    createdAt: BN;
    bump: number;
}

export interface VoterAccount {
    authority: PublicKey;
    votingPower: BN;
    reputationScore: BN;
    delegatedTo: PublicKey | null;
    totalVotesCast: BN;
    totalProposalsCreated: BN;
    tokensStaked: BN;
    lastVoteTimestamp: BN;
    isVerified: boolean;
    isBanned: boolean;
    registeredAt: BN;
    bump: number;
}

export interface VoteRecordAccount {
    proposal: PublicKey;
    voter: PublicKey;
    vote: VoteType;
    votingPowerUsed: BN;
    quadraticCost: BN;
    delegatedVote: boolean;
    transactionSignature: string;
    createdAt: BN;
    bump: number;
}

export interface AnalyticsAccount {
    proposal: PublicKey;
    liveYesVotes: BN;
    liveNoVotes: BN;
    liveAbstainVotes: BN;
    activeViewers: BN;
    lastVoteTimestamp: BN;
    realtimeSyncNonce: BN;
    bump: number;
}

// ─── UI / helper types ───────────────────────────────────────────────────────

export interface ProposalWithPubkey {
    pubkey: PublicKey;
    account: ProposalAccount;
}

export interface VoterWithPubkey {
    pubkey: PublicKey;
    account: VoterAccount;
}

// Resolved label helpers
export type ProposalStatusLabel =
    | "Draft"
    | "Active"
    | "Passed"
    | "Rejected"
    | "Executed"
    | "Cancelled"
    | "Expired";
export type ProposalTypeLabel =
    | "General"
    | "Treasury"
    | "Governance"
    | "Upgrade"
    | "Emergency";
export type VoteTypeLabel = "Yes" | "No" | "Abstain";

export function resolveProposalStatus(s: ProposalStatus): ProposalStatusLabel {
    if ("draft" in s) return "Draft";
    if ("active" in s) return "Active";
    if ("passed" in s) return "Passed";
    if ("rejected" in s) return "Rejected";
    if ("executed" in s) return "Executed";
    if ("cancelled" in s) return "Cancelled";
    return "Expired";
}

export function resolveProposalType(t: ProposalType): ProposalTypeLabel {
    if ("general" in t) return "General";
    if ("treasury" in t) return "Treasury";
    if ("governance" in t) return "Governance";
    if ("upgrade" in t) return "Upgrade";
    return "Emergency";
}

export function resolveVoteType(v: VoteType): VoteTypeLabel {
    if ("yes" in v) return "Yes";
    if ("no" in v) return "No";
    return "Abstain";
}
