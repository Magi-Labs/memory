# Operations

## Deployment

The control plane and Supermemory engine are separate processes. Put the engine on a private network. Expose the control plane through HTTPS, with `PUBLIC_ORIGIN` exactly matching the browser origin. Do not forward the engine key to browsers or agents.

Use a persistent `/app/state` for the control plane. The image runs as UID 10001. For a bind mount, create the host directory with owner UID/GID 10001 and mode 0700. Compose's named volume uses the image directory's ownership on first creation.

The initial Docker Compose example binds only `127.0.0.1:8080`; a host reverse proxy can reach that port. For a container-based reverse proxy, use a private shared Docker network instead. Engine installation and provider configuration follow upstream instructions; engine binaries and data are not bundled in this project.

## Credential lifecycle

New credentials are shown once, and only hashes are retained. Give clients clear names such as “Codex · desktop” and “Hermes · laptop”. A read-only credential cannot save handoffs or mutate durable sources. Neither read-only nor read/write credentials can administer keys.

Existing environment hashes are seeded once into the registry. Revoking an imported key does not erase its old environment variable; the persistent revoked record blocks it on normal restarts. Do not delete the registry to reset credentials: that can reactivate imported keys and erase later revocations. Rotation should create a new token, move the client to it, then revoke the old token.

Expiry, per-space grants, login rate limiting, and a dedicated recovery flow are pending. Treat “last used” as authenticated request telemetry; it does not prove a full agent integration works.

## Backup boundaries

Back up both the engine's complete state and the control plane's `control.db`. SQLite uses WAL: use SQLite's backup API or stop the gateway before copying database files. A bare copy of `control.db` during writes can omit committed WAL data. Keep backups encrypted and outside the Git checkout.

Supermemory's raw directory includes its own credentials/encryption-related state. A source-document export or the visual graph is not established as a complete replacement for that backup. Follow the upstream recovery requirements for the installed binary.

An independently retained source journal and complete portable export are next work. Recovery drills and measured restoration guarantees have not been completed.

## Gateway-only upgrade

For the existing installation, the upgrade package changes the gateway image/UI and adds a persistent control-state mount. Preserve the engine service, its image, volume, environment, and proxy routing. Preserve owner login hashes and the existing credential hashes. Save a restricted backup of the current source, Dockerfile, Compose file, and gateway environment before replacing anything.

Build the new gateway image before restarting it. Recreate only the gateway service. Observe startup logs and container state; these are deployment signals, not a substitute for requested end-to-end verification. Reconnect clients to discover added tools.

## Rollback

Restore the backed-up gateway source, Dockerfile, Compose file, and environment, rebuild that gateway, and recreate only that service. Keep the new control-state directory for recovery. A rollback to the old gateway understands only its original static keys and does not enforce the new registry's revocations; assess that before restoring the old implementation.

## Data removal and retention

The original memory delete tool requires a verified document ID and explicit human intent. Handoff revision deletion, comprehensive derived-data removal, queued-job cancellation, and backup expiry are not yet complete. Establish those policies before treating this prototype as a fully governed archive.

## Diagnostics and secrets

HTTP access logs are disabled. Never print environment files, helper stdout, bearer tokens, passwords, or complete personal exports in diagnostics. Return upstream status and safe errors, not upstream response bodies containing private context. Provider/model settings remain deployment secrets/configuration outside the repository.
