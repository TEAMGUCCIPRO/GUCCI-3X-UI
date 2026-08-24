#!/bin/sh
set -u

XUI_PID="$1"
PANEL_PORT="$2"
MARKER=/tmp/gucci-health-ok
CHECK_INTERVAL="${GUCCI_HEALTH_INTERVAL:-5}"
FAILURE_LIMIT="${GUCCI_HEALTH_FAILURE_LIMIT:-4}"
TCP_PORTS="${GUCCI_HEALTH_TCP_PORTS:-}"
failures=0

case "$CHECK_INTERVAL:$FAILURE_LIMIT:$PANEL_PORT" in
  *[!0-9:]*|*::*|:*|*:) echo 'Invalid GUCCI health-check configuration' >&2; exit 1 ;;
esac

rm -f "$MARKER"

port_ready() {
  nc -z -w 2 127.0.0.1 "$1" >/dev/null 2>&1
}

while kill -0 "$XUI_PID" 2>/dev/null; do
  healthy=true
  port_ready "$PANEL_PORT" || healthy=false

  for port in $(printf '%s' "$TCP_PORTS" | tr ',' ' '); do
    case "$port" in
      ''|*[!0-9]*) healthy=false ;;
      *) port_ready "$port" || healthy=false ;;
    esac
  done

  if [ "$healthy" = true ]; then
    printf 'ok\n' >"${MARKER}.new"
    mv -f "${MARKER}.new" "$MARKER"
    failures=0
  else
    rm -f "$MARKER" "${MARKER}.new"
    failures=$((failures + 1))
    if [ "$failures" -eq 1 ]; then
      echo "GUCCI health check waiting for panel/TCP endpoints: ${PANEL_PORT}${TCP_PORTS:+,${TCP_PORTS}}" >&2
    fi
    if [ "$failures" -ge "$FAILURE_LIMIT" ]; then
      echo 'GUCCI health check failed repeatedly; stopping x-ui so Railway can recover the service.' >&2
      kill "$XUI_PID" 2>/dev/null || true
      rm -f "$MARKER" "${MARKER}.new"
      exit 1
    fi
  fi

  sleep "$CHECK_INTERVAL"
done

rm -f "$MARKER" "${MARKER}.new"
exit 1
