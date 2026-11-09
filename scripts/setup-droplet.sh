#!/usr/bin/env bash
# Existing Ubuntu Droplet: installed tools, built app and private .env are required.
set -Eeuo pipefail
umask 077
SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET=/opt/finzproperty
UNIT=/etc/systemd/system/finzproperty.service
NGINX=/etc/nginx/sites-available/finzproperty-ip
LINK=/etc/nginx/sites-enabled/finzproperty-ip
MARKER='Managed by finzproperty setup-droplet.sh'
BACKUPS=/var/backups/finzproperty
STAMP="$(date +%Y%m%d%H%M%S)-$$"
PROXY_CHANGED=false
LINK_CREATED=false
HAD_PROXY=false
rollback_proxy() {
  if [[ $PROXY_CHANGED == true ]]; then
    if [[ $HAD_PROXY == true ]]; then cp -p "$BACKUPS/nginx.$STAMP" "$NGINX"; else rm -f "$NGINX"; fi
    if [[ $LINK_CREATED == true ]]; then rm -f "$LINK"; fi
    PROXY_CHANGED=false
  fi
}
fail() { rollback_proxy; printf '\nSTOP: %s\n' "$*" >&2; exit 1; }
trap 'rollback_proxy; printf "\nSetup stopped at line %s. Send the error above, not your .env or passwords.\n" "$LINENO" >&2' ERR
[[ $EUID -eq 0 ]] || fail 'Run with sudo.'
for command in node pnpm mysql nginx systemctl ss tar curl; do
  command -v "$command" >/dev/null || fail "Missing command: $command"
done
NODE="$(command -v node)"
[[ $NODE == /usr/bin/node || $NODE == /usr/local/bin/node ]] || fail 'Use the system Node.js installation.'
[[ -f "$SOURCE/.env" ]] || fail 'The project .env is missing.'
[[ $SOURCE != "$TARGET" && $SOURCE != "$TARGET/"* ]] || fail 'Run from the original Git clone, not the running /opt copy.'
[[ -f "$SOURCE/dist/index.js" && -f "$SOURCE/dist/public/index.html" && -d "$SOURCE/node_modules" ]] || fail 'Run pnpm install --frozen-lockfile and pnpm build first.'
if [[ -e $TARGET && ! -f $TARGET/.finzproperty-managed ]]; then fail 'The existing /opt/finzproperty is not owned by this helper; it was not overwritten.'; fi
if id finzproperty >/dev/null 2>&1; then
  [[ -f $TARGET/.finzproperty-managed ]] || fail 'An unrelated finzproperty account already exists.'
  IFS=: read -r _ _ uid _ _ home shell < <(getent passwd finzproperty)
  [[ $uid -ne 0 && $home == "$TARGET" && $shell == /usr/sbin/nologin && $(id -gn finzproperty) == finzproperty ]] || fail 'The existing service account is not a dedicated non-login account.'
fi
if [[ -f $UNIT ]] && ! grep -qF "$MARKER" "$UNIT"; then fail 'An unrelated finzproperty.service already exists.'; fi
if [[ -f $NGINX ]] && ! grep -qF 'proxy_pass http://127.0.0.1:3000;' "$NGINX"; then fail 'An unrelated finzproperty-ip Nginx configuration already exists.'; fi
if [[ -e $LINK || -L $LINK ]]; then
  [[ -L $LINK && $(readlink -f "$LINK") == "$NGINX" ]] || fail 'The site link is used by another configuration.'
fi
cd "$SOURCE"
printf '\n[1/5] Running existing database migrations...\n'
node --input-type=module <<'JS'
import 'dotenv/config';
import {spawnSync} from 'node:child_process';
if (!process.env.DATABASE_URL?.startsWith('mysql://')) {
  console.error('Save a working MySQL DATABASE_URL in the project .env.'); process.exit(1);
}
const r=spawnSync('pnpm',['db:migrate'],{stdio:'inherit',env:process.env});
process.exit(r.status ?? 1);
JS
printf '\n[2/5] Preparing the dedicated application service...\n'
if ! id finzproperty >/dev/null 2>&1; then
  useradd --system --user-group --home-dir "$TARGET" --shell /usr/sbin/nologin finzproperty
  install -d -m 750 -o root -g finzproperty "$TARGET"
  printf '%s\n' "$MARKER" > "$TARGET/.finzproperty-managed"
