#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f package.json ]]; then
  echo "error: repository checkout incomplete" >&2
  exit 1
fi

echo "Environment start OK."
