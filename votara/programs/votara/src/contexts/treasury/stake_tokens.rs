use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{
    errors::VotaraError,
    state::{Dao, Treasury, Voter},
};

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(mut)]
    pub voter_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"dao"],
        bump = dao.bump,
        constraint = !dao.emergency_paused
            @ VotaraError::DaoPaused
    )]
    pub dao: Account<'info, Dao>,

    #[account(
        init_if_needed,
        payer = voter_authority,
        space = 8 + Voter::INIT_SPACE,
        seeds = [b"voter", voter_authority.key().as_ref()],
        bump
    )]
    pub voter: Account<'info, Voter>,

    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(
        mut,
        seeds = [b"governance_mint"],
        bump
    )]
    pub governance_token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
