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

        // Internal helper to get the injected provider for signing as a fallback
        const getInjectedProvider = () => {
            const w = window as any;
            const name = walletName.toLowerCase();
            if (name.includes("phantom")) return w?.phantom?.solana;
            if (name.includes("backpack")) return w?.backpack;
            if (name.includes("solflare")) return w?.solflare;
            return w?.solana;
        };

        const w = wallet as any;

        return {
            publicKey,
            connected,
            connecting,
            walletName,
            connect: async () => {},
            disconnect,
            signTransaction: async (tx: any) => {
                // Try modern Wallet Standard first
                if (w?.features?.["solana:signTransaction"]) {
                    const { signTransaction } = w.features["solana:signTransaction"];
                    const [signed] = await signTransaction([{ 
                        transaction: tx.serialize({ requireAllSignatures: false }) 
                    }]);
                    return Transaction.from(signed.transaction) as any;
                }
                
                // Fallback to legacy injected provider
                const provider = getInjectedProvider();
                if (provider?.signTransaction) {
                    return provider.signTransaction(tx);
                }

                throw new Error("Wallet does not support signTransaction");
            },
            signAllTransactions: async (txs: any[]) => {
                // Try modern Wallet Standard first
                if (w?.features?.["solana:signTransaction"]) {
                    const { signTransaction } = w.features["solana:signTransaction"];
                    const inputs = txs.map(tx => ({ 
                        transaction: tx.serialize({ requireAllSignatures: false }) 
                    }));
                    const signedOutputs = await signTransaction(inputs);
                    return signedOutputs.map(output => Transaction.from(output.transaction) as any);
                }

                // Fallback to legacy injected provider
                const provider = getInjectedProvider();
                if (provider?.signAllTransactions) {
                    return provider.signAllTransactions(txs);
                }

                throw new Error("Wallet does not support signTransaction");
            },
            signMessage: async (msg: Uint8Array) => {
                // Try modern Wallet Standard first
                if (w?.features?.["solana:signMessage"]) {
                    const { signMessage } = w.features["solana:signMessage"];
                    const [signed] = await signMessage([{ message: msg }]);
                    return { signature: signed.signature };
                }

                // Fallback to legacy injected provider
                const provider = getInjectedProvider();
                if (provider?.signMessage) {
                    const { signature } = await provider.signMessage(msg, "utf8");
                    return { signature };
                }

                throw new Error("Wallet does not support signMessage");
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
