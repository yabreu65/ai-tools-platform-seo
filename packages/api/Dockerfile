# Build stage
FROM node:22 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (skip postinstall build script)
RUN npm install --only=production --ignore-scripts

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.js ./index.js

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "index.js"]
