# Life OS V0 — Production Dockerfile
# Multi-stage build for size + security
#
# 用法:
#   docker build -t life-os:latest .
#   docker run -d --name lifeos -p 3000:3000 \
#     -e DEEPSEEK_API_KEY=... \
#     -v $(pwd)/data:/app/data \
#     life-os:latest

# ===== Stage 1: deps =====
FROM node:20-alpine AS deps
WORKDIR /app

# better-sqlite3 needs build tools
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-fund --no-audit

# ===== Stage 2: builder =====
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci --no-fund --no-audit

COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ===== Stage 3: runner =====
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run as non-root for security
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Data dir for SQLite (mount as volume in prod)
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data
VOLUME /app/data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "start"]
