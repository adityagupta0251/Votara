use anchor_lang::prelude::*;

#[account]
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
