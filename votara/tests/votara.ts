import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Votara } from "../target/types";
import { expect } from "chai";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "@solana/spl-token";

describe("votara", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Votara as Program<Votara>;
  const authority = provider.wallet as anchor.Wallet;

  // PDAs
  const [daoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("dao")],
    program.programId
  );

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );

  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    program.programId
  );

  const [govMintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("governance_mint")],
    program.programId
  );

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId
  );

  it("Initializes the DAO", async () => {
    await program.methods
      .initializeDao()
      .accounts({
        authority: authority.publicKey,
        // @ts-ignore
        dao: daoPda,
        config: configPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const daoAccount = await program.account.dao.fetch(daoPda);
    expect(daoAccount.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    expect(daoAccount.totalVoters.toNumber()).to.equal(0);
  });

  it("Initializes the Treasury", async () => {
    await program.methods
      .initializeTreasury()
      .accounts({
        authority: authority.publicKey,
        dao: daoPda,
        // @ts-ignore
        treasury: treasuryPda,
        governanceTokenMint: govMintPda,
        vault: vaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const treasuryAccount = await program.account.treasury.fetch(treasuryPda);
    expect(treasuryAccount.authority.toBase58()).to.equal(authority.publicKey.toBase58());
  });

  it("Registers a voter while staking (init_if_needed test)", async () => {
    const [voterPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("voter"), authority.publicKey.toBuffer()],
      program.programId
    );

    // For this test, we need a real token account for the user.
    // In a real environment, we'd use a real mint.
    // Since initialize_treasury creates govMintPda, we'll use that.

    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      govMintPda,
      authority.publicKey
    );

    // Mint some tokens to user first
    await mintTo(
      provider.connection,
      authority.payer,
      govMintPda,
      userTokenAccount.address,
      authority.payer,
      1000 * 10 ** 9
    );

    await program.methods
      .stakeTokens(new anchor.BN(100 * 10 ** 9))
      .accounts({
        voterAuthority: authority.publicKey,
        dao: daoPda,
        // @ts-ignore
        voter: voterPda,
        treasury: treasuryPda,
        governanceTokenMint: govMintPda,
        userTokenAccount: userTokenAccount.address,
        vault: vaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const voterAccount = await program.account.voter.fetch(voterPda);
    expect(voterAccount.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    expect(voterAccount.tokensStaked.toNumber()).to.be.greaterThan(0);
  });

  it("Creates a proposal", async () => {
    const proposalId = new anchor.BN(Date.now());
    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), proposalId.toBuffer("le", 8)],
      program.programId
    );

    const [analyticsPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("analytics"), proposalPda.toBuffer()],
      program.programId
    );

    const [voterPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("voter"), authority.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createProposal(
        proposalId,
        "Test Proposal",
        "This is a test proposal description.",
        { general: {} },
        new anchor.BN(0),
        false,
        false,
        new anchor.BN(0)
      )
      .accounts({
        creator: authority.publicKey,
        dao: daoPda,
        config: configPda,
        treasury: treasuryPda,
        voter: voterPda,
        // @ts-ignore
        proposal: proposalPda,
        analytics: analyticsPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const proposalAccount = await program.account.proposal.fetch(proposalPda);
    expect(proposalAccount.title).to.equal("Test Proposal");
  });
});
