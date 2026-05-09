#[account]
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
