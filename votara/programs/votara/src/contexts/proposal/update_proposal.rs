use anchor_lang::prelude::*;

use crate::{
    errors::VotaraError,
    state::{Dao, Proposal, ProposalStatus},
};

/// Allows the proposal creator to update the title/description
/// while the proposal is still in Draft status.
#[derive(Accounts)]
pub struct UpdateProposal<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        seeds = [b"dao"],
        bump = dao.bump,
        constraint = !dao.emergency_paused
            @ VotaraError::DaoPaused
    )]
    pub dao: Account<'info, Dao>,

    #[account(
        mut,
        constraint = proposal.creator == creator.key()
            @ VotaraError::Unauthorized,
        constraint = proposal.status == ProposalStatus::Draft
            @ VotaraError::ProposalAlreadyActive
    )]
    pub proposal: Account<'info, Proposal>,
}
