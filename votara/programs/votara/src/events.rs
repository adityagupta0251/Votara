use anchor_lang::prelude::*;

#[event]
pub struct VoteCastEvent {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote_type: u8,
    pub voting_power: u64,
    pub timestamp: i64,
}

#[event]
pub struct ProposalCreatedEvent {
    pub proposal: Pubkey,
    pub creator: Pubkey,
    pub title: String,
    pub timestamp: i64,
}

#[event]
pub struct ProposalFinalizedEvent {
    pub proposal: Pubkey,
    pub passed: bool,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryWithdrawEvent {
    pub authority: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct TokensStakedEvent {
    pub voter: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct VoteDelegatedEvent {
    pub voter: Pubkey,
    pub delegate: Pubkey,
    pub timestamp: i64,
}
