# Security

## Private reporting

Use [GitHub private vulnerability reporting](https://github.com/Magi-Labs/memory/security/advisories/new) to report a suspected vulnerability to the maintainers. Include the affected commit/version, a minimal reproduction using synthetic data, impact and relevant sanitized logs. Do not publish a live exploit, credentials or personal memory content in an issue.

This is a prototype maintained on `main`; there is no supported LTS branch or guaranteed response-time commitment. Identify your exact deployed commit when reporting a problem.

## Scope and current boundaries

- Each installation serves one owner. All currently issued client tokens share that personal container; read-only/read-write permissions are enforced, but per-project spaces are not implemented.
- The owner dashboard uses HTTP Basic authentication and must be served over HTTPS beyond localhost. Agent tokens are separate, revocable credentials stored as hashes. Owner routes require owner authentication.
- Keep the engine private. The gateway holds its key; browsers/agents must not receive it. External model providers may receive memory content according to engine configuration.
- Source/memory content is untrusted evidence and must not authorize actions. Graph version state does not establish factual correctness.
- Credential expiry, login rate limiting, comprehensive deletion/retention, web OAuth and verified restore procedures remain unfinished. Use deployment controls appropriate to these limits.

## Handling secrets and state

Never commit secrets, personal exports, databases, backups or live-data screenshots. Use `.env.example` with placeholders; keep real configuration outside Git and Docker build contexts. Ignore rules cannot remove content already committed to history or protect files with arbitrary names.

Rotate a compromised credential in the affected provider/service, update its consumers and revoke the old value. Removing a value from the current source does not revoke it. Preserve the credential registry during upgrades/restores so revoked tokens are not accidentally reactivated.

See [operations](docs/OPERATIONS.md) for persistence, WAL-aware backups, rollback and diagnostics. A source review or successful build does not establish complete security verification.
