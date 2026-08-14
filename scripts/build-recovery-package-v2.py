import os
import shutil
import hashlib
import json

SOURCE_DIR = "/Users/progressopro/Projects/hermes-connect-prototype"
BACKUP_DIR = "/Users/progressopro/Projects/hermes-connect-prototype-recovery-package"
SNAPSHOT_DIR = os.path.join(BACKUP_DIR, "snapshot")

# 1. Clean snapshot directory if exists
if os.path.exists(SNAPSHOT_DIR):
    shutil.rmtree(SNAPSHOT_DIR)
os.makedirs(SNAPSHOT_DIR, exist_ok=True)

# 2. Files to copy recursively
def copy_recursive(src, dest):
    for item in os.listdir(src):
        src_path = os.path.join(src, item)
        dest_path = os.path.join(dest, item)
        
        # Exclude directories
        if os.path.isdir(src_path):
            if item in ["node_modules", ".wrangler"]:
                continue
            os.makedirs(dest_path, exist_ok=True)
            copy_recursive(src_path, dest_path)
        else:
            # Exclude specific secret-bearing files and raw dumps
            if item in ["d1-production-export.sql", ".dev.vars", "settings.local.json"]:
                continue
            shutil.copy2(src_path, dest_path)

copy_recursive(SOURCE_DIR, SNAPSHOT_DIR)

# 3. Create redacted/template versions of secret-bearing files
# .dev.vars template
os.makedirs(SNAPSHOT_DIR, exist_ok=True)
with open(os.path.join(SNAPSHOT_DIR, ".dev.vars"), "w") as f:
    f.write("TELEGRAM_BOT_TOKEN=[REDACTED_SECRET]\n")

# .claude directory structure
os.makedirs(os.path.join(SNAPSHOT_DIR, ".claude"), exist_ok=True)
# Read existing settings.local.json, redact CLI entries containing secrets
settings_path = os.path.join(SOURCE_DIR, ".claude", "settings.local.json")
if os.path.exists(settings_path):
    with open(settings_path, "r") as f:
        data = json.load(f)
    
    # Redact permissions allow list entries that contain long auth parameters or tokens
    allowed_commands = data.get("permissions", {}).get("allow", [])
    redacted_commands = []
    for cmd in allowed_commands:
        if any(w in cmd.lower() for w in ["token", "key", "bot", "execute", "password", "hash"]):
            redacted_commands.append("[REDACTED_AUTOMATICALLY_APPROVED_COMMAND_WITH_POTENTIAL_SECRETS]")
        else:
            redacted_commands.append(cmd)
    
    data["permissions"]["allow"] = redacted_commands
    
    with open(os.path.join(SNAPSHOT_DIR, ".claude", "settings.local.json"), "w") as f:
        json.dump(data, f, indent=2)

# 4. Generate the Redacted Secret Inventory markdown file
inventory_content = """# Redacted Secret Inventory

This document lists the location, type, and consumer details of all secret-bearing files and configurations identified in `hermes-connect-prototype`. The plaintext values have been excluded from the recovery snapshot to comply with security guidelines.

| File Path | Credential Type | Active Consumer | Rotation Required | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `.dev.vars` | Telegram Bot Token | Wrangler Pages Functions / local dev server | **YES** | Used by `telegram.ts` for active Telegram login bot verification. |
| `.claude/settings.local.json` | Gemini API Key / approved CLI commands | Claude Code agent CLI commands | **YES** | Contained previous terminal executions with sensitive keys in plain text. |
"""

with open(os.path.join(BACKUP_DIR, "REDACTED_SECRET_INVENTORY.md"), "w") as f:
    f.write(inventory_content)

# 5. Build recovery-manifest-v2 listing all files and SHA-256 hashes
manifest_entries = []

def calculate_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while True:
            chunk = f.read(65536)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()

# Add d1-production-export.sql
export_path = os.path.join(BACKUP_DIR, "d1-production-export.sql")
if os.path.exists(export_path):
    manifest_entries.append(f"{calculate_sha256(export_path)}  d1-production-export.sql")

# Add REDACTED_SECRET_INVENTORY.md
inv_path = os.path.join(BACKUP_DIR, "REDACTED_SECRET_INVENTORY.md")
manifest_entries.append(f"{calculate_sha256(inv_path)}  REDACTED_SECRET_INVENTORY.md")

# Add recursively all files inside snapshot/
for root, _, files in os.walk(SNAPSHOT_DIR):
    for file in files:
        full_path = os.path.join(root, file)
        rel_path = os.path.relpath(full_path, BACKUP_DIR)
        sha = calculate_sha256(full_path)
        manifest_entries.append(f"{sha}  {rel_path}")

# Save recovery-manifest-v2
manifest_path = os.path.join(BACKUP_DIR, "recovery-manifest-v2")
with open(manifest_path, "w") as f:
    f.write("\n".join(manifest_entries) + "\n")

# Calculate checksum of the manifest file itself
manifest_sha = calculate_sha256(manifest_path)
with open(os.path.join(BACKUP_DIR, "recovery-manifest-v2.sha256"), "w") as f:
    f.write(f"{manifest_sha}  recovery-manifest-v2\n")

print("V2 Recovery package build completed.")
print(f"Manifest checksum: {manifest_sha}")
