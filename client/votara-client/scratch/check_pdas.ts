import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
const PROGRAM_ID = new PublicKey("CXJXjwHGo67zYveByRp2aydFgXHRcPTEQbRt8iNQEtvF");
const [daoPda] = PublicKey.findProgramAddressSync([Buffer.from("dao")], PROGRAM_ID);
const [mintPda] = PublicKey.findProgramAddressSync([Buffer.from("governance_mint")], PROGRAM_ID);

console.log("DAO PDA:", daoPda.toBase58());
console.log("Mint PDA:", mintPda.toBase58());
