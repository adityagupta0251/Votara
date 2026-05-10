import { type ReactNode, useMemo, createContext, useContext } from "react";
import { useWalletConnection } from "@solana/react-hooks";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

// Re-exporting the types for compatibility
export type WalletName = "phantom" | "backpack" | "solflare" | "unknown";

export interface WalletAdapter {
    publicKey: PublicKey | null;
    connected: boolean;
    connecting: boolean;
    walletName: string;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    signTransaction: <T extends Transaction | VersionedTransaction>(
        tx: T,
    ) => Promise<T>;
    signAllTransactions: <T extends Transaction | VersionedTransaction>(
        txs: T[],
    ) => Promise<T[]>;
    signMessage: (msg: Uint8Array) => Promise<{ signature: Uint8Array }>;
}

const WalletCtx = createContext<WalletAdapter | null>(null);

/**
 * A bridge between @solana/react-hooks and the existing WalletAdapter interface.
 * Powering the UI with modern hooks while maintaining Anchor compatibility.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
    const { status, disconnect, wallet } = useWalletConnection();

    const walletAdapter: WalletAdapter = useMemo(() => {
        const connected = status === "connected";
        const connecting = status === "connecting";
        const publicKey = wallet?.account.address ? new PublicKey(wallet.account.address) : null;
        const walletName = wallet?.account.label || "Unknown";

        // Internal helper to get the injected provider for signing
        // We still need this for Anchor (Web3.js v1) compatibility
        const getInjectedProvider = () => {
            const w = window as any;
            if (walletName.toLowerCase().includes("phantom")) return w?.phantom?.solana;
            if (walletName.toLowerCase().includes("backpack")) return w?.backpack;
            if (walletName.toLowerCase().includes("solflare")) return w?.solflare;
            return w?.solana;
        };

        return {
            publicKey,
            connected,
            connecting,
            walletName,
            connect: async () => {
                // WalletButton handles the connector selection UI.
            },
            disconnect,
            signTransaction: async (tx: any) => {
                const provider = getInjectedProvider();
                if (!provider) throw new Error("Wallet provider not found");
                return provider.signTransaction(tx);
            },
            signAllTransactions: async (txs: any[]) => {
                const provider = getInjectedProvider();
                if (!provider) throw new Error("Wallet provider not found");
                return provider.signAllTransactions(txs);
            },
            signMessage: async (msg: Uint8Array) => {
                const provider = getInjectedProvider();
                if (!provider) throw new Error("Wallet provider not found");
                return provider.signMessage(msg, "utf8");
            }
        };
    }, [status, disconnect, wallet]);

    return (
        <WalletCtx.Provider value={walletAdapter}>
            {children}
        </WalletCtx.Provider>
    );
}

export function useWallet(): WalletAdapter {
    const ctx = useContext(WalletCtx);
    if (!ctx) throw new Error("useWallet must be inside <WalletProvider>");
    return ctx;
}
