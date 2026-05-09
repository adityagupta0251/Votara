use anchor_lang::prelude::*;

use crate::{
    errors::VotaraError,
    state::{Analytics, Dao, Proposal, ProposalStatus, VoteRecord, Voter},
};

#[derive(Accounts)]
pub struct CastQuadraticVote<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"dao"],
        bump = dao.bump,
        constraint = dao.quadratic_voting_enabled
            @ VotaraError::QuadraticVotingDisabled
    )]
    pub dao: Account<'info, Dao>,

    #[account(
        mut,
        seeds = [b"proposal", proposal.id.to_le_bytes().as_ref()],
        bump = proposal.bump,
        constraint = proposal.status == ProposalStatus::Active
            @ VotaraError::ProposalClosed,
        constraint = proposal.quadratic_enabled
            @ VotaraError::QuadraticVotingDisabled
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
        bump = voter.bump,
        constraint = voter.tokens_staked > 0
            @ VotaraError::InsufficientTokens
    )]
    pub voter: Account<'info, Voter>,

    #[account(
        init,
        payer = authority,
        space = 8 + VoteRecord::INIT_SPACE,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    pub system_program: Program<'info, System>,
}
