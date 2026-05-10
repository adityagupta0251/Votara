use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{
    errors::VotaraError,
    state::{Dao, Treasury, Voter},
};

/// Lets a user purchase governance tokens from the treasury vault.
#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        seeds = [b"dao"],
        bump = dao.bump,
        constraint = !dao.emergency_paused
            @ VotaraError::DaoPaused
    )]
    pub dao: Account<'info, Dao>,

    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + Voter::INIT_SPACE,
        seeds = [b"voter", buyer.key().as_ref()],
        bump
    )]
    pub voter: Account<'info, Voter>,

    #[account(
        mut,
        seeds = [b"governance_mint"],
        bump
    )]
    pub governance_token_mint: Account<'info, Mint>,

    /// The vault token account that holds the governance tokens for sale.
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    /// The buyer's token account that will receive the purchased tokens.
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
