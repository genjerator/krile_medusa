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
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.medusa/server .
COPY --from=builder /app/static ./static

RUN NODE_OPTIONS="--max-old-space-size=1536" pnpm install --prod --shamefully-hoist && pnpm approve-builds --all

EXPOSE 9000

CMD ["sh", "-c", "pnpm medusa db:migrate && pnpm start"]
