import { Buffer } from "buffer";
import process from "process";
import "./polyfills";

globalThis.Buffer = Buffer;
globalThis.process = process;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { WalletContext } from "./wallet";
import { ProgramProvider } from "./program";
import { ConnectionProvider } from "../src/connection"; // ✅ ADD THIS

import App from "./App";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <HelmetProvider>
            <ConnectionProvider>
                {" "}
                {/* ✅ ADD THIS WRAPPER */}
                <WalletContext>
                    <ProgramProvider>
                        <BrowserRouter>
                            <App />
                        </BrowserRouter>
                    </ProgramProvider>
                </WalletContext>
            </ConnectionProvider>
        </HelmetProvider>
    </StrictMode>,
);
