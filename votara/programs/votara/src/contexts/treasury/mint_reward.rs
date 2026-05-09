use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{
    errors::VotaraError,
    state::{Analytics, Dao, Proposal, Treasury, Voter},
};

#[derive(Accounts)]
pub struct MintRewards<'info> {
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
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(
        mut,
        seeds = [b"proposal", proposal.id.to_le_bytes().as_ref()],
        bump = proposal.bump
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
        seeds = [b"voter", voter.authority.as_ref()],
        bump = voter.bump
    )]
    pub voter: Account<'info, Voter>,

    #[account(
        mut,
        seeds = [b"governance_mint"],
        bump
    )]
    pub governance_token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
