import { type ReactNode, useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider as SolanaWalletProvider,
    useWallet as useSolanaWallet,
    useConnection as useSolanaConnection
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { RPC_ENDPOINT } from "./constants/constant";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletContext({ children }: { children: ReactNode }) {
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={RPC_ENDPOINT}>
            <SolanaWalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
}

export const useWallet = useSolanaWallet;
export const useConnection = useSolanaConnection;
