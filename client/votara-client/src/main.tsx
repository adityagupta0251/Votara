import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { WalletContext } from "./wallet";
import { ProgramProvider } from "./program";
import App from "./App";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <HelmetProvider>
            <WalletContext>
                <ProgramProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </ProgramProvider>
            </WalletContext>
        </HelmetProvider>
    </StrictMode>,
);
