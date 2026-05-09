# 🌐 VOTARA — Decentralized Governance Platform on Solana


---

## 🚀 Overview


# 🏗️ System Architecture

```text
User Wallet (Phantom / Backpack)
            │
            ▼
React + Vite Frontend
            │
    ┌───────┼─────────────┐
    │       │             │
    ▼       ▼             ▼
Helius RPC  LaserStream   Wallet Adapter
            gRPC
            │
            ▼
Anchor Smart Contract (vote_app)
            │
 ┌──────────┼──────────┬──────────┬──────────┐
 ▼          ▼          ▼          ▼          ▼
DAO PDA   Proposal   Vote PDA   Treasury   Vault
          PDA                    PDA        PDA
```

---



---

# 🔐 PDA Architecture

| PDA        | Seeds                       | Purpose                 |
| ---------- | --------------------------- | ----------------------- |
| DAO        | `["dao"]`                   | Global governance state |
| Config     | `["config"]`                | App configuration       |
| Treasury   | `["treasury"]`              | Treasury vault          |
| Proposal   | `["proposal", proposal_id]` | Proposal storage        |
| Voter      | `["voter", wallet]`         | Voter account           |
| VoteRecord | `["vote", proposal, voter]` | Vote history            |
| Analytics  | `["analytics", proposal]`   | Real-time statistics    |
| Vault      | `["vault"]`                 | SPL token reserve       |

---






Example:



![Architecture](../../assets/state.png)


---



# 📜 License

MIT License © 2026 VOTARA

---

# ⭐ Vision

> Building transparent, scalable, and real-time decentralized governance infrastructure for the next generation of Solana DAOs.
