#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose"

# ── Helpers ───────────────────────────────────────────────────────────────────

usage() {
  cat <<EOF
Usage: ./scripts/run.sh [command] [options]

Commands:
  up        Build images and start all services (default)
  down      Stop and remove containers
  restart   Restart all services
  logs      Tail logs for all services (or pass a service name)
  build     Rebuild images without starting
  clean     Remove containers, volumes, and images

Options:
  --api-host URL    Override the backend API host for the frontend
                    e.g. --api-host http://localhost:3000
  -h, --help        Show this help message

Examples:
  ./scripts/run.sh
  ./scripts/run.sh up --api-host http://localhost:3000
  ./scripts/run.sh logs frontend
  ./scripts/run.sh down
EOF
}

check_docker() {
  if ! command -v docker &>/dev/null; then
    echo "Error: Docker is not installed or not in PATH." >&2
    exit 1
  fi
  if ! docker info &>/dev/null; then
    echo "Error: Docker daemon is not running." >&2
    exit 1
  fi
}

# ── Argument parsing ──────────────────────────────────────────────────────────

COMMAND="${1:-up}"
shift || true

API_HOST=""
EXTRA_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --api-host)
      API_HOST="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      EXTRA_ARGS+=("$1")
      shift
      ;;
  esac
done

# Build the env override string if --api-host was provided
ENV_OVERRIDE=()
if [[ -n "$API_HOST" ]]; then
  ENV_OVERRIDE=(--env "API_HOST=$API_HOST")
fi

# ── Main ──────────────────────────────────────────────────────────────────────

check_docker

cd "$(dirname "$0")/.."

case "$COMMAND" in
  up)
    echo "Starting Command Center..."
    $COMPOSE up --build \
      ${ENV_OVERRIDE[@]+"${ENV_OVERRIDE[@]}"} \
      ${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}
    ;;
  down)
    echo "Stopping Command Center..."
    $COMPOSE down ${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}
    ;;
  restart)
    echo "Restarting Command Center..."
    $COMPOSE down
    $COMPOSE up --build \
      ${ENV_OVERRIDE[@]+"${ENV_OVERRIDE[@]}"} \
      ${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}
    ;;
  logs)
    $COMPOSE logs -f ${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}
    ;;
  build)
    echo "Building images..."
    $COMPOSE build ${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}
    ;;
  clean)
    echo "Removing containers, volumes, and images..."
    $COMPOSE down --volumes --rmi local
    ;;
  *)
    echo "Unknown command: $COMMAND" >&2
    usage
    exit 1
    ;;
esac
