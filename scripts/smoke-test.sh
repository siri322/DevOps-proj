#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:8080}"

curl --fail --silent "$BASE_URL/payment/healthz" >/dev/null
curl --fail --silent "$BASE_URL/consumer/healthz" >/dev/null
curl --fail --silent "$BASE_URL/driver/healthz" >/dev/null
curl --fail --silent "$BASE_URL/booking/healthz" >/dev/null

echo "Application smoke tests passed for $BASE_URL"
