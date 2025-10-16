# Multi-stage build for SvelteKit production

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lock* ./

# Install dependencies
# Use npm install instead of npm ci to support projects without package-lock.json
RUN npm install --production=false

# Copy source code
COPY . .

# Set dummy environment variables for build
ENV DB_HOST=localhost \
    DB_NAME=dummy \
    DB_USERNAME=dummy \
    DB_PASSWORD=dummy \
    EMAIL_USER=build@example.com \
    EMAIL_PASS=dummy \
    SMTP_HOST=localhost \
    SMTP_PORT=587

# Build the application
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 2: Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy package.json first for dependency installation
COPY --from=builder /app/package.json ./package.json

# Install production dependencies and drizzle-kit for migrations
RUN npm install --production && \
    npm install drizzle-kit tsx --save-prod

# Copy built application from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle ./drizzle

# Copy drizzle config and schema for migrations
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/lib/server/db ./src/lib/server/db

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "build"]

