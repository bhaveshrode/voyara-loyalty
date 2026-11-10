# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Seed a throwaway in-process chain so next build can import the generated
# deployment addresses and ABIs. Addresses are deterministic, so they match
# the fresh chain started by the runtime entrypoint.
RUN ./node_modules/.bin/hardhat run scripts/deploy.js
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app ./
USER node
EXPOSE 3000
CMD ["bash", "scripts/start-railway.sh"]
