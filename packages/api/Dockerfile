FROM node:22

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for ts-node)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Run with ts-node (same as local development)
CMD ["npx", "ts-node", "index.ts"]
