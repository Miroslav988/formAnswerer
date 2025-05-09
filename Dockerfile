# Use official Node.js LTS Alpine image
FROM node:22.14.0-alpine

# Install Chromium and dependencies for Puppeteer on Alpine
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  yarn

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for backend
COPY server/package*.json ./server/
# Copy package.json and package-lock.json for frontend
COPY vue-form-app/package*.json ./vue-form-app/

# Copy backend and frontend source code
COPY server ./server
COPY vue-form-app ./vue-form-app

# Install backend dependencies
RUN cd server && npm install

# Install frontend dependencies and build frontend
RUN cd vue-form-app && npm install && npm run build

# Expose port (match your server port)
EXPOSE 8080

# Start the backend server
CMD ["node", "server/index.js"]
