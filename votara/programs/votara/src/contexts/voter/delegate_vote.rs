use anchor_lang::prelude::*;

use crate::{
    errors::VotaraError,
    state::{Dao, Voter},
};

#[derive(Accounts)]
pub struct DelegateVote<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"dao"],
        bump = dao.bump,
        constraint = !dao.emergency_paused
            @ VotaraError::DaoPaused
    )]
    pub dao: Account<'info, Dao>,

    #[account(
        mut,
        seeds = [b"voter", authority.key().as_ref()],
        bump = voter.bump,
        constraint = !voter.is_banned
            @ VotaraError::Unauthorized
    )]
    pub voter: Account<'info, Voter>,

    #[account(
        mut,
        seeds = [b"voter", delegate.key().as_ref()],
        bump = delegate.bump,
        constraint = !delegate.is_banned
            @ VotaraError::Unauthorized
    )]
    pub delegate: Account<'info, Voter>,
}
