# Fix Cloudflare 502 for theamalgatedproperties.com

A **502 Bad gateway** from Cloudflare means: Cloudflare is working, but it **cannot reach your origin server** (this PC).

Your app **is running** locally (`http://192.168.0.222:8020/health` → OK). Apache on ports **80/443** proxies the domain on this machine.

## Cloudflare DNS (dashboard)

1. Log in to [Cloudflare](https://dash.cloudflare.com) → **theamalgatedproperties.com** → **DNS**.
2. Set the **A** record for `@` (and `www` if used) to your **public IP** (not `192.168.0.222`):
   - Check public IP: https://api.ipify.org (example from this network: `180.191.232.59`)
3. Keep the cloud **orange** (Proxied) if you want Cloudflare CDN/SSL.

## Router (required for public access)

Forward these ports to **192.168.0.222** (this PC):

| External | Internal        |
|----------|-----------------|
| 80       | 192.168.0.222:80  |
| 443      | 192.168.0.222:443 |

Without this, Cloudflare on the internet **cannot** reach a private LAN IP.

## Cloudflare SSL mode

In **SSL/TLS** → set mode to **Flexible** first:

- Visitor → Cloudflare: **HTTPS**
- Cloudflare → your Apache: **HTTP** on port **80**

(Your XAMPP HTTPS cert is self-signed; **Full (strict)** will fail until you install a real origin certificate.)

## Windows Firewall

Allow inbound **TCP 80** and **443** for Apache (`httpd.exe`).

## Easier option: Cloudflare Tunnel (no port forwarding)

If your ISP blocks port 80/443 or you cannot forward ports, use [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/):

```powershell
# Install cloudflared, then:
cloudflared tunnel login
cloudflared tunnel create amalgated
cloudflared tunnel route dns amalgated theamalgatedproperties.com
cloudflared tunnel run --url http://127.0.0.1:8020 amalgated
```

Keep `npm run pm2:start` running so the API serves the site on port **8020**.

## Local testing only (this PC)

The **hosts** file maps the domain to `192.168.0.222` and **bypasses** Cloudflare. Use:

- `http://theamalgatedproperties.com/` (works on this PC when Apache + PM2 are running)

To test the **real** Cloudflare path, temporarily remove the hosts line or test from a phone on mobile data.
