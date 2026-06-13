#!/usr/bin/env bash

# SRE Incident Simulator Script
# Use this script to trigger simulated outages or resource exhaustion events in the microservices.

set -eo pipefail

show_help() {
  echo "Usage: $0 -s <service-url> -t <incident-type> [options]"
  echo ""
  echo "Services URLs (examples):"
  echo "  http://localhost:3000   (or booking-service.dev.svc.cluster.local)"
  echo ""
  echo "Incident Types:"
  echo "  latency    - Simulates slow responses"
  echo "  error      - Toggles internal HTTP 500 error mode"
  echo "  leak       - Exceeds memory footprint by allocating raw memory buffers"
  echo "  reset-leak - Clears leaked memory allocations"
  echo ""
  echo "Options:"
  echo "  -d <ms>    - Delay duration in milliseconds (for latency incident, default: 3000)"
  echo "  -m <mb>    - Size of memory leak in MB (for leak incident, default: 50)"
  echo "  -e <val>   - Enable/disable error mode ('true' or 'false', default: true)"
  exit 1
}

URL=""
TYPE=""
DELAY=3000
MB=50
ERROR_VAL="true"

while getopts "hs:t:d:m:e:" opt; do
  case "$opt" in
    h) show_help ;;
    s) URL="$OPTARG" ;;
    t) TYPE="$OPTARG" ;;
    d) DELAY="$OPTARG" ;;
    m) MB="$OPTARG" ;;
    e) ERROR_VAL="$OPTARG" ;;
    *) show_help ;;
  esac
done

if [ -z "$URL" ] || [ -z "$TYPE" ]; then
  show_help
fi

# Ensure URL doesn't have trailing slash for consistency
URL="${URL%/}"

case "$TYPE" in
  latency)
    echo "=== Simulating Latency of ${DELAY}ms on $URL ==="
    curl -s -w "\nHTTP Status: %{http_code}\nTime Taken: %{time_total}s\n" "$URL/simulate/latency?ms=$DELAY"
    ;;
  error)
    echo "=== Toggles HTTP 500 Error State to '$ERROR_VAL' on $URL ==="
    # Map 'true' or 'false'
    ENABLE_BOOL=true
    if [ "$ERROR_VAL" = "false" ]; then
      ENABLE_BOOL=false
    fi
    curl -s -X POST -H "Content-Type: application/json" \
      -d "{\"enable\": $ENABLE_BOOL}" \
      -w "\nHTTP Status: %{http_code}\n" \
      "$URL/simulate/error"
    ;;
  leak)
    echo "=== Simulating Memory Leak of ${MB}MB on $URL ==="
    curl -s -X POST -H "Content-Type: application/json" \
      -d "{\"mb\": $MB}" \
      -w "\nHTTP Status: %{http_code}\n" \
      "$URL/simulate/leak"
    ;;
  reset-leak)
    echo "=== Resetting Leaked Memory Allocations on $URL ==="
    curl -s -X POST \
      -w "\nHTTP Status: %{http_code}\n" \
      "$URL/simulate/reset-leak"
    ;;
  *)
    echo "Error: Unknown incident type '$TYPE'"
    show_help
    ;;
esac
