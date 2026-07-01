# Prism

Source-backed decision lab for review dossiers.

Prism is a decision console. It turns a claim, a review standard and source evidence into a dossier that can be challenged, appealed and finalized.

## Review Links

| Surface | Link |
| --- | --- |
| Live app | https://assmore22-prism.vercel.app |
| GitHub | https://github.com/assmore22/prism |
| Contract | https://explorer-bradbury.genlayer.com/address/0xA92543730C5eF6139B02646eCD5F88CDe1f74950 |

## Chain Record

- Network: GenLayer Bradbury
- Chain ID: 4221
- Contract: `0xA92543730C5eF6139B02646eCD5F88CDe1f74950`
- Deploy transaction: [0x17e21b13...ead263](https://explorer-bradbury.genlayer.com/tx/0x17e21b13b8a828b28e7ff7e131e487ef2b06e0cdc1655a6ba4c52ffb8aead263)
- Deployed: `2026-07-01T15:49:39.351Z`
- Source: `contracts/prism_v2.py` (32,555 bytes)

## Protocol Path

1. Set a review standard.
2. Create a dossier.
3. Attach evidence.
4. Run review.
5. Challenge, appeal or finalize.

The frontend reads dossier lists, evidence, review status and final decisions. Contract state is public; write actions still require a connected wallet on GenLayer Bradbury.

## Bradbury Smoke

| Action | Transaction |
| --- | --- |
| `open_dossier` | [0x202adcda...8c8517](https://explorer-bradbury.genlayer.com/tx/0x202adcda0af5ae48a016b445476cc8ff4d696d35028fdf88277789c3378c8517) |

Read verification passed on Bradbury after deploy. The public app points at this contract address and reads accepted state.

## Local Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Release Hygiene

The public package is static and has no install step. Vercel receives only frontend, contract source and public deployment metadata.

Keep wallet private keys, vault exports, `.env` files, Vercel project state and dashboard data out of Git. This repository is for public source, UI, tests and deployment receipts only.
