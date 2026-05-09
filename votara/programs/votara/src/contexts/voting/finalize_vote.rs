use anchor_lang::prelude::*;

use crate::{
    errors::VotaraError,
    state::{Analytics, Config, Dao, Proposal, ProposalStatus},
};

#[derive(Accounts)]
pub struct FinalizeVote<'info> {
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
        bump = config.bump
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [b"proposal", proposal.id.to_le_bytes().as_ref()],
        bump = proposal.bump,
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
