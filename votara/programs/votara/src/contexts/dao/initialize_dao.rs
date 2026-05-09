use anchor_lang::prelude::*;

use crate::state::{Config, Dao};

#[derive(Accounts)]
pub struct InitializeDao<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Dao::INIT_SPACE,
        seeds = [b"dao"],
        bump
    )]
    pub dao: Account<'info, Dao>,

    #[account(
        init,
        payer = authority,
        space = 8 + Config::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
}
