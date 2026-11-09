# Run FinzProperty on the existing DigitalOcean Droplet

This helper is for the Ubuntu Droplet at `178.128.29.191`. Node.js 22, pnpm, MySQL and Nginx must already be installed. Run `pnpm install --frozen-lockfile` and `pnpm build` first. The private project `.env` must contain a working MySQL `DATABASE_URL`; do not commit or share that file.

From the cloned repository in the Droplet console:

```bash
cd /root/finzproperty
git pull --ff-only origin main
sudo bash scripts/setup-droplet.sh
```

The helper runs the existing database migrations, copies the built app and dependencies into a private release under `/opt/finzproperty`, runs it as a dedicated non-login account through systemd, and forwards the normal public IP and domain on port 80 through Nginx. It stops only a recognized old process for this app on port 3000. Unrecognized occupied ports or conflicting configuration stop the setup rather than deleting or overwriting unrelated work. Existing app-owned configuration is backed up privately under `/var/backups/finzproperty`. Invalid or conflicting Nginx site changes are rolled back. It does not delete databases, users, listings or the default Nginx site.

Success means the app health and homepage respond through the local port-80 proxy. Open `http://178.128.29.191/` to check public access. If public access still fails after local success, inspect the Droplet's host/cloud firewall; do not disable the firewall or close SSH access indiscriminately.

Check a failure with:

```bash
sudo systemctl status finzproperty --no-pager
sudo journalctl -u finzproperty -n 30 --no-pager
sudo nginx -t
```

The app continues after the console closes. For later source updates, pull and build in `/root/finzproperty`, then rerun the helper; the running release is linked at `/opt/finzproperty/current`.

## Restore the original demonstration listings and images

Hero, property, gallery, district and sample adviser images are now bundled in `client/public/media` and copied into the production build. They no longer require Manus storage URLs or external image CDNs at runtime.

To update the app and add the original eight sample properties, three sample advisers and three sample developments only when the inventory is entirely empty:

```bash
cd /root/finzproperty &&
git pull --ff-only origin main &&
pnpm install --frozen-lockfile &&
pnpm build &&
sudo bash scripts/setup-droplet.sh --demo
```

The `--demo` option is explicit. These records are clearly labeled demonstration data, not verified or live property offers. Sample adviser phone numbers are blank, and verification is disabled. The seed skips nonempty inventory and does not overwrite real records. Its transaction and seed-version check prevent duplicate successful imports. Without `--demo`, the helper does not add listing data.

After `SUCCESS`, refresh `http://178.128.29.191/` with Ctrl+Shift+R. Do not run `pnpm start` separately; systemd already manages the app.

## Remaining setup

A fresh MySQL database has no live listing records. This helper does not migrate the Manus database or create real offers. Manus-hosted login, maps and future user-upload storage still require independent hosting configuration or migration; bundled images are now independent. Do not copy private platform credentials into a public repository. HTTPS is not configured by this helper. Configure HTTPS and the remaining integrations before accepting sensitive user data or treating the site as production-ready.
