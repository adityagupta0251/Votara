#[account]
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
