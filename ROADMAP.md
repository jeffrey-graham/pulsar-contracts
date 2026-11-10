# Pulsar Product Roadmap & Milestone Planning Board

This document communicates planned features, engineering priorities, and release milestones (`v0.1`, `v0.2`, `v1.0`) for contributors and integrators.

---

## Milestone Planning Board Summary

| Milestone | Status | Focus Theme | Target Completion Criteria |
|---|---|---|---|
| **v0.1 (Current)** | Shipped | Core payment infrastructure on Soroban Stellar | Merchant registry, ed25519 signed payments, 30-day refunds, N-of-N multisig, paginated history, CI & SDK error registry |
| **v0.2 (Bug Fixes & DX)** | In Progress | Stability, developer experience, and off-chain tooling | Resolve all v0.1 contract/frontend bugs, webhook notifications, payer/merchant UI flows, multi-token filters, and E2E test suite |
| **v1.0 (Production-Ready)** | Planned | Security audit, performance, and mainnet readiness | External security audit sign-off, WASM resource optimization, mainnet deployment, rate limiting, and verified upgrade workflow |

---

## v0.1 — Current (Shipped)

**Theme:** Core payment infrastructure on Soroban Stellar.

### Acceptance Criteria
- [x] Merchant registry (`register_merchant`, `deactivate_merchant`, `get_merchant_info`)
- [x] Signed payments via ed25519 signature verification (`process_payment_with_signature`)
- [x] Refund lifecycle (`initiate_refund` → `approve_refund` / `reject_refund` → `execute_refund`, 30-day window + 1-hour grace buffer)
- [x] Multi-signature payments (`initiate_multisig_payment`, `sign_multisig_payment`, N-of-N signers)
- [x] Cursor-based paginated payment history (`get_payment_history_by_merchant`, `get_payer_payment_history`)
- [x] Global and merchant analytics (`get_global_payment_stats`, `get_merchant_stats`)
- [x] CI pipeline (`cargo fmt`, `clippy`, unit & property tests, WASM size gate, `cargo audit`, `cargo deny`)
- [x] Structured error registry (`sdk/error-registry.json`, `sdk/errors.ts`) synchronized with `error.rs`

---

## v0.2 — Bug Fixes & DX

**Theme:** Stability, developer experience, and off-chain tooling.

### Acceptance Criteria
- [ ] Webhook / notification service for payment and refund events (`BE-002`)
- [ ] Payer payment history UI with Freighter wallet connection and URL filter sync (`FE-002`)
- [ ] Transaction confirmation screen before submitting payment or refund (`FE-011` / `#106`)
- [ ] Graceful Clipboard API fallback and error tooltip in `CopyButton` (`FE-013` / `#108`)
- [ ] End-to-end Playwright test suite covering wallet connect, merchant registration, payment processing, and refund initiation (`FE-015` / `#110`)
- [ ] Multi-token filtering in `PaymentFilter.tokens` (`MISC-003` / `#113`)
- [ ] All known v0.1 contract and frontend bugs resolved (`SC-001`–`SC-015`, `FE-001`–`FE-015`)
- [ ] TypeScript SDK published with full contract bindings and idempotency helpers
- [ ] Integration test suite covering all contract entry-points
- [ ] Deployment guide expanded with mainnet runbook instructions

---

## v1.0 — Production-Ready

**Theme:** Security audit, performance, and ecosystem readiness.

### Acceptance Criteria
- [ ] Independent third-party security audit completed with all critical/high findings resolved
- [ ] Gas / Soroban CPU & memory resource optimization pass on all contract functions (WASM binary < 80 KB warning threshold)
- [ ] Mainnet deployment with verified contract address and multi-admin threshold governance
- [ ] Full API documentation site auto-generated from contract ABI and Rustdoc
- [ ] Complete Merchant Dashboard UI (registration, payment analytics, refund approvals, webhook management)
- [ ] Off-chain API gateway rate limiting and abuse-prevention mechanisms
- [ ] Contract WASM upgrade path (`upgrade`) documented and verified end-to-end on Testnet

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to claim and submit pull requests for issues tied to these milestones.
