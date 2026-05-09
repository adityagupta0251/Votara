use anchor_lang::prelude::*;

use crate::{
    errors::VotaraError,
    state::{Dao, Voter},
};

#[derive(Accounts)]
pub struct CloseVoter<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"dao"],
        bump = dao.bump
    )]
    pub dao: Account<'info, Dao>,

    #[account(
        mut,
        close = authority,
        seeds = [b"voter", authority.key().as_ref()],
        bump = voter.bump,
        constraint = voter.authority == authority.key()
            @ VotaraError::Unauthorized
    )]
    pub voter: Account<'info, Voter>,
}

