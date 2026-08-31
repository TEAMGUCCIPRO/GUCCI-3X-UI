#!/bin/sh
set -eu

# Serve the user-created domain on port 1 and Railway's internal health/router
# port simultaneously. Railway may inject PORT=8080 even when the domain target
# is 1; listening on both makes a fresh Fork work with zero Variables.
PUBLIC_PORT="${GUCCI_PUBLIC_PORT:-1}"
HEALTH_PORT="${PORT:-8080}"
PANEL_PORT="${XUI_INTERNAL_PORT:-2053}"
PANEL_PATH="${XUI_WEB_BASE_PATH:-/}"
INITIAL_USER="${XUI_INITIAL_USERNAME:-gucci}"
INITIAL_PASS="${XUI_INITIAL_PASSWORD:-gucci}"
DATA_ROOT="${XUI_DATA_ROOT:-/gucci}"
DB_FOLDER="${XUI_DB_FOLDER:-$DATA_ROOT/x-ui}"

# Railway's actual mounted-volume path is authoritative. This prevents a stale
# service Variable from ever redirecting the database to ephemeral storage when
# the volume mount is renamed or reattached.
if [ -n "${RAILWAY_VOLUME_MOUNT_PATH:-}" ]; then
  DATA_ROOT="$RAILWAY_VOLUME_MOUNT_PATH"
  DB_FOLDER="$DATA_ROOT/x-ui"
fi

# Zero-loss transition for an existing Railway volume that is mounted at /GUCCI or /data
if [ ! -f "$DB_FOLDER/x-ui.db" ]; then
  if [ -f /GUCCI/x-ui/x-ui.db ]; then
    DATA_ROOT=/GUCCI
    DB_FOLDER=/GUCCI/x-ui
    echo 'Persistent volume is using legacy mount /GUCCI; retaining it without migration.'
  elif [ -f /data/x-ui/x-ui.db ]; then
    DATA_ROOT=/data
    DB_FOLDER=/data/x-ui
    echo 'Persistent volume is using legacy mount /data; retaining it without migration.'
  fi
fi
export XUI_DATA_ROOT="$DATA_ROOT"
export XUI_DB_FOLDER="$DB_FOLDER"

case "$PUBLIC_PORT:$PANEL_PORT" in *[!0-9:]*|:*) echo 'Invalid port configuration' >&2; exit 1;; esac
case "$PANEL_PATH" in /*) ;; *) PANEL_PATH="/$PANEL_PATH" ;; esac
case "$PANEL_PATH" in */) ;; *) PANEL_PATH="$PANEL_PATH/" ;; esac

