use anchor_lang::prelude::*;

use crate::{
    errors::VotaraError,
    state::{Analytics, Config, Dao, Proposal, ProposalStatus, Treasury},
};

/// Finalizes a proposal after the voting period has ended,
/// tallying results and transitioning status to Passed/Rejected/Expired.
#[derive(Accounts)]
pub struct FinalizeProposal<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"dao"],
        bump = dao.bump,
        constraint = dao.authority == authority.key()
            @ VotaraError::Unauthorized
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
        mut,
        constraint = proposal.status == ProposalStatus::Active
            @ VotaraError::ProposalClosed
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        mut,
        seeds = [b"analytics", proposal.key().as_ref()],
        bump = analytics.bump
    )]
    pub analytics: Account<'info, Analytics>,
}
