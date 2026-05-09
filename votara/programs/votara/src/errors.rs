use anchor_lang::prelude::*;

#[error_code]
pub enum VotaraError {
    // ── Authorization ──────────────────────────────────────────────────────────
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,

    // ── DAO ────────────────────────────────────────────────────────────────────
    #[msg("The DAO is currently paused for emergency maintenance.")]
    DaoPaused,

    // ── Proposal ───────────────────────────────────────────────────────────────
    #[msg("The referenced proposal is not valid.")]
    InvalidProposal,

    #[msg("The proposal is closed and no longer accepts changes or votes.")]
    ProposalClosed,

    #[msg("The proposal is already in an active state.")]
    ProposalAlreadyActive,

    #[msg("The proposal voting period has not yet ended.")]
    VotingPeriodNotEnded,

    #[msg("The proposal title exceeds the maximum allowed length.")]
    TitleTooLong,

    #[msg("The proposal description exceeds the maximum allowed length.")]
    DescriptionTooLong,

    // ── Voting ─────────────────────────────────────────────────────────────────
    #[msg("Quadratic voting is not enabled for this DAO or proposal.")]
    QuadraticVotingDisabled,

    #[msg("You have already cast a vote on this proposal.")]
    AlreadyVoted,

    #[msg("No vote record found for this voter on this proposal.")]
    VoteNotFound,

    // ── Tokens / Treasury ──────────────────────────────────────────────────────
    #[msg("You do not have sufficient tokens to perform this action.")]
    InsufficientTokens,

    #[msg("The requested withdrawal amount exceeds the available treasury balance.")]
    InsufficientFunds,

    #[msg("The token mint does not match the expected governance token mint.")]
    InvalidMint,

    // ── Voter ──────────────────────────────────────────────────────────────────
    #[msg("This voter account is banned and cannot perform actions.")]
    VoterBanned,

    #[msg("Cannot delegate to yourself.")]
    SelfDelegation,

    // ── Math ───────────────────────────────────────────────────────────────────
    #[msg("Arithmetic overflow occurred.")]
    Overflow,

    #[msg("Arithmetic underflow occurred.")]
    Underflow,
}
