import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("4s8kSwWN26t3DjKNNBgcypAvG7MedaMsdrHZGbBQy525");
const SEED_DAO = new TextEncoder().encode("dao");
const SEED_CONFIG = new TextEncoder().encode("config");

const [daoPda] = PublicKey.findProgramAddressSync([SEED_DAO], PROGRAM_ID);
const [configPda] = PublicKey.findProgramAddressSync([SEED_CONFIG], PROGRAM_ID);

console.log("DAO PDA:", daoPda.toBase58());
console.log("Config PDA:", configPda.toBase58());
