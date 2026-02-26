#!/bin/sh
# Runs the backend server locally.
# Self-repairs common missing pieces:
# - Creates .venv if missing (Windows/macOS/Linux)
# - Installs Python deps from requirements.txt
# - Creates .env from .env.example if missing
# - Runs Alembic migrations (can be skipped)

set -eu

# Prefer a predictable PATH; some shells start with missing /usr/bin.
PATH="/usr/local/bin:/usr/bin:/bin:${PATH:-}"
export PATH

# Clear any existing admin exports so backend/.env controls bootstrap behavior.
unset ADMIN_USERNAME ADMIN_EMAIL ADMIN_PASSWORD 2>/dev/null || true

log() {
	printf '%s\n' "$*"
}

die() {
	log "ERROR: $*"
	exit 1
}

SCRIPT_DIR=${0%/*}
if [ "$SCRIPT_DIR" = "$0" ]; then
	SCRIPT_DIR="."
fi
cd "$SCRIPT_DIR" || die "Failed to cd into script directory: $SCRIPT_DIR"

VENV_PY=""
if [ -f ".venv/Scripts/python.exe" ]; then
	VENV_PY=".venv/Scripts/python.exe" # Windows
elif [ -f ".venv/bin/python" ]; then
	VENV_PY=".venv/bin/python" # macOS/Linux
fi

if [ -z "$VENV_PY" ]; then
	PYTHON_BIN=""
	PYTHON_ARGS=""
	if command -v python >/dev/null 2>&1; then
		PYTHON_BIN="python"
	elif command -v python3 >/dev/null 2>&1; then
		PYTHON_BIN="python3"
	elif command -v py >/dev/null 2>&1; then
		PYTHON_BIN="py"
		PYTHON_ARGS="-3"
	else
		die "Python is not installed or not on PATH, and .venv is missing/corrupted. Install Python 3 and retry."
	fi

	if [ -d ".venv" ]; then
		log "--- Detected broken .venv (missing python); recreating .venv ---"
		rm -rf .venv 2>/dev/null || true
	fi

	log "--- Creating Python virtual environment (.venv) ---"
	"$PYTHON_BIN" $PYTHON_ARGS -m venv .venv || die "Failed to create virtual environment (.venv)."

	if [ -f ".venv/Scripts/python.exe" ]; then
		VENV_PY=".venv/Scripts/python.exe"
	elif [ -f ".venv/bin/python" ]; then
		VENV_PY=".venv/bin/python"
	else
		die "Created .venv but cannot find python executable inside it."
	fi
fi

log "--- Using virtual environment Python ---"

log "--- Ensuring pip tooling is present ---"
PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_NO_INPUT=1 "$VENV_PY" -m pip install --upgrade pip setuptools wheel >/dev/null 2>&1 || true

if [ -f "requirements.txt" ]; then
	REQ_HASH=$("$VENV_PY" - <<'PY'
import hashlib
from pathlib import Path

data = Path('requirements.txt').read_bytes()
print(hashlib.sha256(data).hexdigest())
PY
	)
	MARKER_FILE=".venv/.requirements.sha256"
	OLD_HASH=""
	if [ -f "$MARKER_FILE" ]; then
		OLD_HASH=$(cat "$MARKER_FILE" 2>/dev/null || true)
	fi

	if [ "$OLD_HASH" != "$REQ_HASH" ]; then
		log "--- Installing backend dependencies (requirements.txt) ---"
		PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_NO_INPUT=1 "$VENV_PY" -m pip install -r requirements.txt || die "Failed to install Python dependencies."
		echo "$REQ_HASH" > "$MARKER_FILE" 2>/dev/null || true
	else
		log "--- Backend dependencies already installed ---"
	fi
else
	die "requirements.txt not found."
fi

if [ ! -f ".env" ]; then
	if [ -f ".env.example" ]; then
		log "--- Creating backend .env from .env.example ---"
		cp ".env.example" ".env" || die "Failed to create .env from .env.example."
		log "NOTE: Review backend/.env and set any required values."
	else
		log "--- Creating empty backend .env (no .env.example found) ---"
		: > .env
	fi
fi

log "--- Validating/self-repairing backend .env ---"
"$VENV_PY" - <<'PY'
from pathlib import Path

env_path = Path('.env')
if not env_path.exists():
	raise SystemExit(0)

original = env_path.read_text(encoding='utf-8', errors='ignore')
raw = original.replace('\r\n', '\n').replace('\r', '\n')
lines = raw.splitlines()

def find_value(key: str) -> str:
	prefix = key + '='
	for line in lines:
		if not line or line.lstrip().startswith('#'):
			continue
		if line.startswith(prefix):
			return line.split('=', 1)[1]
	return ''

updated = False
if raw != original:
	print('NOTE: Normalized line endings in backend/.env')
	updated = True

# Fix malformed "CLOUDINARY_URL=CLOUDINARY_URL=..." if present.
for i, line in enumerate(lines):
	if line.startswith('CLOUDINARY_URL='):
		val = line.split('=', 1)[1]
		if val.startswith('CLOUDINARY_URL='):
			lines[i] = 'CLOUDINARY_URL=' + val.split('=', 1)[1]
			print('NOTE: Fixed malformed CLOUDINARY_URL in backend/.env')
			updated = True

admin_user = find_value('ADMIN_USERNAME').strip()
admin_email = find_value('ADMIN_EMAIL').strip()
admin_pass = find_value('ADMIN_PASSWORD').strip()

any_admin = bool(admin_user or admin_email or admin_pass)
all_admin = bool(admin_user and admin_email and admin_pass)
if any_admin and not all_admin:
	if not admin_user:
		admin_user = 'admin'
	if not admin_email:
		admin_email = 'admin@example.com'
	if not admin_pass:
		admin_pass = 'admin123'
	print('NOTE: Filled missing ADMIN_* values in backend/.env for local bootstrap')
	replacements = {
		'ADMIN_USERNAME': admin_user,
		'ADMIN_EMAIL': admin_email,
		'ADMIN_PASSWORD': admin_pass,
	}
	present = set()
	for i, line in enumerate(lines):
		for k, v in replacements.items():
			if line.startswith(k + '='):
				lines[i] = f'{k}={v}'
				present.add(k)
				updated = True
	for k, v in replacements.items():
		if k not in present:
			lines.append(f'{k}={v}')
			updated = True

if updated:
	env_path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
PY

if [ "${SKIP_MIGRATIONS:-}" != "1" ] && [ -f "alembic.ini" ] && [ -d "alembic" ]; then
	log "--- Running database migrations (alembic upgrade head) ---"
	"$VENV_PY" -m alembic -c alembic.ini upgrade head || die "Alembic migrations failed. Set SKIP_MIGRATIONS=1 to bypass."
fi

PORT="${PORT:-8000}"
if [ "${DRY_RUN:-}" = "1" ]; then
	log "--- DRY_RUN=1: bootstrap complete; not starting server ---"
	exit 0
fi

log "--- Starting Backend Server (localhost:${PORT}) ---"
exec "$VENV_PY" -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --reload