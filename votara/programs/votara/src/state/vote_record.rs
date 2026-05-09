#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VoteType {
    Yes,
    No,
    Abstain,
}

#[account]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,

    pub vote: VoteType,

    pub voting_power_used: u64,

    pub quadratic_cost: u64,

    pub delegated_vote: bool,

    pub transaction_signature: String,

    pub created_at: i64,

    pub bump: u8,
}
