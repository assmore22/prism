# Prism

Source-backed decision lab for review dossiers.

Prism is a decision console. It turns a claim, a review standard and source evidence into a dossier that can be challenged, appealed and finalized.

## Review Links

| Surface | Link |
| --- | --- |
| Live app | https://assmore22-prism.vercel.app |
| GitHub | https://github.com/assmore22/prism |
| Contract | https://explorer-studio.genlayer.com/contracts/0xE76D95DF6D7199fEFdD376B4d592509eD7179D69 |

## Chain Record

- Network: GenLayer Studionet
- Chain ID: 61999
- Contract: `0xE76D95DF6D7199fEFdD376B4d592509eD7179D69`
- Deploy transaction: [0x90b91671...69000b](https://explorer-studio.genlayer.com/tx/0x90b916719daf150988e90f2e6682640698c2058d896989d3a31940c61b69000b)
- Deployed: `2026-06-24T04:40:33.164Z`
- Source: `contracts/prism_v2.py` (32,555 bytes)

## Protocol Path

1. Set a review standard.
2. Create a dossier.
3. Attach evidence.
4. Run review.
5. Challenge, appeal or finalize.

The frontend reads dossier lists, evidence, review status and final decisions. Contract state is public; write actions still require a connected wallet on GenLayer Studionet.

## Finalized Smoke

| Action | Transaction |
| --- | --- |
| `set_standard` | [0xf7ab18a6...c3455c](https://explorer-studio.genlayer.com/tx/0xf7ab18a67a14786de087212ec96c2dd17be6a9271613905b5590c2c964c3455c) |
| `open_dossier` | [0x1f74e0b9...e25d55](https://explorer-studio.genlayer.com/tx/0x1f74e0b949acf467629ed0a9597f5b88ad3ee393a2c51ea1f5a2d2338be25d55) |
| `add_evidence_web` | [0xe8b5cbb7...81cf93](https://explorer-studio.genlayer.com/tx/0xe8b5cbb7ff036489afbda876be59cd79b48d07fa9888bceb7c8db84c4681cf93) |
| `add_evidence_security` | [0x69b011ca...3ae896](https://explorer-studio.genlayer.com/tx/0x69b011ca93490d35e8111027758e942bf0c4d170a94ecdbdd3c38626e43ae896) |
| `add_evidence_whitepaper` | [0xebe9da45...bf2824](https://explorer-studio.genlayer.com/tx/0xebe9da45daeacf8414c5bde124c282026a30420abdd2e907c8d5cfbc6cbf2824) |
| `review` | [0xaf36d373...138c1d](https://explorer-studio.genlayer.com/tx/0xaf36d3730227a9a01430dabf001f4e17a07fa1baa3b24f31c4d371fafb138c1d) |

## Local Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Release Hygiene

The public package is static and has no install step. Vercel receives only frontend, contract source and public deployment metadata.

Keep wallet private keys, vault exports, `.env` files, Vercel project state and dashboard data out of Git. This repository is for public source, UI, tests and deployment receipts only.
