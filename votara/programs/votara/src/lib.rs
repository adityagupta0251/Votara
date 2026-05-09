use anchor_lang::prelude::*;

pub mod contexts;
pub mod errors;
pub mod events;
pub mod state;

pub use contexts::*;
pub use errors::*;
pub use events::*;
pub use state::*;

declare_id!("4s8kSwWN26t3DjKNNBgcypAvG7MedaMsdrHZGbBQy525");

#[program]
pub mod votara {
    use super::*;

    // ============================================================================
    // DAO Management Instructions
    // ============================================================================

    pub fn initialize_dao(ctx: Context<InitializeDao>) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let config = &mut ctx.accounts.config;
        let authority = &ctx.accounts.authority;

        let clock = Clock::get()?;

        dao.authority = authority.key();
        dao.treasury = Pubkey::default(); // set after InitializeTreasury
        dao.total_voters = 0;
        dao.total_proposals = 0;
        dao.total_votes = 0;
        dao.governance_token_mint = Pubkey::default(); // set after InitializeTreasury
        dao.proposal_fee = 1_000_000; // 0.001 SOL in lamports
        dao.minimum_tokens_to_propose = 100;
        dao.quadratic_voting_enabled = false;
        dao.emergency_paused = false;
        dao.created_at = clock.unix_timestamp;
        dao.bump = ctx.bumps.dao;

        config.dao = dao.key();
        config.voting_period = 7 * 24 * 60 * 60; // 7 days
        config.timelock_period = 2 * 24 * 60 * 60; // 2 days
        config.quorum_percentage = 10;
        config.approval_threshold = 51;
        config.max_title_length = 100;
        config.max_description_length = 1000;
        config.laserstream_enabled = false;
        config.treasury_fee_bps = 100; // 1%
        config.updated_at = clock.unix_timestamp;
        config.bump = ctx.bumps.config;

        Ok(())
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        voting_period: Option<i64>,
        timelock_period: Option<i64>,
        quorum_percentage: Option<u8>,
        approval_threshold: Option<u8>,
        quadratic_voting_enabled: Option<bool>,
        laserstream_enabled: Option<bool>,
        treasury_fee_bps: Option<u16>,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let config = &mut ctx.accounts.config;
        let clock = Clock::get()?;

        if let Some(vp) = voting_period {
            config.voting_period = vp;
        }
        if let Some(tl) = timelock_period {
            config.timelock_period = tl;
        }
        if let Some(q) = quorum_percentage {
            config.quorum_percentage = q;
        }
        if let Some(at) = approval_threshold {
            config.approval_threshold = at;
        }
        if let Some(qv) = quadratic_voting_enabled {
            dao.quadratic_voting_enabled = qv;
        }
        if let Some(ls) = laserstream_enabled {
            config.laserstream_enabled = ls;
        }
        if let Some(fee) = treasury_fee_bps {
            config.treasury_fee_bps = fee;
        }

