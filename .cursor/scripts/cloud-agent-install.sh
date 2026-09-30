#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f package.json ]]; then
  echo "error: package.json not found" >&2
  exit 1
fi

npm install

mkdir -p .cursor/state
date -u +"%Y-%m-%dT%H:%M:%SZ" > .cursor/state/last-install.txt

echo "AI Council repository bootstrap complete."
