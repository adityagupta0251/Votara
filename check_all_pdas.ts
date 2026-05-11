import { PublicKey } from "@solana/web3.js";
import * as BufferModule from "buffer";
const { Buffer } = BufferModule;
const PROGRAM_ID = new PublicKey("CXJXjwHGo67zYveByRp2aydFgXHRcPTEQbRt8iNQEtvF");
const seeds = ["dao", "config", "treasury", "governance_mint", "vault"];
seeds.forEach(s => {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from(s)], PROGRAM_ID);
    console.log(s + " PDA:", pda.toBase58());
});
