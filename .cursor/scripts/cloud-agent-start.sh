#!/usr/bin/env bash
set -euo pipefail

# Per-boot sanity check; no long-running services in this starter repository.
if [[ ! -f README.md ]]; then
  echo "error: repository checkout incomplete" >&2
  exit 1
fi

echo "Environment start OK."
