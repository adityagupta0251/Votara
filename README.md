# Votara: Decentralized Governance on Solana

Votara is a comprehensive DAO (Decentralized Autonomous Organization) platform built on the Solana blockchain. It provides a robust framework for community governance, allowing users to create proposals, stake tokens, cast votes, and manage a collective treasury with transparency and efficiency.

## 🚀 What We Are Building

Votara is a governance-as-a-service layer for Solana communities. It solves the problem of fragmented community decision-making by providing a unified, on-chain dashboard for:
- **Proposal Lifecycle Management:** From creation to voting and finalization.
- **Token-Gated Participation:** Ensuring that only stakeholders have a say.
- **Flexible Voting Mechanisms:** Support for both linear (1 token = 1 vote) and quadratic voting to prevent whale dominance.
- **Treasury Management:** Secure handling of DAO funds and governance token distribution.
- **Real-time Analytics:** On-chain tracking of voting trends and community engagement.

## 🛠 Tech Stack

Link to access Program IDL 
https://explorer.solana.com/address/CXJXjwHGo67zYveByRp2aydFgXHRcPTEQbRt8iNQEtvF/idl?cluster=devnet
### Backend (Smart Contracts)
- **Rust & Anchor Framework:** For secure and efficient Solana programs.
- **Solana Web3.js:** For off-chain interaction with the blockchain.
- **SPL Token Program:** For managing governance tokens.

### Frontend
- **React 19 & TypeScript:** A modern, type-safe user interface.
- **Vite:** Next-generation frontend tooling for fast development.
- **Tailwind CSS:** For responsive and modern styling.
- **Framer Motion:** For smooth UI transitions and animations.
- **Lucide React:** A clean and consistent icon set.

### Infrastructure & Tools
- **Bun:** High-performance JavaScript runtime and package manager.
- **@solana/wallet-adapter:** Standardized wallet integration (Phantom, Solflare, etc.).
- **React Router:** For seamless single-page application navigation.

## 📦 Key Dependencies

- `@coral-xyz/anchor`: The bridge between the Rust program and the React frontend.
- `@solana/web3.js`: Core library for Solana blockchain interactions.
- `@solana/spl-token`: Used for staking, buying, and transferring governance tokens.
- `react-helmet-async`: Manages SEO and page metadata.
- `clsx` & `tailwind-merge`: Utilities for dynamic Tailwind class management.

## 🏗 Implementation Details

### On-Chain Architecture
The Votara program is structured around several key Program Derived Addresses (PDAs):
- **DAO & Config:** Global accounts storing protocol settings, fees, and authority details.
- **Voter:** Individual accounts tracking a user's staked tokens, voting power, and reputation.
- **Proposal:** Unique accounts for every governance initiative, containing title, description, and vote counts.
- **VoteRecord:** Records individual votes to prevent double-voting and allow for vote retraction.
- **Treasury:** A centralized vault for the DAO's SOL and governance tokens.

### Features
- **Quadratic Voting:** Implemented to provide a fairer distribution of voting power.
- **Timelock Periods:** Ensures that there is a delay between a proposal passing and being executed, allowing for community review.
- **Delegated Voting:** Allows users to delegate their voting power to trusted community members.
- **Proposal Fees:** A small SOL fee for creating proposals to prevent spam.
- **Real-time Synchronization:** The frontend uses Solana's WebSocket connections (where available) and polling to keep the UI in sync with the chain.

## 🧠 Thought Process

### 1. Security First
By utilizing the Anchor framework, we ensure that account ownership checks, reentrancy protection, and type-safe serialization are handled at the framework level. PDAs are used extensively to ensure that accounts can only be modified by the authorized parties.

### 2. User-Centric Design
Blockchain applications often suffer from poor UX. Votara addresses this by:
- Providing clear, actionable error messages.
- Showing real-time transaction status with direct links to Solana Explorer.
- Implementing a "Register to Propose" flow that guides new users through the DAO onboarding process.

### 3. Scalability and Efficiency
The use of specialized accounts like `Analytics` and `VoteRecord` allows the frontend to fetch specific data points without scanning the entire blockchain. Staking tokens into a centralized `Treasury` PDA minimizes the complexity of calculating voting power during active proposals.

### 4. Modular Frontend
The React application is built with a modular component architecture. Hooks like `useVoter` and `useDao` encapsulate complex fetching and PDA derivation logic, making the UI components clean and focused on presentation.

## 🚦 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed.
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) installed.
- A Solana wallet (e.g., Phantom) with some Devnet SOL.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd votara
   ```

2. **Install Client Dependencies:**
   ```bash
   cd client/votara-client
   bun install
   ```

3. **Run the Development Server:**
   ```bash
   bun run dev
   ```

### Smart Contract Deployment
1. **Configure Anchor.toml:** Ensure the provider cluster is set to your desired network (localnet/devnet).
2. **Build and Deploy:**
   ```bash
   cd votara
   anchor build
   anchor deploy
   ```

---

Built with 🦀 on Solana.
