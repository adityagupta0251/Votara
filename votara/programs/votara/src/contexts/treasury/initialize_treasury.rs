use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{
    errors::VotaraError,
    state::{Dao, Treasury},
};

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
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
        init,
        payer = authority,
        space = 8 + Treasury::INIT_SPACE,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = authority,
        seeds = [b"governance_mint"],
        bump
    )]
    pub governance_token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = governance_token_mint,
        token::authority = treasury,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

