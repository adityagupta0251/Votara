#[account]
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
