# apps/backend/Dockerfile
FROM node:20-alpine

# Install bash and other utilities (optional)
RUN apk add --no-cache bash git

# Set working directory
WORKDIR /usr/src/app

# Copy root package.json and lockfile for caching
COPY package*.json ./

# Copy backend package.json
COPY apps/backend/package*.json ./apps/backend/

# Copy packages so npm can resolve local workspace packages
COPY packages ./packages

# Install dependencies (creates workspace symlinks)
RUN npm install

# Copy backend source code
COPY apps/backend ./apps/backend

# Set working directory to backend
WORKDIR /usr/src/app/apps/backend

# Default command for dev
CMD ["npm", "run", "dev"]
