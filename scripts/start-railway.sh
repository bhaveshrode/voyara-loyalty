#!/usr/bin/env bash
set -Eeuo pipefail

PORT="${PORT:-3000}"
RPC_URL="http://127.0.0.1:8545"

if [ -z "${SESSION_SECRET:-}" ]; then
  SESSION_SECRET="$(node -p "require('node:crypto').randomBytes(32).toString('hex')")"
  export SESSION_SECRET
  printf 'WARN: SESSION_SECRET is not set; generated an ephemeral secret for this boot.\n'
fi

export NEXT_PUBLIC_CHAIN_RPC="${NEXT_PUBLIC_CHAIN_RPC:-$RPC_URL}"

CHAIN_PID=""
WEB_PID=""
cleanup() {
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null || true
  [ -n "$CHAIN_PID" ] && kill "$CHAIN_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting Hardhat chain on 127.0.0.1:8545..."
./node_modules/.bin/hardhat node --hostname 127.0.0.1 --port 8545 >/tmp/hardhat.log 2>&1 &
CHAIN_PID=$!

if ! ./node_modules/.bin/wait-on "tcp:127.0.0.1:8545" --timeout 120000; then
  echo "Hardhat chain failed to start:" >&2
  tail -n 50 /tmp/hardhat.log >&2
  exit 1
fi

echo "Deploying contracts and seeding demo data..."
./node_modules/.bin/hardhat run scripts/deploy.js --network localhost

echo "Starting Voyara on 0.0.0.0:${PORT}..."
./node_modules/.bin/next start --hostname 0.0.0.0 --port "$PORT" &
WEB_PID=$!
wait "$WEB_PID"
