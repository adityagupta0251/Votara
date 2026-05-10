use anchor_lang::prelude::*;

use crate::{
    errors::VotaraError,
    state::{Analytics, Config, Dao, Proposal, Treasury, Voter},
};

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"dao"],
        bump = dao.bump,
        constraint = !dao.emergency_paused
            @ VotaraError::DaoPaused
    )]
    pub dao: Account<'info, Dao>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.dao == dao.key()
            @ VotaraError::InvalidProposal
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(
        init_if_needed,
        payer = creator,
        space = 8 + Voter::INIT_SPACE,
        seeds = [b"voter", creator.key().as_ref()],
        bump
    )]
    pub voter: Account<'info, Voter>,

    #[account(
        init,
        payer = creator,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = creator,
        space = 8 + Analytics::INIT_SPACE,
        seeds = [b"analytics", proposal.key().as_ref()],
        bump
    )]
    pub analytics: Account<'info, Analytics>,

    pub system_program: Program<'info, System>,
}

