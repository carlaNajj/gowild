# Single-stage build — Node.js with build tools for better-sqlite3
FROM node:20-slim
WORKDIR /app

# Install build tools for better-sqlite3 native compilation
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY package*.json ./
RUN npm ci

# Copy source and build frontend
COPY . .
RUN npm run build

# Create data directory for SQLite (will be mounted as volume on Fly.io)
RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=8080
ENV DB_DIR=/data

EXPOSE 8080

CMD ["npx", "tsx", "server/index.ts"]
