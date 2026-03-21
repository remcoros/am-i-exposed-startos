#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
DATA_DIR=/data
START9_DIR="$DATA_DIR/start9"
CONFIG_FILE="$START9_DIR/config.yaml"

mkdir -p "$START9_DIR"

# ---------------------------------------------------------------------------
# Read config written by StartOS
# ---------------------------------------------------------------------------
MEMPOOL_SOURCE="public"
if [ -f "$CONFIG_FILE" ]; then
  MEMPOOL_SOURCE=$(yq e '.mempool-source // "public"' "$CONFIG_FILE")
fi

# Resolve mempool endpoint
if [ "$MEMPOOL_SOURCE" = "local" ]; then
  APP_MEMPOOL_IP="mempool.embassy"
  APP_MEMPOOL_PORT="8080"
else
  APP_MEMPOOL_IP="mempool.space"
  APP_MEMPOOL_PORT="80"
fi

# APP_TOR_PROXY_*: nginx uses these to reach the tor-proxy sidecar (same container → 127.0.0.1)
APP_TOR_PROXY_IP="127.0.0.1"
APP_TOR_PROXY_PORT="3001"
APP_MEMPOOL_HIDDEN_SERVICE=""

export APP_MEMPOOL_IP APP_MEMPOOL_PORT APP_TOR_PROXY_IP APP_TOR_PROXY_PORT APP_MEMPOOL_HIDDEN_SERVICE

# ---------------------------------------------------------------------------
# Write stats.yaml for Properties panel
# ---------------------------------------------------------------------------
cat > "$START9_DIR/stats.yaml" << EOF
version: 2
data:
  "Mempool Source":
    type: string
    value: "$MEMPOOL_SOURCE"
    description: "Where blockchain data is fetched from"
    copyable: false
    qr: false
    masked: false
  "Tor Proxy":
    type: string
    value: "embassy:9050 (SOCKS5)"
    description: "StartOS built-in Tor SOCKS proxy used for Chainalysis lookups"
    copyable: false
    qr: false
    masked: false
EOF

# ---------------------------------------------------------------------------
# Apply nginx config template (envsubst)
# ---------------------------------------------------------------------------
TEMPLATE=/etc/nginx/templates/default.conf.template
NGINX_CONF=/etc/nginx/http.d/default.conf
mkdir -p /etc/nginx/http.d
envsubst '$APP_MEMPOOL_IP $APP_MEMPOOL_PORT $APP_TOR_PROXY_IP $APP_TOR_PROXY_PORT $APP_MEMPOOL_HIDDEN_SERVICE' \
  < "$TEMPLATE" > "$NGINX_CONF"

# ---------------------------------------------------------------------------
# Start tor proxy sidecar in background
# Routes /tor-proxy/* requests through the StartOS built-in Tor SOCKS proxy
# ---------------------------------------------------------------------------
cd /opt/tor-proxy
PORT="$APP_TOR_PROXY_PORT" \
TOR_PROXY_IP="embassy" \
TOR_PROXY_PORT="9050" \
  node server.js &

# ---------------------------------------------------------------------------
# Start nginx in foreground
# ---------------------------------------------------------------------------
exec nginx -g 'daemon off;'
