#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalStatus {
    Draft,
    Active,
    Passed,
    Rejected,
    Executed,
    Cancelled,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalType {
    General,
    Treasury,
    Governance,
    Upgrade,
    Emergency,
}

#[account]
pub struct Proposal {
    pub id: u64,

    pub creator: Pubkey,

    pub title: String,
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
