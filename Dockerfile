FROM node:20-alpine AS base
RUN npm install -g pnpm@10.33.0

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --shamefully-hoist && pnpm approve-builds --all

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN NODE_OPTIONS="--max-old-space-size=1536" pnpm build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.medusa/server .
COPY --from=builder /app/static ./static
COPY --from=builder /app/src/scripts ./src/scripts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=deps /app/node_modules ./node_modules

ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "development" ]; then \
      echo "Development mode — using full node_modules from deps"; \
    else \
      pnpm prune --prod && pnpm store prune; \
    fi

EXPOSE 9000

CMD ["sh", "-c", "REDIS_URL= pnpm medusa db:migrate && pnpm start"]
