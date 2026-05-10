import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { autoDiscover, createClient } from "@solana/client";
import { SolanaProvider } from "@solana/react-hooks";
import { RPC_ENDPOINT, WS_ENDPOINT } from "./constants/constant";

import { ConnectionProvider } from "./connection";
import { WalletProvider } from "./wallet";
import { ProgramProvider } from "./program";
import App from "./App";

const client = createClient({
    endpoint: RPC_ENDPOINT,
    websocketEndpoint: WS_ENDPOINT,
    walletConnectors: autoDiscover(),
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SolanaProvider client={client}>
            <ConnectionProvider>
                <WalletProvider>
                    <ProgramProvider>
                        <App />
                    </ProgramProvider>
                </WalletProvider>
            </ConnectionProvider>
        </SolanaProvider>
    </StrictMode>,
);
