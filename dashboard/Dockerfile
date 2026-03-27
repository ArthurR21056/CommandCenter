# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build with base path / so nginx can serve from root
RUN npx vite build --base=/

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Template is processed at container start — ${API_HOST} is substituted
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
