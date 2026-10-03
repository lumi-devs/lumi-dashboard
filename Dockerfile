FROM docker.io/oven/bun:1-alpine AS base
WORKDIR /app
RUN apk upgrade --no-cache && apk add --no-cache dumb-init

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS source
COPY tsconfig.json next.config.ts postcss.config.mjs components.json ./
COPY public/ public/
COPY content/ content/
COPY src/ src/

FROM source AS build
ENV NODE_ENV=production \
    SKIP_ENV_VALIDATION=1 \
    RPC_HTTP_URL=http://127.0.0.1:8091 \
    DISCORD_OAUTH2_CLIENT_ID=build-placeholder \
    DISCORD_OAUTH2_CLIENT_SECRET=build-placeholder \
    DASHBOARD_SESSION_SECRET=build-placeholder-session-secret-must-be-32chars
RUN bun run build

FROM base AS dashboard
RUN apk add --no-cache nodejs
ENV NODE_ENV=production
COPY --from=build --chown=bun:bun /app/.next/standalone ./
COPY --from=build --chown=bun:bun /app/.next/static ./.next/static
COPY --from=build --chown=bun:bun /app/public ./public
USER bun
EXPOSE 8080
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "PORT=${DASHBOARD_PORT:-8080} HOSTNAME=${DASHBOARD_HOST:-0.0.0.0} exec node server.js"]
