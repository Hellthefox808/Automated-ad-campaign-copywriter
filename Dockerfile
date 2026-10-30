# Multi-Stage Dockerfile for AdCopyCraft AI Enterprise Platform

# --- Stage 1: Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root manifest and workspace package definitions
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies across all workspaces
RUN npm ci

# Copy full source tree
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend production bundle into frontend/dist
RUN npm run build

# Run automated tests during image build to enforce zero-defect quality gate
RUN npm test

# Prune dev dependencies for lean production footprint
RUN npm prune --production

# --- Stage 2: Minimal Production Runtime ---
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create data directory for SQLite WAL persistence and set permissions
RUN mkdir -p /app/data && chown -R node:node /app

# Copy production dependencies and built artifacts from builder stage
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/backend ./backend
COPY --chown=node:node --from=builder /app/frontend/dist ./frontend/dist
COPY --chown=node:node --from=builder /app/package.json ./package.json

# Run as non-privileged non-root user for security hardening
USER node

EXPOSE 3000

# Healthcheck probe using built-in Node fetch
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health/live').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "backend/src/server.js"]

