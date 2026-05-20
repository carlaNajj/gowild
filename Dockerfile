# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency files first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Serve stage — lightweight nginx image
FROM nginx:alpine

# Copy built static files to nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (nginx default)
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
