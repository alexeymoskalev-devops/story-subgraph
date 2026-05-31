# Run on aeneid testnet — story-subgraph

The Graph subgraph indexing the current Story protocol. **Needs Docker (colima).**

```bash
colima start --disk 100      # NOT plain `colima start` — match the VM's existing disk (shrink bug)
npm install                  # postinstall patches graph-cli's Apple-Silicon CPU detection
```

Fast local sync — edit `config/aeneid.json` `startBlock` from `0` to a recent block (e.g. `18960000`); `0` indexes from genesis (slow).

```bash
docker-compose up -d         # graph-node + ipfs + postgres (postgres locale=C is already in the compose)
npm run codegen && npm run build
curl -s -X POST localhost:8020 -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"subgraph_create","params":{"name":"story-subgraph"}}'
npx graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 --version-label v0.0.1 story-subgraph
```

Wait for sync, then query:
```
endpoint:  http://localhost:8000/subgraphs/name/story-subgraph
status:    POST http://localhost:8030/graphql  { indexingStatusForCurrentVersion(subgraphName:"story-subgraph"){ synced } }
smoke:     { ipasset(id:"0x0b4df5a3d6dfe94dc8dc28f26006fa25638b351d"){ parentCount parents{ parent{ id } } } }
```

Teardown: `docker-compose down -v && colima stop`.
Unit tests (no Docker): `npm test` (6 matchstick tests).

**Public/hosted:** `goldsky login` + `npm run deploy:goldsky` (Story isn't on the decentralized Graph network — use Goldsky or self-host).

See `../story_contrib/RUN.md`.
