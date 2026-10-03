"""Persistent credentials and append-only handoff revisions for a single owner."""
import hashlib
import json
import os
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path


def now():
    return datetime.now(timezone.utc).isoformat()


class Conflict(ValueError):
    pass


class Store:
    def __init__(self, directory):
        self.directory = Path(directory)
        self.path = self.directory / "control.db"

    @contextmanager
    def connect(self):
        connection = sqlite3.connect(self.path, timeout=15)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys=ON")
        try:
            yield connection
            connection.commit()
        except BaseException:
            connection.rollback()
            raise
        finally:
            connection.close()

    def initialize(self):
        os.umask(0o077)
        self.directory.mkdir(mode=0o700, parents=True, exist_ok=True)
        with self.connect() as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.executescript("""
                CREATE TABLE IF NOT EXISTS credentials (
                    id TEXT PRIMARY KEY, name TEXT NOT NULL, prefix TEXT NOT NULL,
                    digest TEXT UNIQUE NOT NULL, scopes TEXT NOT NULL,
                    created_at TEXT NOT NULL, last_used_at TEXT, revoked_at TEXT);
                CREATE TABLE IF NOT EXISTS handoffs (
                    project TEXT NOT NULL, version INTEGER NOT NULL,
                    request_id TEXT NOT NULL, payload TEXT NOT NULL,
                    payload_hash TEXT NOT NULL, author TEXT NOT NULL, created_at TEXT NOT NULL,
                    PRIMARY KEY(project, version), UNIQUE(project, request_id));
            """)
            for credential_id, name, variable in [
                ("initial", "Existing shared credential", "MCP_KEY_SHA256"),
                ("codex", "Codex · existing Keychain credential", "MCP_CODEX_KEY_SHA256")]:
                digest = os.environ.get(variable, "")
                if digest:
                    if len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
                        raise ValueError(variable + " must be a SHA-256 hex digest")
                    db.execute("INSERT OR IGNORE INTO credentials VALUES (?,?,?,?,?,?,NULL,NULL)",
                        (credential_id, name, "Existing key", digest, "read,write", now()))
        self.path.chmod(0o600)

    def credentials(self):
        with self.connect() as db:
            rows = db.execute("SELECT id,name,prefix,scopes,created_at,last_used_at,revoked_at "
                              "FROM credentials ORDER BY created_at DESC").fetchall()
        return [dict(row) for row in rows]

    def create_credential(self, name, access):
        token = "smcp_" + secrets.token_urlsafe(32)
        credential_id = secrets.token_hex(12)
        scopes = "read,write" if access == "read_write" else "read"
        with self.connect() as db:
            db.execute("INSERT INTO credentials VALUES (?,?,?,?,?,?,NULL,NULL)",
                (credential_id, name, token[:10] + "…", hashlib.sha256(token.encode()).hexdigest(),
                 scopes, now()))
        return {"id": credential_id, "token": token}

    def authenticate(self, token):
        digest = hashlib.sha256(token.encode()).hexdigest()
        with self.connect() as db:
            row = db.execute("SELECT id,name,scopes FROM credentials WHERE digest=? AND revoked_at IS NULL",
                             (digest,)).fetchone()
            if row:
                # At most once per minute, to avoid a write on every MCP request.
                timestamp = now()
                db.execute("UPDATE credentials SET last_used_at=? WHERE id=? AND "
                    "(last_used_at IS NULL OR last_used_at < ?)",
                    (timestamp, row["id"], timestamp[:16]))
                return {"id": row["id"], "name": row["name"], "scopes": row["scopes"].split(",")}
        return None

    def revoke(self, credential_id):
        with self.connect() as db:
            cursor = db.execute("UPDATE credentials SET revoked_at=COALESCE(revoked_at,?) WHERE id=?",
                                (now(), credential_id))
            return cursor.rowcount > 0

    def list_handoffs(self):
        with self.connect() as db:
            rows = db.execute("SELECT h.* FROM handoffs h JOIN "
                "(SELECT project,MAX(version) version FROM handoffs GROUP BY project) latest "
                "ON latest.project=h.project AND latest.version=h.version ORDER BY h.created_at DESC").fetchall()
        return [self.unpack(row) for row in rows]

    def get_handoff(self, project, version=None):
        with self.connect() as db:
            if version is None:
                row = db.execute("SELECT * FROM handoffs WHERE project=? ORDER BY version DESC LIMIT 1",
                                 (project,)).fetchone()
            else:
                row = db.execute("SELECT * FROM handoffs WHERE project=? AND version=?",
                                 (project, version)).fetchone()
        return self.unpack(row) if row else None

    @staticmethod
    def unpack(row):
        return {"project": row["project"], "version": row["version"], "context": json.loads(row["payload"]),
                "author": row["author"], "created_at": row["created_at"]}

    def save_handoff(self, project, payload, expected_version, request_id, author):
        encoded = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
        digest = hashlib.sha256(encoded.encode()).hexdigest()
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            previous = db.execute("SELECT * FROM handoffs WHERE project=? AND request_id=?",
                                  (project, request_id)).fetchone()
            if previous:
                if previous["payload_hash"] != digest:
                    raise Conflict("This request_id was already used for different context")
                return self.unpack(previous)
            current = db.execute("SELECT MAX(version) FROM handoffs WHERE project=?", (project,)).fetchone()[0] or 0
            if current != expected_version:
                raise Conflict(f"Handoff changed: expected version {expected_version}, current version {current}. Read it and reconcile before saving.")
            version = current + 1
            timestamp = now()
            db.execute("INSERT INTO handoffs (project,version,request_id,payload,payload_hash,author,created_at) VALUES (?,?,?,?,?,?,?)",
                (project, version, request_id, encoded, digest, author, timestamp))
            return {"project": project, "version": version, "context": payload,
                    "author": author, "created_at": timestamp}
