# 🌐 Invokix Cloud — Web Platform & API Gateway

This directory powers the **[Invokix](https://invokix.com)** cloud application, dashboard interface, and real-time API services.

---

### Core Architecture

- **Contract Workspace & Studio:** Interactive visual editor for OpenAPI 3.0 contracts, version diffs, and consumer tracking maps.
- **AI Synthesis Pipeline:** Low-latency spec generation and additive merging powered by Groq and Anthropic models.
- **Zero-Cold-Start Mock Proxy:** Dynamic, in-process API mock runtime (`/api/mock-proxy/:contractId/...`) delivering schema-accurate responses without external container latency.
- **CLI Sync Gateway:** Secure OAuth browser handshakes and authenticated token distribution (`/api/cli/...`) for `npx invokix pull`.
- **Signal Notification Dispatcher:** Automated webhook and email dispatch to Slack, Discord, and Resend on breaking changes.

---

### Links & Resources

- **Website:** [invokix.com](https://invokix.com)
- **Documentation:** [invokix.com/docs](https://invokix.com/docs)
- **Developer CLI:** `npx invokix pull`
- **Main Overview:** [Project README](../README.md)
