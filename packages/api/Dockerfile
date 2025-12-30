# Build stage
FROM node:22 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy tsconfig.json needed for build
COPY tsconfig.json ./

# Copy source code
COPY . .

# Install dependencies and build (skip postinstall, we'll build manually)
RUN npm install --ignore-scripts && npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (no build needed)
RUN npm install --only=production --ignore-scripts

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.js ./index.js

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "index.js"]