        config.updated_at = clock.unix_timestamp;
        Ok(())
    }

    pub fn emergency_pause(ctx: Context<EmergencyPause>, paused: bool) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        dao.emergency_paused = paused;
        Ok(())
    }

    // ============================================================================
    // Proposal Management Instructions
    // ============================================================================

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        proposal_id: u64,
        title: String,
        description: String,
        proposal_type: ProposalType,
        treasury_amount: u64,
        quadratic_enabled: bool,
        token_gated: bool,
        minimum_tokens_required: u64,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let config = &ctx.accounts.config;
        let voter = &mut ctx.accounts.voter;
        let proposal = &mut ctx.accounts.proposal;
        let analytics = &mut ctx.accounts.analytics;
        let clock = Clock::get()?;

        require!(
            title.len() <= config.max_title_length as usize,
            VotaraError::TitleTooLong
        );
        require!(
            description.len() <= config.max_description_length as usize,
            VotaraError::DescriptionTooLong
        );

        proposal.id = proposal_id;
        proposal.creator = ctx.accounts.creator.key();
        proposal.title = title.clone();
        proposal.description = description;
        proposal.proposal_type = proposal_type;
        proposal.yes_votes = 0;
        proposal.no_votes = 0;
        proposal.abstain_votes = 0;
        proposal.unique_voters = 0;
        proposal.quorum_reached = false;
        proposal.status = ProposalStatus::Active;
        proposal.start_time = clock.unix_timestamp;
        proposal.end_time = clock.unix_timestamp + config.voting_period;
        proposal.execution_time = clock.unix_timestamp + config.voting_period + config.timelock_period;
        proposal.treasury_amount = treasury_amount;
        proposal.quadratic_enabled = quadratic_enabled;
        proposal.token_gated = token_gated;
        proposal.minimum_tokens_required = minimum_tokens_required;
        proposal.winner_wallet = None;
        proposal.created_at = clock.unix_timestamp;
        proposal.bump = ctx.bumps.proposal;

        analytics.proposal = proposal.key();
        analytics.live_yes_votes = 0;
        analytics.live_no_votes = 0;
        analytics.live_abstain_votes = 0;
        analytics.active_viewers = 0;
        analytics.last_vote_timestamp = clock.unix_timestamp;
        analytics.realtime_sync_nonce = 0;
        analytics.bump = ctx.bumps.analytics;

        voter.total_proposals_created = voter
            .total_proposals_created
            .checked_add(1)
            .ok_or(VotaraError::Overflow)?;

        dao.total_proposals = dao
            .total_proposals
            .checked_add(1)
            .ok_or(VotaraError::Overflow)?;

        emit!(ProposalCreatedEvent {
            proposal: proposal.key(),
            creator: ctx.accounts.creator.key(),
            title,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn update_proposal(
        ctx: Context<UpdateProposal>,
        title: Option<String>,
        description: Option<String>,
    ) -> Result<()> {
        let config_max_title = 100usize;
        let config_max_desc = 1000usize;
        let proposal = &mut ctx.accounts.proposal;

        if let Some(t) = title {
            require!(t.len() <= config_max_title, VotaraError::TitleTooLong);
            proposal.title = t;
        }
        if let Some(d) = description {
            require!(d.len() <= config_max_desc, VotaraError::DescriptionTooLong);
            proposal.description = d;
        }

        Ok(())
    }

    pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        proposal.status = ProposalStatus::Cancelled;
        Ok(())
    }

    pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
        let config = &ctx.accounts.config;
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp >= proposal.end_time,
            VotaraError::VotingPeriodNotEnded
        );

        let total_votes = proposal
            .yes_votes
            .checked_add(proposal.no_votes)
            .and_then(|v| v.checked_add(proposal.abstain_votes))
            .ok_or(VotaraError::Overflow)?;

        let quorum_met = if total_votes == 0 {
            false
        } else {
            // quorum is % of unique voters relative to total DAO voters — simplified check here
            proposal.unique_voters >= config.quorum_percentage as u64
        };

        proposal.quorum_reached = quorum_met;

        if !quorum_met {
            proposal.status = ProposalStatus::Rejected;
        } else {
            let approval = if total_votes == 0 {
                0u64
            } else {
                proposal
                    .yes_votes
                    .checked_mul(100)
                    .ok_or(VotaraError::Overflow)?
                    / total_votes
            };

            proposal.status = if approval >= config.approval_threshold as u64 {
                ProposalStatus::Passed
            } else {
                ProposalStatus::Rejected
            };
        }

        emit!(ProposalFinalizedEvent {
            proposal: proposal.key(),
            passed: proposal.status == ProposalStatus::Passed,
            yes_votes: proposal.yes_votes,
            no_votes: proposal.no_votes,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // ============================================================================
    // Voting Instructions
    // ============================================================================

    pub fn cast_vote(ctx: Context<CastVote>, vote: VoteType) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let proposal = &mut ctx.accounts.proposal;
        let voter = &mut ctx.accounts.voter;
        let vote_record = &mut ctx.accounts.vote_record;
        let analytics = &mut ctx.accounts.analytics;
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp < proposal.end_time,
            VotaraError::ProposalClosed
        );

        if proposal.token_gated {
            require!(
                voter.tokens_staked >= proposal.minimum_tokens_required,
                VotaraError::InsufficientTokens
            );
        }

        let power = voter.voting_power;

        match vote {
            VoteType::Yes => {
                proposal.yes_votes = proposal.yes_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
                analytics.live_yes_votes = analytics.live_yes_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
            }
            VoteType::No => {
                proposal.no_votes = proposal.no_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
                analytics.live_no_votes = analytics.live_no_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
            }
            VoteType::Abstain => {
                proposal.abstain_votes = proposal.abstain_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
                analytics.live_abstain_votes = analytics.live_abstain_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
            }
        }

        proposal.unique_voters = proposal.unique_voters.checked_add(1).ok_or(VotaraError::Overflow)?;
        dao.total_votes = dao.total_votes.checked_add(1).ok_or(VotaraError::Overflow)?;

        voter.total_votes_cast = voter.total_votes_cast.checked_add(1).ok_or(VotaraError::Overflow)?;
        voter.last_vote_timestamp = clock.unix_timestamp;

        vote_record.proposal = proposal.key();
        vote_record.voter = voter.key();
        vote_record.vote = vote.clone();
        vote_record.voting_power_used = power;
        vote_record.quadratic_cost = 0;
        vote_record.delegated_vote = false;
        vote_record.transaction_signature = String::new();
        vote_record.created_at = clock.unix_timestamp;
        vote_record.bump = ctx.bumps.vote_record;

        analytics.last_vote_timestamp = clock.unix_timestamp;
        analytics.realtime_sync_nonce = analytics.realtime_sync_nonce.checked_add(1).ok_or(VotaraError::Overflow)?;

        emit!(VoteCastEvent {
            proposal: proposal.key(),
            voter: voter.key(),
            vote_type: match vote {
                VoteType::Yes => 0,
                VoteType::No => 1,
                VoteType::Abstain => 2,
            },
            voting_power: power,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn cast_quadratic_vote(
        ctx: Context<CastQuadraticVote>,
        vote: VoteType,
        vote_amount: u64,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let proposal = &mut ctx.accounts.proposal;
        let voter = &mut ctx.accounts.voter;
        let vote_record = &mut ctx.accounts.vote_record;
        let analytics = &mut ctx.accounts.analytics;
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp < proposal.end_time,
            VotaraError::ProposalClosed
        );

        // Quadratic cost = vote_amount^2
        let quadratic_cost = vote_amount.checked_mul(vote_amount).ok_or(VotaraError::Overflow)?;
        require!(voter.tokens_staked >= quadratic_cost, VotaraError::InsufficientTokens);

        // Voting power for quadratic = sqrt(vote_amount) ≈ vote_amount (simplified to vote_amount for on-chain)
        let power = vote_amount;

        match vote {
            VoteType::Yes => {
                proposal.yes_votes = proposal.yes_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
                analytics.live_yes_votes = analytics.live_yes_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
            }
            VoteType::No => {
                proposal.no_votes = proposal.no_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
                analytics.live_no_votes = analytics.live_no_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
            }
            VoteType::Abstain => {
                proposal.abstain_votes = proposal.abstain_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
                analytics.live_abstain_votes = analytics.live_abstain_votes.checked_add(power).ok_or(VotaraError::Overflow)?;
            }
        }

        proposal.unique_voters = proposal.unique_voters.checked_add(1).ok_or(VotaraError::Overflow)?;
        dao.total_votes = dao.total_votes.checked_add(1).ok_or(VotaraError::Overflow)?;

        voter.total_votes_cast = voter.total_votes_cast.checked_add(1).ok_or(VotaraError::Overflow)?;
        voter.last_vote_timestamp = clock.unix_timestamp;
        // Deduct quadratic cost from staked tokens
        voter.tokens_staked = voter.tokens_staked.checked_sub(quadratic_cost).ok_or(VotaraError::Underflow)?;

        vote_record.proposal = proposal.key();
        vote_record.voter = voter.key();
        vote_record.vote = vote.clone();
        vote_record.voting_power_used = power;
        vote_record.quadratic_cost = quadratic_cost;
        vote_record.delegated_vote = false;
        vote_record.transaction_signature = String::new();
        vote_record.created_at = clock.unix_timestamp;
        vote_record.bump = ctx.bumps.vote_record;

        analytics.last_vote_timestamp = clock.unix_timestamp;
        analytics.realtime_sync_nonce = analytics.realtime_sync_nonce.checked_add(1).ok_or(VotaraError::Overflow)?;

        emit!(VoteCastEvent {
            proposal: proposal.key(),
            voter: voter.key(),
            vote_type: match vote {
                VoteType::Yes => 0,
                VoteType::No => 1,
                VoteType::Abstain => 2,
            },
            voting_power: power,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn retract_vote(ctx: Context<RetractVote>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let voter = &mut ctx.accounts.voter;
        let vote_record = &ctx.accounts.vote_record;
        let analytics = &mut ctx.accounts.analytics;
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp < proposal.end_time,
            VotaraError::ProposalClosed
        );

        let power = vote_record.voting_power_used;

        match vote_record.vote {
            VoteType::Yes => {
                proposal.yes_votes = proposal.yes_votes.checked_sub(power).ok_or(VotaraError::Underflow)?;
                analytics.live_yes_votes = analytics.live_yes_votes.checked_sub(power).ok_or(VotaraError::Underflow)?;
            }
            VoteType::No => {
                proposal.no_votes = proposal.no_votes.checked_sub(power).ok_or(VotaraError::Underflow)?;
                analytics.live_no_votes = analytics.live_no_votes.checked_sub(power).ok_or(VotaraError::Underflow)?;
            }
            VoteType::Abstain => {
                proposal.abstain_votes = proposal.abstain_votes.checked_sub(power).ok_or(VotaraError::Underflow)?;
                analytics.live_abstain_votes = analytics.live_abstain_votes.checked_sub(power).ok_or(VotaraError::Underflow)?;
            }
        }

        if proposal.unique_voters > 0 {
            proposal.unique_voters = proposal.unique_voters.checked_sub(1).ok_or(VotaraError::Underflow)?;
        }

        // Refund quadratic cost if applicable
        if vote_record.quadratic_cost > 0 {
            voter.tokens_staked = voter
                .tokens_staked
                .checked_add(vote_record.quadratic_cost)
                .ok_or(VotaraError::Overflow)?;
        }

        analytics.realtime_sync_nonce = analytics.realtime_sync_nonce.checked_add(1).ok_or(VotaraError::Overflow)?;

        // vote_record is closed by the account constraint (close = authority)
        Ok(())
    }

    pub fn finalize_vote(ctx: Context<FinalizeVote>) -> Result<()> {
        // Alias to finalize_proposal logic — tallies and marks status.
        // The FinalizeVote context mirrors FinalizeProposal; delegate to the same logic.
        let config = &ctx.accounts.config;
        let proposal = &mut ctx.accounts.proposal;
        let analytics = &mut ctx.accounts.analytics;
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp >= proposal.end_time,
            VotaraError::VotingPeriodNotEnded
        );

        let total_votes = proposal
            .yes_votes
            .checked_add(proposal.no_votes)
            .and_then(|v| v.checked_add(proposal.abstain_votes))
            .ok_or(VotaraError::Overflow)?;

        let quorum_met = proposal.unique_voters >= config.quorum_percentage as u64;
        proposal.quorum_reached = quorum_met;

        if !quorum_met {
            proposal.status = ProposalStatus::Rejected;
        } else {
            let approval = if total_votes == 0 {
                0u64
            } else {
                proposal
                    .yes_votes
                    .checked_mul(100)
                    .ok_or(VotaraError::Overflow)?
                    / total_votes
            };

            proposal.status = if approval >= config.approval_threshold as u64 {
                ProposalStatus::Passed
            } else {
                ProposalStatus::Rejected
            };
        }

        analytics.realtime_sync_nonce = analytics.realtime_sync_nonce.checked_add(1).ok_or(VotaraError::Overflow)?;

        emit!(ProposalFinalizedEvent {
            proposal: proposal.key(),
            passed: proposal.status == ProposalStatus::Passed,
            yes_votes: proposal.yes_votes,
            no_votes: proposal.no_votes,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // ============================================================================
    // Voter Management Instructions
    // ============================================================================

    pub fn delegate_vote(ctx: Context<DelegateVote>) -> Result<()> {
        let voter = &mut ctx.accounts.voter;
        let delegate = &mut ctx.accounts.delegate;
        let clock = Clock::get()?;

        require!(
            voter.key() != delegate.key(),
            VotaraError::SelfDelegation
        );

        voter.delegated_to = Some(delegate.key());

        // Transfer voting power to the delegate
        delegate.voting_power = delegate
            .voting_power
            .checked_add(voter.voting_power)
            .ok_or(VotaraError::Overflow)?;

        voter.voting_power = 0;

        emit!(VoteDelegatedEvent {
            voter: voter.key(),
            delegate: delegate.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn close_voter(ctx: Context<CloseVoter>) -> Result<()> {
        let dao = &mut ctx.accounts.dao;

        if dao.total_voters > 0 {
            dao.total_voters = dao.total_voters.checked_sub(1).ok_or(VotaraError::Underflow)?;
        }

        // voter account is closed by the account constraint (close = authority)
        Ok(())
    }

    // ============================================================================
    // Treasury Management Instructions
    // ============================================================================

    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let treasury = &mut ctx.accounts.treasury;
        let clock = Clock::get()?;

        treasury.authority = ctx.accounts.authority.key();
        treasury.total_sol = 0;
        treasury.total_tokens = 0;
        treasury.locked_amount = 0;
        treasury.proposal_fees_collected = 0;
        treasury.reward_pool = 0;
        treasury.multisig_enabled = false;
        treasury.signer_count = 1;
        treasury.threshold = 1;
        treasury.created_at = clock.unix_timestamp;
        treasury.bump = ctx.bumps.treasury;

        // Link governance token mint back to DAO
        dao.treasury = treasury.key();
        dao.governance_token_mint = ctx.accounts.governance_token_mint.key();

        Ok(())
    }

    pub fn stake_tokens(ctx: Context<StakeTokens>, amount: u64) -> Result<()> {
        let voter = &mut ctx.accounts.voter;
        let treasury = &mut ctx.accounts.treasury;
        let clock = Clock::get()?;

        require!(amount > 0, VotaraError::InsufficientTokens);

        // SPL token transfer happens via CPI (implementation placeholder)
        // anchor_spl::token::transfer(cpi_ctx, amount)?;

        voter.tokens_staked = voter.tokens_staked.checked_add(amount).ok_or(VotaraError::Overflow)?;
        voter.voting_power = voter.tokens_staked; // 1 token = 1 vote (linear)
        treasury.total_tokens = treasury.total_tokens.checked_add(amount).ok_or(VotaraError::Overflow)?;

        emit!(TokensStakedEvent {
            voter: voter.key(),
            amount,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn withdraw_tokens(ctx: Context<WithdrawTokens>, amount: u64) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;

        require!(amount > 0, VotaraError::InsufficientTokens);
        require!(
            treasury.total_tokens >= amount + treasury.locked_amount,
            VotaraError::InsufficientFunds
        );

        // SPL token transfer via CPI (implementation placeholder)
        // anchor_spl::token::transfer(cpi_ctx, amount)?;

        treasury.total_tokens = treasury.total_tokens.checked_sub(amount).ok_or(VotaraError::Underflow)?;

        emit!(TreasuryWithdrawEvent {
            authority: ctx.accounts.authority.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        let voter = &mut ctx.accounts.voter;

        require!(amount > 0, VotaraError::InsufficientTokens);
        require!(
            treasury.total_tokens >= amount,
            VotaraError::InsufficientFunds
        );

        // SOL transfer + SPL token transfer via CPI (implementation placeholder)

        voter.tokens_staked = voter.tokens_staked.checked_add(amount).ok_or(VotaraError::Overflow)?;
        voter.voting_power = voter.tokens_staked;
        treasury.total_tokens = treasury.total_tokens.checked_sub(amount).ok_or(VotaraError::Underflow)?;

        Ok(())
    }

    pub fn mint_rewards(ctx: Context<MintRewards>, amount: u64) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        let voter = &mut ctx.accounts.voter;

        require!(amount > 0, VotaraError::InsufficientTokens);
        require!(
            treasury.reward_pool >= amount,
            VotaraError::InsufficientFunds
        );

        // SPL mint-to CPI (implementation placeholder)

        voter.tokens_staked = voter.tokens_staked.checked_add(amount).ok_or(VotaraError::Overflow)?;
        voter.voting_power = voter.tokens_staked;
        voter.reputation_score = voter.reputation_score.checked_add(1).ok_or(VotaraError::Overflow)?;

        treasury.reward_pool = treasury.reward_pool.checked_sub(amount).ok_or(VotaraError::Underflow)?;

        Ok(())
    }
}
