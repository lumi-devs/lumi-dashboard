# Lumi Dashboard

Web management panel for **[Lumi](https://github.com/lumi-devs/Lumi)**. Configure features, manage moderation, and view server activity from a clean web interface without giving the dashboard access to the bot token or database directly.

---

## Highlights

- **Isolated & Safe**: Talks exclusively to Lumi's internal API service via a typed RPC bridge. Never connects directly to PostgreSQL, Valkey, or Discord.
- **Discord Sign-in**: Fast, secure login using standard Discord OAuth2.
- **Dynamic Configuration**: Automatically builds settings panels from module schemas so features are always up to date.
- **Modern Stack**: Built with Next.js (App Router), React, Tailwind CSS, and Radix UI.

---

## Quickstart

### Prerequisites

- [Bun](https://bun.sh) (v1.2+) or Node.js 22+
- A running Lumi `apps/api` instance (default: `http://localhost:8091`)
- Discord OAuth2 application credentials

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/lumi-devs/lumi-dashboard.git
   cd lumi-dashboard
   bun install
   ```

2. **Configure environment:**
   Create a `.env` file in the root directory:
   ```env
   # RPC bridge to Lumi API service
   RPC_HTTP_URL=http://localhost:8091
   RPC_INTERNAL_TOKEN=your-32-char-random-secret

   # Discord OAuth2 Credentials
   DISCORD_OAUTH2_CLIENT_ID=your-discord-app-id
   DISCORD_OAUTH2_CLIENT_SECRET=your-discord-app-secret

   # Session secret (generate with: openssl rand -hex 32)
   DASHBOARD_SESSION_SECRET=your-long-random-session-secret

   # NextAuth / Auth.js Callback URL Configuration
   # Required in production or containerized environments to prevent invalid_grant redirect mismatches:
   AUTH_TRUST_HOST=true
   AUTH_URL=http://localhost:3000
   DASHBOARD_PUBLIC_URL=http://localhost:3000

   # Server config
   DASHBOARD_PORT=3000
   ```

3. **Discord Developer Portal configuration:**
   Under your application in the **Discord Developer Portal** (https://discord.com/developers/applications):
   - Navigate to **OAuth2 → General**.
   - Copy the **Client ID** into `DISCORD_OAUTH2_CLIENT_ID`.
   - Under **Client Secret**, click **Reset Secret** and copy it into `DISCORD_OAUTH2_CLIENT_SECRET`.
   - Under **Redirects**, add the following callback URLs:
     - Dashboard authentication:
       ```
       http://<host-or-domain>:3000/api/auth/callback/discord
       ```
     - Bot invite redirection (optional):
       ```
       http://<host-or-domain>:3000/oauth/guild
       ```

4. **Run the development server:**
   ```bash
   bun run dev
   ```
   Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## Docker Deployment

Pre-built Docker images are published to GitHub Container Registry:

```bash
docker run -d \
  --name lumi-dashboard \
  -p 8080:8080 \
  -e RPC_HTTP_URL="http://api:8091" \
  -e RPC_INTERNAL_TOKEN="your-secret" \
  -e DASHBOARD_SESSION_SECRET="your-session-secret" \
  -e DISCORD_OAUTH2_CLIENT_ID="your-client-id" \
  -e DISCORD_OAUTH2_CLIENT_SECRET="your-client-secret" \
  ghcr.io/lumi-devs/lumi-dashboard:latest
```

---

## Development & Testing

```bash
# Run type checks
bun run typecheck

# Run linter
bun run lint

# Run unit and component test suite
bun run test

# Production build
bun run build
```

---

## License

GNU Affero General Public License v3.0 (AGPL-3.0). See [LICENSE](LICENSE) for details.
