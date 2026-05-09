use anchor_lang::prelude::*;

use crate::{
    errors::VotaraError,
    state::{Config, Dao},
};

#[derive(Accounts)]
pub struct EmergencyPause<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"dao"],
        bump = dao.bump,
        constraint = dao.authority == authority.key()
            @ VotaraError::Unauthorized
    )]
    pub dao: Account<'info, Dao>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.dao == dao.key()
            @ VotaraError::InvalidProposal
    )]
    pub config: Account<'info, Config>,
}

