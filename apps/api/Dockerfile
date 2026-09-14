FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/domain/package.json ./packages/domain/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm --filter @sthanori/shared build && \
    pnpm --filter @sthanori/domain build && \
    pnpm --filter @sthanori/db build && \
    pnpm --filter @sthanori/api build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup -S sthanori && adduser -S sthanori -G sthanori

COPY --chown=sthanori:sthanori --from=builder /app ./

USER sthanori

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/healthz || exit 1

CMD ["pnpm", "--filter", "@sthanori/api", "start"]
