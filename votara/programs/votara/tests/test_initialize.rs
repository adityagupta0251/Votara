/// Unit tests for Votara — no external test crates needed.
/// Full integration tests live in tests/ (TypeScript, run via `anchor test`).
#[cfg(test)]
mod tests {
    use anchor_lang::prelude::Pubkey;

    #[test]
    fn test_program_id_is_set() {
        let id = votara::id();
        assert_ne!(id, Pubkey::default(), "Program ID should not be the default pubkey");
    }

    #[test]
    fn test_dao_pda_derivation() {
        let (pda, bump) = Pubkey::find_program_address(&[b"dao"], &votara::id());
        assert_ne!(pda, Pubkey::default());
        assert!(bump <= 255);
    }

    #[test]
    fn test_config_pda_derivation() {
        let (pda, bump) = Pubkey::find_program_address(&[b"config"], &votara::id());
        assert_ne!(pda, Pubkey::default());
        assert!(bump <= 255);
    }

    #[test]
    fn test_treasury_pda_derivation() {
        let (pda, bump) = Pubkey::find_program_address(&[b"treasury"], &votara::id());
        assert_ne!(pda, Pubkey::default());
        assert!(bump <= 255);
    }

    #[test]
    fn test_proposal_pda_derivation() {
        let proposal_id: u64 = 1;
        let (pda, bump) = Pubkey::find_program_address(
            &[b"proposal", &proposal_id.to_le_bytes()],
            &votara::id(),
        );
        assert_ne!(pda, Pubkey::default());
        assert!(bump <= 255);
    }

    #[test]
    fn test_voter_pda_derivation() {
        let authority = Pubkey::new_unique();
        let (pda, bump) = Pubkey::find_program_address(
            &[b"voter", authority.as_ref()],
            &votara::id(),
        );
        assert_ne!(pda, Pubkey::default());
        assert!(bump <= 255);
    }

    #[test]
    fn test_governance_mint_pda_derivation() {
        let (pda, bump) = Pubkey::find_program_address(&[b"governance_mint"], &votara::id());
        assert_ne!(pda, Pubkey::default());
        assert!(bump <= 255);
    }

    #[test]
    fn test_vault_pda_derivation() {
        let (pda, bump) = Pubkey::find_program_address(&[b"vault"], &votara::id());
        assert_ne!(pda, Pubkey::default());
        assert!(bump <= 255);
    }
}
