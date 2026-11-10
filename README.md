# Voyara — Travel & Lifestyle Loyalty, On-Chain

A working prototype of a unified loyalty network for travel and lifestyle brands. Members earn one
token (VYA) across hotels, restaurants, spas, shopping and airlines, hold a soulbound NFT membership
card, and redeem rewards anywhere in the network. Every award, redemption and transfer settles on a
local Hardhat chain.

The product is built web-first (Next.js) and is responsive/PWA-ready so it can later be wrapped or
ported to mobile while the website stays live.

## Stack

- **Next.js 16.4** (App Router, Turbopack) · **React 19.3** · **TypeScript** · **Tailwind CSS 4**
- **Hardhat 2.29** node · **Solidity 0.8.28** · **OpenZeppelin 5.6**
- **ethers v6** for server-side chain reads and signed writes
- Signed HTTP-only cookie sessions (HMAC-SHA256) with scrypt password hashes
- JSON datastore plus an on-chain activity index read directly from contract events

## Architecture

| Layer | Location | Responsibility |
| --- | --- | --- |
| Marketing site | `app/page.tsx`, `components/marketing-*` | Public story, membership tiers, partner pitch |
| Auth | `lib/auth.ts`, `app/actions/auth.ts` | Credentials, sessions, role guards (`requireRole`) |
| App shell | `app/(app)/layout.tsx`, `components/app/app-shell.tsx` | Role-aware navigation, chain status, mobile drawer |
| Traveler | `app/(app)/dashboard`, `wallet`, `marketplace`, `membership` | Balance, transfers, redemption, NFT membership |
| Merchant | `app/(app)/merchant/*` | Campaign creation, point issuance, partner ledger |
| Admin | `app/(app)/admin/*` | Supply and member KPIs, member/merchant controls, audit ledger |
| Chain services | `lib/chain/*` | Provider, contracts, event reads, signed writes |
| Platform data | `data/platform.json` | Merchant/campaign metadata, rewards, redemption records |

### Contracts

| Contract | Standard | Purpose |
| --- | --- | --- |
| `VoyaraToken` | ERC-20, 0 decimals | The VYA loyalty balance. Role-gated `mint` / `burnFrom`. |
| `VoyaraMembership` | ERC-721, soulbound | Membership card with tier, member number and on-chain SVG artwork. |
| `LoyaltyManager` | Registry | Registers merchants, exposes `award` and `redeem`, emits every settlement event. |

The chain is the source of truth for balances, supply, memberships and activity. `lib/chain/read.ts`
scans `RewardEarned`, `RewardRedeemed` and ERC-20 `Transfer` logs and enriches them with names and
imagery from the platform database. If the node is unreachable, the UI falls back to
`data/chain-snapshot.json`.

Server Actions in `app/actions/` sign transactions with deterministic demo wallets, then revalidate
the affected routes so balances and ledgers update immediately.

## Getting started

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
```

Run the chain, deploy/seed, and start the app:

```bash
# Terminal A — local chain (in-memory, chain id 31337)
npm run chain

# Terminal B — compile contracts, deploy and seed demo data
npm run chain:deploy

# Terminal C — web app
npm run dev:web
```

Or run everything together:

```bash
npm run dev
```

`npm run dev` waits for the RPC port, deploys, seeds and starts Next.js. Because it redeploys on every
run, it **resets all demo data** (contracts, balances, campaigns you created). Use the three-terminal
flow to keep your changes.

Open <http://localhost:3000> and sign in, or step into a demo account from the login page.

### Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `SESSION_SECRET` | development fallback | Signs the session cookie. Set a long random value outside local demos. |
| `NEXT_PUBLIC_CHAIN_RPC` | `http://127.0.0.1:8545` | JSON-RPC endpoint for reads and writes. |

Deployed addresses and ABIs are written to `lib/chain/deployment.json` and `lib/chain/abis.json` by
the deploy script.

## Demo accounts

Password for every demo account: `voyara123`.

| Role | Name | Email |
| --- | --- | --- |
| Traveler | Ava Bennett | `ava@voyara.club` |
| Traveler | Noah Williams | `noah@voyara.club` |
| Traveler | Isla Rossi | `isla@voyara.club` |
| Traveler | Mia Chen | `mia@voyara.club` |
| Traveler | Leo Marchetti | `leo@voyara.club` |
| Merchant | Mateo Riera (Casa Marea) | `casa@voyara.club` |
| Admin | Elena Voss | `admin@voyara.club` |

## What you can do

**Traveler**

- See the unified balance, tier progress, weekly earnings and recent activity.
- Redeem marketplace rewards: the contract burns VYA and inventory decrements.
- Transfer points to another member (custodial demo wallet signs for you).
- View the soulbound membership card and its on-chain SVG artwork; metadata is served at
  `/api/membership/[tokenId]`.

**Merchant**

- Review issued, redeemed, transaction and reach stats from chain events.
- Create campaigns (name, description, points, audience) available immediately at the issuance desk.
- Issue points to a member; the merchant wallet calls `LoyaltyManager.award`, minting VYA on-chain.
- Filter and search the partner ledger.

**Admin**

- Monitor circulating supply, lifetime issuance, burn and settlement counts.
- Pause/resume members (off-chain: blocks sign-in and new awards, NFT remains on-chain).
- Pause/reactivate merchants on-chain; inactive merchants cannot mint.
- Inspect all deployed contracts, network parameters, supply split and the full audit ledger.

### Example flow

A hotel stay awards 500 VYA and a partner restaurant awards 100. Both events appear in the member's
wallet as one 600 VYA balance, redeemable at any partner. The contract records each award with its
merchant id, campaign reference, timestamp and transaction hash.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Chain + deploy/seed + web app (resets demo data) |
| `npm run chain` | Local Hardhat node on `127.0.0.1:8545` |
| `npm run chain:compile` | Compile Solidity contracts |
| `npm run chain:deploy` | Deploy and seed contracts on the running node |
| `npm run dev:web` | Next.js dev server only |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |

## Resetting demo data

The Hardhat node keeps state in memory. To start clean:

1. Stop the node and restart `npm run chain`.
2. Run `npm run chain:deploy` — it redeploys contracts, rewrites `data/platform.json`, and regenerates
   the deployment file, ABIs and chain snapshot.

`data/platform.json`, `data/chain-snapshot.json`, `lib/chain/deployment.json` and `lib/chain/abis.json`
are generated artifacts and are gitignored.

## Production notes and limitations

This is a local-first prototype, not a production custody or compliance system.

- **Custodial demo keys.** Server-side writes use the deterministic Hardhat mnemonic. Those keys are
  public test keys and must never hold real value. Production needs a managed signer/KMS or a
  member-owned wallet flow.
- **Local chain only.** There is no testnet/mainnet deployment or gas strategy.
- **Off-chain metadata.** Merchant profiles, campaigns, rewards and redemption inventory live in the
  JSON datastore. Membership pauses are off-chain. A production build should move campaigns to a
  signed backend service or contracts.
- **Log scanning instead of an indexer.** Activity is derived by querying all events per request. Fine
  for a demo; add an indexer/subgraph for scale.
- **No KYC/AML, audit, rate limiting or legal review.** Access control is enforced by contracts and
  session guards, but the deployment is not hardened.
- **Re-running deploy wipes changes** made through the UI.

## Path to mobile

The UI is responsive, touch-friendly and can be installed as a PWA. The planned mobile phase is to
reuse the same Next.js APIs and contracts, either via a Capacitor shell for a fast App Store/Play
release or a React Native client that talks to the same chain services — keeping the website live.
