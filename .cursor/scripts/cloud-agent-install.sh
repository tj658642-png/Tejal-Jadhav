#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f README.md ]]; then
  echo "error: README.md not found after checkout" >&2
  exit 1
fi

mkdir -p .cursor/state
date -u +"%Y-%m-%dT%H:%M:%SZ" > .cursor/state/last-install.txt

echo "Tejal-Jadhav repository bootstrap complete."
echo "Project: $(head -n 1 README.md | sed 's/^# *//')"
