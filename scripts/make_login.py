"""Generate dashboard login hashes; the password is never printed or stored."""
import getpass
import hashlib
import secrets

email = input("Dashboard email: ").strip()
password = getpass.getpass("New password: ")
confirmation = getpass.getpass("Confirm password: ")
if password != confirmation or len(password) < 16:
    raise SystemExit("Passwords must match and contain at least 16 characters.")
salt = secrets.token_bytes(16)
print("LOGIN_EMAIL=" + email)
print("LOGIN_SALT=" + salt.hex())
print("LOGIN_HASH=" + hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600000).hex())
