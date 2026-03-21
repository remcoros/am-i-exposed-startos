FROM ghcr.io/copexit/am-i-exposed-umbrel:v0.35.1 AS main
FROM ghcr.io/copexit/am-i-exposed-tor-proxy:v0.35.1 AS tor-proxy

FROM alpine:3.19

# nginx: serves the static UI
# nodejs: runs the tor-proxy sidecar (server.js)
# yq: reads config.yaml in docker_entrypoint.sh
# envsubst is copied from the upstream umbrel image (already ships it)
RUN apk add --no-cache \
    nginx \
    nodejs \
    yq \
    gettext

# Static UI + nginx template from upstream umbrel image
COPY --from=main /usr/share/nginx/html /usr/share/nginx/html
COPY --from=main /etc/nginx/templates/default.conf.template /etc/nginx/templates/default.conf.template

# Tor proxy Node.js server (node_modules already baked in)
RUN mkdir -p /opt/tor-proxy
COPY --from=tor-proxy /app /opt/tor-proxy

# Nginx runtime directories
RUN mkdir -p /var/lib/nginx/tmp /var/log/nginx /run/nginx /data/start9 && \
    chown -R nobody:nobody /var/lib/nginx /var/log/nginx /run/nginx

# Entrypoint
COPY docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod +x /usr/local/bin/docker_entrypoint.sh

EXPOSE 8080 3001

CMD ["/usr/local/bin/docker_entrypoint.sh"]
