use anchor_lang::prelude::*;

// ============================================================================
// Enums
// ============================================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum VoteType {
    Yes,
    No,
    Abstain,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ProposalStatus {
    Draft,
    Active,
    Passed,
    Rejected,
    Executed,
    Cancelled,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ProposalType {
    General,
    Treasury,
    Governance,
    Upgrade,
    Emergency,
}

// ============================================================================
// Account Structs
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct Dao {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub total_voters: u64,
    pub total_proposals: u64,
    pub total_votes: u64,
    pub governance_token_mint: Pubkey,
    pub proposal_fee: u64,
    pub minimum_tokens_to_propose: u64,
    pub quadratic_voting_enabled: bool,
    pub emergency_paused: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub dao: Pubkey,
    pub voting_period: i64,
    pub timelock_period: i64,
    pub quorum_percentage: u8,
    pub approval_threshold: u8,
    pub max_title_length: u16,
    pub max_description_length: u16,
    pub laserstream_enabled: bool,
    pub treasury_fee_bps: u16,
    pub updated_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Voter {
    pub authority: Pubkey,
    pub voting_power: u64,
    pub reputation_score: u64,
    pub delegated_to: Option<Pubkey>,
    pub total_votes_cast: u64,
    pub total_proposals_created: u64,
    pub tokens_staked: u64,
    pub last_vote_timestamp: i64,
    pub is_verified: bool,
    pub is_banned: bool,
    pub registered_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    pub id: u64,
    pub creator: Pubkey,
    #[max_len(100)]
    pub title: String,
    #[max_len(1000)]
    pub description: String,
    pub proposal_type: ProposalType,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub abstain_votes: u64,
    pub unique_voters: u64,
    pub quorum_reached: bool,
    pub status: ProposalStatus,
    pub start_time: i64,
    pub end_time: i64,
    pub execution_time: i64,
    pub treasury_amount: u64,
    pub quadratic_enabled: bool,
    pub token_gated: bool,
    pub minimum_tokens_required: u64,
    pub winner_wallet: Option<Pubkey>,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote: VoteType,
    pub voting_power_used: u64,
    pub quadratic_cost: u64,
    pub delegated_vote: bool,
    #[max_len(88)]
    pub transaction_signature: String,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Treasury {
    pub authority: Pubkey,
    pub total_sol: u64,
    pub total_tokens: u64,
    pub locked_amount: u64,
    pub proposal_fees_collected: u64,
    pub reward_pool: u64,
    pub multisig_enabled: bool,
    pub signer_count: u8,
    pub threshold: u8,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Analytics {
    pub proposal: Pubkey,
    pub live_yes_votes: u64,
    pub live_no_votes: u64,
    pub live_abstain_votes: u64,
    pub active_viewers: u64,
    pub last_vote_timestamp: i64,
    pub realtime_sync_nonce: u64,
    pub bump: u8,
}