persist_dir() {
  source="$1"; target="$2"
  mkdir -p "$target"
  if [ ! -L "$source" ]; then
    if [ -d "$source" ] && [ -z "$(find "$target" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]; then
      cp -a "$source"/. "$target"/ 2>/dev/null || true
    fi
    rm -rf "$source"
    ln -s "$target" "$source"
  fi
}

mkdir -p "$DATA_ROOT" "$DB_FOLDER" /tmp/nginx-proxy /tmp/nginx-client /run/nginx
echo "Persistent data root: ${DATA_ROOT}"
# 3X-UI writes SQLite directly into the Railway-mounted directory. We do not
# symlink /etc/x-ui because the upstream image declares it as a Docker VOLUME,
# which can become an ephemeral mount and discard panel changes on redeploy.
if [ -f "$DATA_ROOT/x-ui.db" ] && [ ! -f "$DB_FOLDER/x-ui.db" ]; then
  mv "$DATA_ROOT/x-ui.db" "$DB_FOLDER/x-ui.db"
fi
persist_dir /root/cert "$DATA_ROOT/cert"
persist_dir /root/.acme.sh "$DATA_ROOT/acme"
persist_dir /var/log/x-ui "$DATA_ROOT/log"

DB="$DB_FOLDER/x-ui.db"

# Before the first requested v3.4.2 start, take an online-safe SQLite snapshot
# inside the real /GUCCI volume. It is created once, verified, and never
# overwritten, so the version transition cannot destroy the pre-transition DB.
if [ "${GUCCI_PANEL_VERSION:-}" = "3.4.2" ] && [ -f "$DB" ]; then
  BACKUP_DIR="$DATA_ROOT/backups"
  BACKUP_DB="$BACKUP_DIR/pre-v3.4.2-transition.db"
  if [ ! -f "$BACKUP_DB" ]; then
    mkdir -p "$BACKUP_DIR"
    rm -f "${BACKUP_DB}.new"
    sqlite3 "$DB" ".backup '${BACKUP_DB}.new'"
    if [ "$(sqlite3 "${BACKUP_DB}.new" 'PRAGMA integrity_check;')" != "ok" ]; then
      rm -f "${BACKUP_DB}.new"
      echo 'Persistent database snapshot failed integrity verification' >&2
      exit 1
    fi
    mv "${BACKUP_DB}.new" "$BACKUP_DB"
    chmod 0600 "$BACKUP_DB"
    sha256sum "$BACKUP_DB" >"${BACKUP_DB}.sha256"
    echo "Created verified pre-transition database snapshot: ${BACKUP_DB}"
  fi
fi

FIRST_BOOT=false
[ -f "$DB" ] || FIRST_BOOT=true

# Initialize the native database through the official binary. Credentials are
# only seeded once; later password/settings changes remain on the Railway volume.
if [ "$FIRST_BOOT" = true ] || [ "${XUI_FORCE_INITIAL_CREDENTIALS:-false}" = true ]; then
  /app/x-ui setting -port "$PANEL_PORT" -username "$INITIAL_USER" -password "$INITIAL_PASS" -webBasePath "$PANEL_PATH" -listenIP 127.0.0.1 -resetTwoFactor
else
  # The reverse-proxy contract is stable even when the image is upgraded.
  /app/x-ui setting -port "$PANEL_PORT" -webBasePath "$PANEL_PATH" -listenIP 127.0.0.1
fi

# Xray 26.7.x changed an empty REALITY minClientVer from "no floor" (the
# v3.4.2/26.6.27 behaviour) to an implicit 26.3.27 floor. Preserve the older,
# broadly-compatible semantic explicitly without overwriting an administrator's
# deliberate non-empty value. This also protects imported legacy inbounds if a
# future core update is attempted.
if [ -f "$DB" ]; then
  REALITY_NORMALIZED=$(sqlite3 "$DB" "
    UPDATE inbounds
       SET stream_settings = json_set(stream_settings, '$.realitySettings.minClientVer', '1.0.0')
     WHERE json_valid(stream_settings)
       AND json_extract(stream_settings, '$.security') = 'reality'
       AND (
         json_type(stream_settings, '$.realitySettings.minClientVer') IS NULL
         OR trim(CAST(json_extract(stream_settings, '$.realitySettings.minClientVer') AS TEXT)) = ''
       );
    SELECT changes();")
  if [ "${REALITY_NORMALIZED:-0}" -gt 0 ]; then
    echo "Normalized ${REALITY_NORMALIZED} legacy REALITY inbound(s) to minClientVer 1.0.0"
  fi
fi

# Native subscription endpoints stay untouched; only their public reverse-proxy
# URI is set so links generated inside 3X-UI use the Railway HTTPS domain.
# Factory defaults may not have a physical row yet, so this is a real upsert.
db_setting() {
  key=$(printf '%s' "$1" | sed "s/'/''/g")
  value=$(printf '%s' "$2" | sed "s/'/''/g")
  sqlite3 "$DB" "INSERT INTO settings(key,value) SELECT '${key}','${value}' WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key='${key}');"
}
db_setting_force() {
  key=$(printf '%s' "$1" | sed "s/'/''/g")
  value=$(printf '%s' "$2" | sed "s/'/''/g")
  sqlite3 "$DB" "INSERT INTO settings(key,value) SELECT '${key}','${value}' WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key='${key}'); UPDATE settings SET value='${value}' WHERE key='${key}';"
}
if [ -f "$DB" ]; then
  sqlite3 "$DB" "UPDATE settings SET value='/' WHERE key='webBasePath';"
  sqlite3 "$DB" "DELETE FROM settings WHERE key IN ('subURI', 'subJsonURI', 'subClashURI') AND value LIKE '%:2096%';"
  db_setting subListen 127.0.0.1
  db_setting subPort 2096
  db_setting_force subTitle "{{STATUS_EMOJI}} 👤 {{EMAIL}} | 📊 {{TRAFFIC_LEFT}} | 🕔 {{TIME_LEFT}}"
  db_setting_force remarkTemplate "{{STATUS_EMOJI}} 👤 {{EMAIL}}"
  db_setting_force subAnnounce "👑⚡ 🅣 🅔 🅐 🅜 🅖 🅤 🅒 🅒 🅘 ⚡👑"
  db_setting_force subEncrypt false
  if [ -n "${RAILWAY_PUBLIC_DOMAIN:-}" ]; then
    db_setting_force subURI "https://${RAILWAY_PUBLIC_DOMAIN}/sub/"
    db_setting_force subJsonURI "https://${RAILWAY_PUBLIC_DOMAIN}/json/"
    db_setting_force subClashURI "https://${RAILWAY_PUBLIC_DOMAIN}/clash/"
    db_setting subSupportUrl "https://t.me/MR_GUCCI_YT"
  fi
fi

if [ "$HEALTH_PORT" = "$PUBLIC_PORT" ]; then
  EXTRA_LISTEN=""
else
  EXTRA_LISTEN="listen ${HEALTH_PORT}; listen [::]:${HEALTH_PORT};"
fi
sed "s|__EXTRA_LISTEN__|${EXTRA_LISTEN}|g" /app/gucci/nginx.conf.template >/tmp/nginx.conf
echo "GUCCI gateway listening on public port ${PUBLIC_PORT} and Railway port ${HEALTH_PORT}"
nginx -t -c /tmp/nginx.conf
nginx -c /tmp/nginx.conf -g 'daemon off;' &
NGINX_PID=$!
XUI_PID=""
HEALTH_PID=""
cleanup() {
  [ -z "$HEALTH_PID" ] || kill "$HEALTH_PID" 2>/dev/null || true
  [ -z "$XUI_PID" ] || kill "$XUI_PID" 2>/dev/null || true
  kill "$NGINX_PID" 2>/dev/null || true
  rm -f /tmp/gucci-health-ok /tmp/gucci-health-ok.new
}
trap cleanup INT TERM EXIT

export XUI_PORT="$PANEL_PORT"
export XUI_INIT_WEB_BASE_PATH="$PANEL_PATH"
export XUI_ENABLE_FAIL2BAN="${XUI_ENABLE_FAIL2BAN:-true}"
# Alpine's bundled compatibility jails validate standard SSH log paths even
# though SSH is disabled in this container. Empty files keep Fail2ban startup
# clean while the 3X-UI IP-limit jail uses /var/log/x-ui.
mkdir -p /var/log
: > /var/log/auth.log
: > /var/log/secure
: > /var/log/messages

# Run the untouched upstream panel and continuously verify the panel plus any
# configured TCP Proxy target ports. Repeated failures stop x-ui so Railway's
# restart policy can replace the unhealthy endpoint automatically.
/app/DockerEntrypoint.sh &
XUI_PID=$!
/app/gucci/healthcheck.sh "$XUI_PID" "$PANEL_PORT" &
HEALTH_PID=$!
set +e
wait "$XUI_PID"
STATUS=$?
set -e
cleanup
trap - INT TERM EXIT
wait "$HEALTH_PID" 2>/dev/null || true
wait "$NGINX_PID" 2>/dev/null || true
exit "$STATUS"
