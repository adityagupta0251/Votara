use anchor_lang::prelude::*;

use crate::{
    errors::VotaraError,
    state::{Dao, Proposal, ProposalStatus},
};

#[derive(Accounts)]
pub struct CancelProposal<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"dao"],
        bump = dao.bump
    )]
    pub dao: Account<'info, Dao>,

    #[account(
        mut,
        constraint = proposal.creator == authority.key()
            @ VotaraError::Unauthorized,
        constraint = proposal.status != ProposalStatus::Executed
            @ VotaraError::ProposalClosed,
        constraint = proposal.status != ProposalStatus::Cancelled
            @ VotaraError::ProposalClosed
    )]
    pub proposal: Account<'info, Proposal>,
}
