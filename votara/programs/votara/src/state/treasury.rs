#[account]
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
