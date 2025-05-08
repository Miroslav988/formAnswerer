# Use official Node.js LTS image
FROM node:22.14.0-alpine

# Install Chromium and dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
  chromium \
  chromium-driver \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

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
