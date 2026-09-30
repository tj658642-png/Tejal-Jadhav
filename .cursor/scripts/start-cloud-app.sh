#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "Building client for single-port preview..."
npm run build -w client

export SERVE_CLIENT=true
export PORT=4000
export CLIENT_ORIGIN=*
export VITE_ENABLE_GUEST_DEMO=true

echo "Starting AI Council on http://0.0.0.0:4000 (UI + API)..."
exec npm run dev -w server
