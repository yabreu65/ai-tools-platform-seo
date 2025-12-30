FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production --ignore-scripts

# Copy pre-built JavaScript files
COPY dist ./dist
COPY index.js ./

# Expose port
EXPOSE 3001

# Run the pre-built JavaScript
CMD ["node", "index.js"]