fi
if [[ -f $UNIT ]]; then systemctl stop finzproperty; fi
LISTENERS="$(ss -H -lntp 'sport = :3000' | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u || true)"
for pid in $LISTENERS; do
  cwd="$(readlink -f "/proc/$pid/cwd" || true)"
  executable="$(basename "$(readlink -f "/proc/$pid/exe" || true)")"
  entry="$(tr '\0' '\n' < "/proc/$pid/cmdline" | sed -n '2p')"
  [[ $cwd == "$SOURCE" && $executable == node && ( $entry == dist/index.js || $entry == "$SOURCE/dist/index.js" ) ]] || fail "Port 3000 belongs to an unrecognized process ($pid); it was not stopped."
  kill -TERM "$pid"
done
for attempt in {1..20}; do
  ALIVE=false
  for pid in $LISTENERS; do if kill -0 "$pid" 2>/dev/null; then ALIVE=true; fi; done
  [[ $ALIVE == false && -z $(ss -H -lnt 'sport = :3000') ]] && break
  sleep 1
done
[[ $ALIVE == false && -z $(ss -H -lnt 'sport = :3000') ]] || fail 'An old app process has not stopped; no unrelated processes were force-killed.'
install -d -m 700 "$BACKUPS"
RELEASE="$TARGET/releases/$STAMP"
install -d -m 750 -o root -g finzproperty "$TARGET/releases" "$RELEASE"
tar --exclude='./.git' --exclude='./.env' --exclude='./.env.*' -cf - . | tar -xf - -C "$RELEASE"
chown -R root:finzproperty "$RELEASE"
chmod -R g+rX "$RELEASE"
# Only systemd (root) reads this file; historic releases keep credentials private.
install -m 600 -o root -g root "$SOURCE/.env" "$RELEASE/.env"
if [[ -e $TARGET/current && ! -L $TARGET/current ]]; then fail 'The current-release path is not a symlink; it was not replaced.'; fi
ln -sfn "$RELEASE" "$TARGET/current"
printf '\n[3/5] Starting the persistent app...\n'
[[ ! -f $UNIT ]] || cp -p "$UNIT" "$BACKUPS/service.$STAMP"
cat > "$UNIT" <<EOF
# $MARKER
[Unit]
Description=FinzProperty application
After=network.target mysql.service
[Service]
Type=simple
User=finzproperty
Group=finzproperty
WorkingDirectory=$RELEASE
EnvironmentFile=$RELEASE/.env
ExecStart=/usr/bin/env NODE_ENV=production PORT=3000 $NODE dist/index.js
Restart=on-failure
RestartSec=3
TimeoutStopSec=20
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=full
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now finzproperty
READY=false
for attempt in {1..20}; do
  if curl -fsS --max-time 2 http://127.0.0.1:3000/api/health >/dev/null 2>&1; then READY=true; break; fi
  sleep 1
done
if [[ $READY != true ]]; then journalctl -u finzproperty -n 25 --no-pager; fail 'The app did not start; review the service error.'; fi
if ! curl -fsS --max-time 15 http://127.0.0.1:3000/ >/dev/null; then
  journalctl -u finzproperty -n 25 --no-pager
  fail 'The homepage still fails; Nginx was not changed.'
fi
printf '\n[4/5] Connecting the public IP/domain through Nginx...\n'
if [[ -f $NGINX ]]; then HAD_PROXY=true; cp -p "$NGINX" "$BACKUPS/nginx.$STAMP"; fi
PROXY_CHANGED=true
cat > "$NGINX" <<'EOF'
# Managed by finzproperty setup-droplet.sh
server {
    listen 80;
    server_name 178.128.29.191 finzproperty.com www.finzproperty.com;
    client_max_body_size 50m;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
if [[ ! -L $LINK ]]; then ln -s "$NGINX" "$LINK"; LINK_CREATED=true; fi
if ! CHECK="$(nginx -t 2>&1)"; then printf '%s\n' "$CHECK"; fail 'Nginx validation failed; its prior site configuration was restored.'; fi
printf '%s\n' "$CHECK"
if grep -qi 'conflicting server name' <<< "$CHECK"; then fail 'Another Nginx site owns a matching hostname; the prior configuration was restored.'; fi
systemctl enable --now nginx
systemctl reload nginx
PROXY_CHANGED=false
printf '\n[5/5] Checking the port-80 health and homepage...\n'
curl -fsS --max-time 10 -H 'Host: 178.128.29.191' http://127.0.0.1/api/health
printf '\n'
curl -fsS --max-time 15 -H 'Host: 178.128.29.191' http://127.0.0.1/ >/dev/null
printf '\nSUCCESS: app and port-80 proxy respond correctly locally.\nOpen http://178.128.29.191/ in your browser.\nThe app continues after the console closes.\nA fresh database has no listings; login, managed media/maps and HTTPS need separate setup.\n'
