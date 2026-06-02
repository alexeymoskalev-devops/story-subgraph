# story-subgraph

An open-source [The Graph](https://thegraph.com/) subgraph that indexes the **current** [Story Protocol](https://www.story.foundation/) into a queryable GraphQL API: IP assets, PIL license terms, license attachments, derivative links (the IP graph), and royalty payments / revenue claims.

It closes the gap left by the proprietary Goldsky indexer and replaces the dead official alpha-era [`storyprotocol/story-protocol-subgraphs`](https://github.com/storyprotocol/story-protocol-subgraphs), which still indexes the 2023 Franchise / IPOrg contracts and no longer matches the live protocol.

License: **MIT**.

---

## What it indexes

The subgraph tracks 6 events across 4 core Story Protocol contracts:

| Contract | Event | Entity / effect |
| --- | --- | --- |
| `IPAssetRegistry` | `IPRegistered` | `IPAsset` |
| `PILicenseTemplate` | `LicenseTermsRegistered` | `LicenseTerms` |
| `LicensingModule` | `LicenseTermsAttached` | `LicenseAttachment` |
| `LicensingModule` | `DerivativeRegistered` | `DerivativeLink` (the IP graph) + bumps `IPAsset.parentCount` / `IPAsset.derivativeCount` |
| `RoyaltyModule` | `RoyaltyPaid` | `RoyaltyPayment` + accumulates `IPAsset.royaltyPaidTotal` |
| `RoyaltyModule` | `RevenueTokenClaimed` | `RevenueClaim` |

---

## GraphQL entities

| Entity | Key fields |
| --- | --- |
| `IPAsset` | `id` (ipId), `nftContract`, `tokenId`, `uri`, `registrationDate`, `parentCount`, `derivativeCount`, `royaltyPaidTotal` |
| `LicenseTerms` | `id` (licenseTermsId), `licenseTemplate`, `rawTerms`, `registeredAtBlock` |
| `LicenseAttachment` | `id` (ipId-termsId), `ip`, `licenseTermsId`, `licenseTemplate`, `blockNumber` |
| `DerivativeLink` | `id` (childIpId-parentIpId), `child`, `parent`, `licenseTermsIds`, `licenseTemplate`, `blockNumber`, `txHash` |
| `RoyaltyPayment` | `id` (txHash-logIndex), `receiverIp`, `payerIp`, `sender`, `token`, `amount`, `amountAfterFee`, `timestamp` |
| `RevenueClaim` | `id` (txHash-logIndex), `claimer`, `token`, `amount`, `timestamp` |

`IPAsset` exposes three reverse (`@derivedFrom`) relations that make it easy to traverse the IP graph:

- `attachedTerms: [LicenseAttachment!]!` — license terms attached to this IP.
- `parents: [DerivativeLink!]!` — links where this IP is the child (its upstream sources).
- `derivatives: [DerivativeLink!]!` — links where this IP is the parent (its downstream derivatives).

---

## Setup

```bash
npm install   # a postinstall runs patch-package to fix graph-cli's Apple-Silicon (M4) CPU detection
npm run codegen
npm test      # matchstick, 6 tests
npm run build
```

- `npm install` runs a `postinstall` hook that applies a [patch-package](https://github.com/ds300/patch-package) patch to `@graphprotocol/graph-cli` so its binary CPU detection works on Apple-Silicon (M4) Macs.
- `npm run codegen` renders `subgraph.yaml` from `subgraph.template.yaml` + `config/aeneid.json` (via mustache) and generates AssemblyScript types.
- `npm test` runs the matchstick test suite (6 tests).
- `npm run build` renders the manifest and compiles the mappings to WASM.

---

## Local indexing (graph-node)

Run a full local indexing stack (graph-node + IPFS + Postgres) with the bundled `docker-compose.yml`:

```bash
docker compose up -d
npm run codegen && npm run build
npx graph create --node http://localhost:8020/ story-subgraph
npx graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 story-subgraph
# query: http://localhost:8000/subgraphs/name/story-subgraph
```

The compose file points graph-node at Story Aeneid testnet via `story-aeneid:https://aeneid.storyrpc.io`.

> **Tip:** For a fast local sync, set `startBlock` in `config/aeneid.json` to a recent block (near the data you want) rather than `0`. Indexing from genesis is slow.

---

## Example query

An IP asset's lineage plus royalties:

```graphql
{
  ipasset(id: "0x<ipId>") {
    parentCount
    derivativeCount
    royaltyPaidTotal
    parents { parent { id } licenseTermsIds }
    derivatives { child { id } }
    attachedTerms { licenseTermsId }
  }
}
```

> Note on casing: The Graph lowercases the leading `IP` of `IPAsset`, so the query fields are `ipasset` / `ipassets` (not `ipAsset`). Other entities use the usual camelCase (`derivativeLinks`, `royaltyPayments`, …).

### Verified live on aeneid

Indexed against `https://aeneid.storyrpc.io` with a local graph-node and queried a real on-chain derivative relationship created via the [`story-ip-graph-mcp`](https://github.com/alexeymoskalev-devops/story-ip-graph-mcp) server:

```
ipasset(0x0b4df5a3…351d) → parentCount 1, parent 0x9a90f1c5…1f65 (licenseTermsIds ["1894"])
ipasset(0x9a90f1c5…1f65) → derivativeCount 3, attachedTerms [1894]
```

— `DerivativeLink` (the IP graph), aggregate counts, and license attachment all matched on-chain reality.

---

## Deploy options

- **Goldsky CLI** — `npm run deploy:goldsky`. Goldsky is Graph-compatible and supports Story.
- **Self-hosted graph-node** — the local indexing procedure above, pointed at a production RPC and Postgres.

> The decentralized Graph network does not list Story, so the hosted decentralized network is not an option today.

---

## Network config

The manifest is generated from `subgraph.template.yaml` and a per-network config via mustache:

| Network | Config | `network` value |
| --- | --- | --- |
| Aeneid testnet (default) | `config/aeneid.json` | `story-aeneid` |
| Story mainnet | `config/mainnet.json` | `story` |

- `npm run prepare:aeneid` / `npm run codegen` / `npm run build` target Aeneid by default.
- `npm run prepare:mainnet` renders the manifest for mainnet; run `graph codegen` / `graph build` afterward.

---

## Relationship to story-ip-graph-mcp

This subgraph **complements** [story-ip-graph-mcp](https://github.com/alexeymoskalev-devops/story-ip-graph-mcp): the MCP server reads the graph on-chain point-by-point (one IP at a time, live), while this subgraph serves it in aggregate with history — making lineage, royalty totals, and reverse relations queryable in a single GraphQL request.

---

## Part of a 4-repo Story Protocol contribution

Built for the Story "AI × IP" direction, in two independent tracks:

**Track A — agents**
- [story-ip-graph-mcp](https://github.com/alexeymoskalev-devops/story-ip-graph-mcp) — MCP server: derivative/remix registration + IP-graph lineage reads
- [story-ip-agent-demo](https://github.com/alexeymoskalev-devops/story-ip-agent-demo) — autonomous ElizaOS agent that drives the MCP server

**Track B — data**
- **story-subgraph** — open-source The Graph subgraph indexing live Story Protocol — *this repo*
- [story-ip-explorer](https://github.com/alexeymoskalev-devops/story-ip-explorer) — Next.js dashboard + lineage explorer over the subgraph
