import { PublicKey, type Commitment } from "@solana/web3.js";

// --- Env Type Definition ---
interface ViteEnv {
    readonly VITE_RPC_ENDPOINT?: string;
    readonly VITE_WS_ENDPOINT?: string;
    readonly VITE_CLUSTER?: string;
}

// --- Program Constants ---
export const PROGRAM_ID = new PublicKey(
    "4s8kSwWN26t3DjKNNBgcypAvG7MedaMsdrHZGbBQy525",
);

// --- Network & RPC Endpoints ---
const env = import.meta.env as unknown as ViteEnv;

export const RPC_ENDPOINT =
    env.VITE_RPC_ENDPOINT ?? "https://api.devnet.solana.com";

export const WS_ENDPOINT =
    env.VITE_WS_ENDPOINT ?? "wss://api.devnet.solana.com";

/** Defines the required transaction commitment level. */
export const COMMITMENT: Commitment = "confirmed";

// --- PDAs (seeds mirror the on-chain program) ---
// Using TextEncoder for better browser compatibility than Buffer.from
const encoder = new TextEncoder();

export const SEED_DAO = encoder.encode("dao");
export const SEED_CONFIG = encoder.encode("config");
export const SEED_TREASURY = encoder.encode("treasury");
export const SEED_GOV_MINT = encoder.encode("governance_mint");
export const SEED_VOTER = encoder.encode("voter");
export const SEED_PROPOSAL = encoder.encode("proposal");
export const SEED_ANALYTICS = encoder.encode("analytics");
export const SEED_VOTE = encoder.encode("vote");
export const SEED_VAULT = encoder.encode("vault");

// --- Token Constants ---
export const TOKEN_DECIMALS = 6;
export const LAMPORTS_PER_SOL = 1_000_000_000;

// --- UI / Explorer Constants ---
/**
 * Generates the correct Explorer URL base based on the environment.
 */
export const EXPLORER_BASE =
    env.VITE_CLUSTER === "mainnet-beta"
        ? "https://explorer.solana.com"
        : "https://explorer.solana.com?cluster=devnet";

/**
 * Helper to generate tx links
 */
export const getExplorerUrl = (txSignature: string) =>
    `${EXPLORER_BASE}/tx/${txSignature}`;
