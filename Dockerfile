FROM node:20-alpine AS base
RUN npm install -g pnpm@10.33.0

# --- All dependencies (dev + prod, needed for build) ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --shamefully-hoist && pnpm approve-builds --all

# --- Production-only dependencies ---
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --shamefully-hoist --prod && pnpm approve-builds --all

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NODE_ENV=production is required: `medusa build` defaults NODE_ENV to
# "development" otherwise, baking React dev mode + the "Error Details
# (Development Mode)" panel into the admin bundle.
RUN NODE_ENV=production NODE_OPTIONS="--max-old-space-size=1536" pnpm build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.medusa/server .
COPY --from=builder /app/static ./static
COPY --from=builder /app/tsconfig.json ./tsconfig.json
# `medusa build` compiles the TS scripts but drops loose .json data files that
# exec scripts read at runtime (import-products-from-json, import-pacovis-batch,
# apply-product-updates). Copy them next to the compiled scripts so __dirname
# resolves them in the container.
COPY --from=builder /app/src/scripts/imports ./src/scripts/imports
COPY --from=builder /app/src/scripts/updates ./src/scripts/updates
COPY --from=prod-deps /app/node_modules ./node_modules

EXPOSE 9000

CMD ["sh", "-c", "REDIS_URL= pnpm medusa db:migrate && pnpm start"]
