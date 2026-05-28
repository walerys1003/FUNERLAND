# PolskiePogrzeby.pl — Next.js production Dockerfile
# Multi-stage: deps → builder → runner (slim, alpine, non-root)

# ============ Stage 1: deps ============
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# ============ Stage 2: builder ============
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ============ Stage 3: runner ============
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output (next.config.mjs: output: 'standalone')
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/content ./src/content
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/tasks-plan.json ./src/lib/tasks-plan.json
COPY --from=builder --chown=nextjs:nodejs /app/orchestrator/agents.config.json ./orchestrator/agents.config.json

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
