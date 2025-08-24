# Use Node.js 18 LTS as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port 3000
EXPOSE 3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Create upload directories with proper permissions
RUN mkdir -p /app/uploads/images /app/uploads/videos /app/uploads/pdfs
RUN mkdir -p /app/static

# Change ownership of the working directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Start the application
CMD ["npm", "run", "start:prod"]
