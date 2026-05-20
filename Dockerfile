FROM node:20-alpine AS base

# --- Dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Prisma Generate ---
FROM deps AS prisma
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# --- Build ---
FROM deps AS builder
COPY --from=prisma /app/src/generated ./src/generated
COPY . .
RUN npm run build

# --- Production ---
FROM base AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma: copy entire node_modules from prisma stage, then overlay with build context
COPY --from=prisma /app/node_modules ./node_modules
COPY --from=prisma /app/prisma.config.ts ./
COPY --from=prisma /app/src/generated ./src/generated

# Copy prisma schema and migrations from build context
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY prisma/migrations ./prisma/migrations

# Set permissions for prisma directory
RUN mkdir -p /app/prisma && chown -R nextjs:nodejs /app/prisma

# Entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"]
