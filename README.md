# Prism

The project is a source-backed GenLayer workflow, with frontend views designed around evidence status rather than generic contract buttons.

A source-backed decision lab.

## Prism Brief

This repo is organized for review: the app can be opened locally, the contract source is present, and the deployed Studionet address is pinned in `deployment.json`.

- Folder: `projects/31-prism`
- Frontend shape: static browser app
- Contract source: `contracts/prism_v2.py`
- Build status: Schema-valid (32555 bytes); deploy finalized; 13 write smoke txs finalized incl GenLayer review, challenge and appeal; 26/26 read tests passed; static frontend uses shared router only.
- Logo asset: FontAwesome gem (faGem) + plain text wordmark 'Prism'

## Evidence Mechanics

Prism V2 (# v0.2.16), 32k bytes, schema-valid.

- Primary source: `contracts/prism_v2.py` (32,555 bytes)
- Public write/action methods: 12
- Read methods: 16
- GenLayer features: live web rendering, LLM adjudication, validator-comparative consensus, indexed storage, append-only collections

Typical flow: `open_dossier` -> `submit_challenge` -> `set_review_standard` -> `resolve_challenge_with_genlayer` -> `open_challenge_window` -> `submit_appeal` -> `archive_dossier`

Useful reads: `get_dossier_count`, `get_dossier`, `get_dossier_record`, `get_evidence`, `get_reviews`, `get_challenges`, `get_appeals`, `get_audit_log`

## Deployment Evidence

- Network: studionet (61999)
- Contract: [0xE76D95DF6D7199fEFdD376B4d592509eD7179D69](https://explorer-studio.genlayer.com/contracts/0xE76D95DF6D7199fEFdD376B4d592509eD7179D69)
- Deploy tx: [0x90b91671...69000b](https://explorer-studio.genlayer.com/tx/0x90b916719daf150988e90f2e6682640698c2058d896989d3a31940c61b69000b)
- Deployed at: 2026-06-24T04:40:33.164Z
- Smoke writes recorded: 13

Smoke coverage:

- set_standard: [0xf7ab18a6...c3455c](https://explorer-studio.genlayer.com/tx/0xf7ab18a67a14786de087212ec96c2dd17be6a9271613905b5590c2c964c3455c)
- open_dossier: [0x1f74e0b9...e25d55](https://explorer-studio.genlayer.com/tx/0x1f74e0b949acf467629ed0a9597f5b88ad3ee393a2c51ea1f5a2d2338be25d55)
- add_evidence_web: [0xe8b5cbb7...81cf93](https://explorer-studio.genlayer.com/tx/0xe8b5cbb7ff036489afbda876be59cd79b48d07fa9888bceb7c8db84c4681cf93)
- add_evidence_security: [0x69b011ca...3ae896](https://explorer-studio.genlayer.com/tx/0x69b011ca93490d35e8111027758e942bf0c4d170a94ecdbdd3c38626e43ae896)
- add_evidence_whitepaper: [0xebe9da45...bf2824](https://explorer-studio.genlayer.com/tx/0xebe9da45daeacf8414c5bde124c282026a30420abdd2e907c8d5cfbc6cbf2824)
- review: [0xaf36d373...138c1d](https://explorer-studio.genlayer.com/tx/0xaf36d3730227a9a01430dabf001f4e17a07fa1baa3b24f31c4d371fafb138c1d)

## Inspect The App

```powershell
cd <private-workspace-root>
npm run preview:start
npm run preview:project -- 31-prism
```

Open http://localhost:8080/31-prism/.

## Shipping Notes

```powershell
cd <private-workspace-root>
npm run publish:project -- -Project 31-prism -Repo https://github.com/aspro45/<repo-name>.git
```

## Security Notes

The repo is designed for public GitHub/Vercel release. Keep `.env`, `.vercel/`, wallet vaults, private keys and local dashboard state out of git. The publisher script enforces these ignore rules before it pushes.
