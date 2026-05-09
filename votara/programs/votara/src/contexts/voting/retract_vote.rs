use anchor_lang::prelude::*;

use crate::{
    errors::VotaraError,
    state::{Analytics, Dao, Proposal, ProposalStatus, VoteRecord, Voter},
};

#[derive(Accounts)]
pub struct RetractVote<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"dao"],
        bump = dao.bump
    )]
    pub dao: Account<'info, Dao>,

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

    #[account(
        mut,
        seeds = [b"voter", authority.key().as_ref()],
        bump = voter.bump
    )]
    pub voter: Account<'info, Voter>,

    #[account(
        mut,
        close = authority,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump = vote_record.bump,
        constraint = vote_record.voter == voter.key()
            @ VotaraError::Unauthorized
    )]
    pub vote_record: Account<'info, VoteRecord>,
}
