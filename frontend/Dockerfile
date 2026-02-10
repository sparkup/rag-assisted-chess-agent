# Use multi-architecture Node image (works on Apple Silicon and Linux)
FROM --platform=linux/arm64 node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first (use cache)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the project files
COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Default command: start Angular app
CMD ["npm", "start"]
# syntax=docker/dockerfile:1.6

# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (cacheable)
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --legacy-peer-deps

# Copy source and build
COPY . .
# Build for production. If your Angular project uses a different build script, adjust it here.
RUN npm run build -- --configuration production

# ---------- Runtime stage ----------
FROM fholzer/nginx-brotli:v1.28.0 AS runtime

# Copy build output to Nginx html directory.
# We copy the whole dist folder contents (works even if the project name changes).
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Optional: If you use client-side routing, you may need an nginx.conf to rewrite all routes to index.html.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Nginx runs in foreground
CMD ["-g", "daemon off;"]